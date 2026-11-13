const fs = require('fs');
const path = require('path');
const https = require('https');
const XLSX = require('xlsx');
const { EXCEL_PATH, DB_PATH: DEFAULT_DB_PATH, extractPostsFromWorkbook } = require('./extractor');

const DEFAULT_SHEET_ID = '1vHL3J2mBLyxLTvrBeh6O9U2LFNGOcjetWKTN2kEu55o';
const IS_VERCEL = !!process.env.VERCEL;
const WRITABLE_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '..');
const BUNDLED_DB_PATH = path.join(__dirname, '..', 'data_cache.json');
const BUNDLED_LIVE_XLSX = path.join(__dirname, '..', 'live_google_sheet.xlsx');

const DB_PATH = path.join(WRITABLE_DIR, 'data_cache.json');
const LIVE_XLSX_PATH = path.join(WRITABLE_DIR, 'live_google_sheet.xlsx');

class SyncService {
  constructor() {
    this.cache = null;
    this.sheetId = DEFAULT_SHEET_ID;
    this.isSyncing = false;
    this.autoSyncIntervalMinutes = 15;
    this.loadInitialData();
    // Do an immediate live sync on startup in background
    setTimeout(() => {
      this.syncFromGoogleSheets().catch(err => {
        console.warn('Initial live sync notice:', err.message);
      });
    }, 1000);
  }

  loadInitialData() {
    try {
      const pathToCheck = fs.existsSync(DB_PATH) ? DB_PATH : BUNDLED_DB_PATH;
      if (fs.existsSync(pathToCheck)) {
        const raw = fs.readFileSync(pathToCheck, 'utf8');
        this.cache = JSON.parse(raw);
        if (this.cache.googleSheetId) {
          this.sheetId = this.cache.googleSheetId;
        }
        console.log(`Loaded cache: ${this.cache.posts.length} posts, ${this.cache.clients.length} clients from sheet ${this.sheetId}`);
      } else {
        console.log('No cache found. Extracting from local Excel file...');
        this.syncFromLocal();
      }
    } catch (err) {
      console.error('Error loading cache, falling back to local Excel:', err.message);
      this.syncFromLocal();
    }
  }

  saveCache() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.cache, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write data_cache.json:', err.message);
    }
  }

  downloadLiveGoogleSheet(sheetId, destPath) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;

    const getWithRedirects = (url, depth = 0) => {
      if (depth > 5) return Promise.reject(new Error('Too many redirects while downloading Google Sheet'));

      return new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return getWithRedirects(res.headers.location, depth + 1).then(resolve).catch(reject);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`Google Sheets export returned HTTP ${res.statusCode}`));
          }
          const fileStream = fs.createWriteStream(destPath);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve(destPath);
          });
          fileStream.on('error', reject);
        }).on('error', reject);
      });
    };

    return getWithRedirects(exportUrl);
  }

  syncFromWorkbook(wb, sourceLabel) {
    const existingMap = (this.cache && this.cache.dataEntryMap) ? this.cache.dataEntryMap : {};

    const extracted = extractPostsFromWorkbook(wb, existingMap);

    // Merge any user-added custom posts
    if (this.cache && Array.isArray(this.cache.customPosts)) {
      this.cache.customPosts.forEach(cp => {
        extracted.posts.push(cp);
        existingMap[cp.id] = cp.dataEntryDate;
        const ym = cp.dataEntryDate.substring(0, 7);
        if (!extracted.availableDataAddedMonths.includes(ym)) {
          extracted.availableDataAddedMonths.push(ym);
        }
        if (!extracted.availablePostingMonths.includes(cp.postingMonth)) {
          extracted.availablePostingMonths.push(cp.postingMonth);
          extracted.availablePostingMonths.sort();
        }
      });
    }

    this.cache = {
      ...extracted,
      dataEntryMap: existingMap,
      customPosts: (this.cache && this.cache.customPosts) || [],
      lastSyncTime: new Date().toISOString(),
      syncSource: sourceLabel,
      syncStatus: 'success',
      googleSheetId: this.sheetId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit`
    };

    this.saveCache();
    return this.cache;
  }

  syncFromLocal() {
    let fileToRead = null;
    if (fs.existsSync(LIVE_XLSX_PATH)) {
      fileToRead = LIVE_XLSX_PATH;
    } else if (fs.existsSync(BUNDLED_LIVE_XLSX)) {
      fileToRead = BUNDLED_LIVE_XLSX;
    } else if (fs.existsSync(EXCEL_PATH)) {
      fileToRead = EXCEL_PATH;
    }

    if (!fileToRead) {
      throw new Error('No local spreadsheet archive found');
    }

    const wb = XLSX.readFile(fileToRead);
    return this.syncFromWorkbook(wb, 'Google Sheets (Live Cache)');
  }

  async syncFromGoogleSheets(targetSheetId = null) {
    if (targetSheetId) {
      this.sheetId = targetSheetId.trim();
    }

    if (this.isSyncing) {
      return { status: 'in-progress', message: 'Sync already in progress' };
    }

    this.isSyncing = true;
    const startTime = Date.now();
    console.log(`Starting live download from Google Sheets ID: ${this.sheetId}...`);

    try {
      await this.downloadLiveGoogleSheet(this.sheetId, LIVE_XLSX_PATH);
      
      const stats = fs.statSync(LIVE_XLSX_PATH);
      if (stats.size < 1000) {
        throw new Error('Downloaded file is too small; sheet may be private or invalid');
      }

      const wb = XLSX.readFile(LIVE_XLSX_PATH);
      const updatedCache = this.syncFromWorkbook(wb, 'Google Sheets (Live Connected)');
      
      const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Successfully fetched live data from Google Sheet in ${durationSeconds}s (${updatedCache.totalPosts} posts across ${updatedCache.totalClients} clients)`);

      this.isSyncing = false;
      return {
        success: true,
        message: `Successfully synchronized live data from Google Sheet in ${durationSeconds}s!`,
        lastSyncTime: updatedCache.lastSyncTime,
        syncSource: updatedCache.syncSource,
        totalClients: updatedCache.totalClients,
        totalPosts: updatedCache.totalPosts,
        sheetUrl: updatedCache.sheetUrl
      };
    } catch (err) {
      this.isSyncing = false;
      console.error(`Live Google Sheet download failed (${err.message}). Using local backup...`);

      // Fallback cleanly to local archive or cached workbook
      const fallbackCache = this.syncFromLocal();
      fallbackCache.syncStatus = 'warning';
      fallbackCache.syncError = err.message;
      this.cache = fallbackCache;
      this.saveCache();

      return {
        success: true,
        warning: true,
        message: `Could not connect to live Google Sheet (${err.message}). Loaded data from local archive.`,
        lastSyncTime: this.cache.lastSyncTime,
        syncSource: this.cache.syncSource,
        totalClients: this.cache.totalClients,
        totalPosts: this.cache.totalPosts,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit`
      };
    }
  }

  setSheetId(newId) {
    if (!newId) throw new Error('Sheet ID cannot be empty');
    let cleanId = newId.trim();
    const urlMatch = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch) {
      cleanId = urlMatch[1];
    }
    this.sheetId = cleanId;
    return this.syncFromGoogleSheets(cleanId);
  }

  addCustomPost(postData) {
    if (!postData.client || !postData.postingDate) {
      throw new Error('Client and postingDate are required');
    }

    const entryTimestamp = new Date().toISOString();
    const dataAddedMonth = entryTimestamp.substring(0, 7);
    const postingMonth = postData.postingDate.substring(0, 7);
    const postId = `${postData.client}_${postData.postingDate}_${Date.now()}`;

    const newPost = {
      id: postId,
      client: postData.client,
      postingDate: postData.postingDate,
      postingMonth,
      postType: postData.postType || 'Standard Creative',
      topic: postData.topic || 'New Scheduled Post',
      imgContent: postData.imgContent || '',
      description: postData.description || '',
      creativeLink: postData.creativeLink || '',
      internalDeadline: postData.internalDeadline || null,
      clientApproval: postData.clientApproval || 'Pending',
      status: 'Scheduled',
      structuringDate: postData.structuringDate || null,
      dataEntryDate: entryTimestamp,
      dataAddedMonth,
      rowIndex: 9999,
      sheetName: postData.client,
      isUserCreated: true
    };

    if (!this.cache.customPosts) this.cache.customPosts = [];
    this.cache.customPosts.push(newPost);
    this.cache.posts.push(newPost);
    this.cache.dataEntryMap[postId] = entryTimestamp;

    if (!this.cache.availableDataAddedMonths.includes(dataAddedMonth)) {
      this.cache.availableDataAddedMonths.push(dataAddedMonth);
      this.cache.availableDataAddedMonths.sort();
    }
    if (!this.cache.availablePostingMonths.includes(postingMonth)) {
      this.cache.availablePostingMonths.push(postingMonth);
      this.cache.availablePostingMonths.sort();
    }

    const cObj = this.cache.clients.find(c => c.name === postData.client);
    if (cObj) {
      cObj.totalPosts++;
    } else {
      this.cache.clients.push({ name: postData.client, totalPosts: 1 });
      this.cache.clients.sort((a, b) => a.name.localeCompare(b.name));
      this.cache.totalClients = this.cache.clients.length;
    }

    this.cache.totalPosts = this.cache.posts.length;
    this.saveCache();

    return newPost;
  }

  getGoogleAppsScriptCode() {
    return `/**
 * Google Apps Script for "Social Media Posting Calendar"
 * Automatically tracks row creation & modification timestamps across all client worksheets.
 *
 * HOW TO INSTALL:
 * 1. Open your Google Sheets workbook:
 *    https://docs.google.com/spreadsheets/d/${this.sheetId}/edit
 * 2. In top menu, click Extensions > Apps Script.
 * 3. Delete any code in the editor, paste this entire script, and click the Save icon.
 * 4. Every time someone enters a new row or updates a post, the exact
 *    creation timestamp and last-modified timestamp are recorded permanently.
 */

const INTERNAL_SHEETS = [
  'Form Responses 1', 'Dashboard', 'Art Works - Status View', 'Project Scope',
  'Reference Websites', 'Days & Festivals', 'Artworks Instructions', 'Areas of improvement',
  'WP - Darshim', 'Blogs', 'Blogs - Venkat Notes', 'Questions', 'Brainstorming Ideas',
  'WP - Manoj', 'WP_Mamatha', 'WP - Ravi Teja', 'WP-Daksha', 'Feedback Forms', 'Approval Process'
];

function onEdit(e) {
  if (!e) return;
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();

  if (INTERNAL_SHEETS.includes(sheetName) || sheetName.startsWith('WP') || sheetName.includes('Instructions')) {
    return;
  }

  const range = e.range;
  const row = range.getRow();
  if (row < 2) return;

  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, Math.max(lastCol, 20)).getValues()[0];
  
  let createdCol = -1;
  let updatedCol = -1;

  for (let c = 0; c < headers.length; c++) {
    const h = String(headers[c]).toLowerCase().trim();
    if (h.includes('data entry date') || h.includes('created at') || h.includes('data_entry_date')) {
      createdCol = c + 1;
    }
    if (h.includes('last updated') || h.includes('updated_at')) {
      updatedCol = c + 1;
    }
  }

  if (createdCol === -1) {
    createdCol = Math.max(lastCol + 1, 14);
    sheet.getRange(1, createdCol).setValue('DATA_ENTRY_DATE');
  }
  if (updatedCol === -1) {
    updatedCol = createdCol + 1;
    sheet.getRange(1, updatedCol).setValue('LAST_UPDATED_DATE');
  }

  const now = new Date();
  const formattedTimestamp = Utilities.formatDate(now, e.source.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  const existingCreated = sheet.getRange(row, createdCol).getValue();
  if (!existingCreated) {
    sheet.getRange(row, createdCol).setValue(formattedTimestamp);
  }

  sheet.getRange(row, updatedCol).setValue(formattedTimestamp);
}
`;
  }
}

module.exports = new SyncService();
