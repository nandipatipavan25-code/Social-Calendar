const XLSX = require('xlsx');
const path = require('path');
const https = require('https');
const fs = require('fs');

const EXCEL_PATH = path.join(__dirname, '..', 'GA_Projects_Social Calender.xlsx');
const DB_PATH = path.join(__dirname, '..', 'data_cache.json');

const INTERNAL_SHEETS = new Set([
  'form responses 1',
  'dashboard',
  'art works - status view',
  'project scope',
  'reference websites',
  'days & festivals',
  'artworks instructions',
  'artworks instructions ',
  'areas of improvement',
  'wp - darshim',
  'blogs',
  'blogs - venkat notes',
  'questions',
  'brainstorming ideas',
  'wp - manoj',
  'wp_mamatha',
  'wp - ravi teja',
  'wp-daksha',
  'feedback forms',
  'approval process'
]);

function isInternalSheet(name) {
  if (!name) return true;
  const lower = name.trim().toLowerCase();
  if (INTERNAL_SHEETS.has(lower)) return true;
  if (lower.startsWith('wp') || lower.includes('timesheet') || lower.includes('instructions') || lower.includes('responses') || lower.includes('feedback')) {
    return true;
  }
  return false;
}

function parseDateValue(val) {
  if (val === null || val === undefined || val === '') return null;
  
  if (typeof val === 'number') {
    if (val < 35000 || val > 65000) return null; // Not in realistic range (1995-2077)
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
  }

  const s = String(val).trim();
  if (!s || s === '-' || s === 'NA' || s === 'N/A') return null;

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.substring(0, 10);
  }

  // Format: DD/MM/YYYY or DD-MM-YYYY
  const m1 = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (m1) {
    let year = parseInt(m1[3], 10);
    let month = parseInt(m1[2], 10);
    let day = parseInt(m1[1], 10);
    // If month > 12, it might be MM/DD/YYYY
    if (month > 12 && day <= 12) {
      const temp = month;
      month = day;
      day = temp;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Format: MM/DD/YY or DD/MM/YY
  const m2 = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2})$/);
  if (m2) {
    let year = 2000 + parseInt(m2[3], 10);
    let month = parseInt(m2[2], 10);
    let day = parseInt(m2[1], 10);
    if (month > 12 && day <= 12) {
      const temp = month;
      month = day;
      day = temp;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Text date format like "January 9, 2026 (Friday)", "Monday, February 9, 2026", "October 30th"
  const cleanStr = s
    .replace(/\([^\)]*\)/g, '')
    .replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[,\s]*/i, '')
    .replace(/(st|nd|rd|th)/gi, '')
    .trim();

  const parsed = Date.parse(cleanStr);
  if (!isNaN(parsed)) {
    const dt = new Date(parsed);
    const yr = dt.getFullYear();
    if (yr >= 2020 && yr <= 2035) {
      return `${yr}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    }
  }

  return null;
}

function extractPostsFromWorkbook(wb, existingDataEntryMap = {}) {
  const clients = [];
  const posts = [];
  const clientNamesSet = new Set();
  const postingMonthsSet = new Set();
  const dataAddedMonthsSet = new Set();

  wb.SheetNames.forEach(sheetName => {
    const trimmedClient = sheetName.trim();
    if (isInternalSheet(trimmedClient)) return;

    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length < 2) return;

    // Find header row index
    let headerRowIndex = 0;
    for (let r = 0; r < Math.min(rows.length, 12); r++) {
      const rStr = rows[r].map(c => String(c).toLowerCase()).join(' | ');
      if (rStr.includes('topic') || rStr.includes('post type') || rStr.includes('scheduled') || rStr.includes('date') || rStr.includes('body copy') || rStr.includes('image content')) {
        headerRowIndex = r;
        break;
      }
    }

    const headerRow = rows[headerRowIndex] || [];

    // Check date distribution across Col A and Col B in data rows
    let colADateCount = 0;
    let colBDateCount = 0;
    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      if (parseDateValue(rows[r][0])) colADateCount++;
      if (parseDateValue(rows[r][1])) colBDateCount++;
    }

    // Determine the posting date column:
    // Rule from user prompt: Always use actual posting date in Column A.
    // If Column A has 0 dates and Column B has dates (like in Dr Rajesh Reddy, Beats Cardiology, etc.), use Column B.
    let dateCol = 0;
    let structuringDateCol = -1;
    if (colADateCount > 0) {
      dateCol = 0;
      if (colBDateCount > 0) structuringDateCol = 1;
    } else if (colBDateCount > 0) {
      dateCol = 1;
    } else {
      // No date found in either col A or B
      return;
    }

    // Map other columns by header name
    let postTypeCol = -1;
    let topicCol = -1;
    let imgContentCol = -1;
    let descriptionCol = -1;
    let linkCol = -1;
    let deadlineCol = -1;
    let approvalCol = -1;
    let ragStatusCol = -1;

    for (let c = 0; c < headerRow.length; c++) {
      const h = String(headerRow[c]).toLowerCase().trim();
      if (h.includes('post type')) postTypeCol = c;
      else if (h.includes('topic')) topicCol = c;
      else if (h.includes('image content')) imgContentCol = c;
      else if (h.includes('description') || h.includes('body copy')) descriptionCol = c;
      else if (h.includes('link') || h.includes('drive')) linkCol = c;
      else if (h.includes('internal deadline')) deadlineCol = c;
      else if (h.includes('client - approval') || h.includes('calendar approval') || h.includes('approval')) approvalCol = c;
      else if (h.includes('rag status') || h.includes('status')) ragStatusCol = c;
    }

    let clientPostCount = 0;

    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      const postingDate = parseDateValue(row[dateCol]);
      if (!postingDate) continue;

      const topic = topicCol >= 0 ? String(row[topicCol] || '').trim() : '';
      const imgContent = imgContentCol >= 0 ? String(row[imgContentCol] || '').trim() : '';
      const description = descriptionCol >= 0 ? String(row[descriptionCol] || '').trim() : '';
      const postType = postTypeCol >= 0 ? String(row[postTypeCol] || '').trim() : '';
      const creativeLink = linkCol >= 0 ? String(row[linkCol] || '').trim() : '';
      const deadline = deadlineCol >= 0 ? (parseDateValue(row[deadlineCol]) || String(row[deadlineCol] || '').trim()) : '';
      const approval = approvalCol >= 0 ? String(row[approvalCol] || '').trim() : '';
      const status = ragStatusCol >= 0 ? String(row[ragStatusCol] || '').trim() : '';
      const structuringDate = structuringDateCol >= 0 ? parseDateValue(row[structuringDateCol]) : null;

      // Ignore completely empty rows
      if (!topic && !imgContent && !description && !postType && !creativeLink) {
        continue;
      }

      const postId = `${trimmedClient}_${postingDate}_${clientPostCount + 1}`;

      // Data Entry Date:
      // If we have recorded an entry timestamp previously (e.g. from local additions or Sheet tracking), preserve it.
      // Otherwise, as per instructions: for historical records without a reliable timestamp, display "Not Available".
      const dataEntryDate = existingDataEntryMap[postId] || null;
      let dataAddedMonth = 'Not Available';
      if (dataEntryDate) {
        const ym = dataEntryDate.substring(0, 7);
        dataAddedMonth = ym;
        dataAddedMonthsSet.add(ym);
      }

      const postMonth = postingDate.substring(0, 7);
      postingMonthsSet.add(postMonth);

      const postObj = {
        id: postId,
        client: trimmedClient,
        postingDate,
        postingMonth: postMonth,
        postType: postType || 'Standard Creative',
        topic: topic || 'Scheduled Post',
        imgContent,
        description,
        creativeLink,
        internalDeadline: deadline || null,
        clientApproval: approval || null,
        status: status || null,
        structuringDate: structuringDate || null,
        dataEntryDate: dataEntryDate || 'Not Available',
        dataAddedMonth,
        rowIndex: r + 1,
        sheetName: trimmedClient
      };

      posts.push(postObj);
      clientPostCount++;
    }

    if (clientPostCount > 0) {
      clientNamesSet.add(trimmedClient);
      clients.push({
        name: trimmedClient,
        totalPosts: clientPostCount
      });
    }
  });

  // Sort clients alphabetically
  clients.sort((a, b) => a.name.localeCompare(b.name));

  // Sort posting months chronologically
  const availablePostingMonths = Array.from(postingMonthsSet).sort();
  
  // Available data added months
  const availableDataAddedMonths = ['Not Available', ...Array.from(dataAddedMonthsSet).sort()];

  return {
    clients,
    posts,
    availablePostingMonths,
    availableDataAddedMonths,
    totalClients: clients.length,
    totalPosts: posts.length
  };
}

module.exports = {
  EXCEL_PATH,
  DB_PATH,
  isInternalSheet,
  parseDateValue,
  extractPostsFromWorkbook
};
