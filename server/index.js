const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const syncService = require('./syncService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main consolidated calendar API
app.get('/api/calendar', (req, res) => {
  try {
    const {
      postingMonth = '2026-11', // Default to current month Nov 2026!
      dataAddedMonth = 'all',
      client = 'all',
      clients = '',
      search = ''
    } = req.query;

    const cache = syncService.cache;
    if (!cache || !cache.posts) {
      return res.status(500).json({ error: 'Data cache not available' });
    }

    let filteredPosts = cache.posts;

    // 1. Filter by Posting Month
    if (postingMonth && postingMonth.toLowerCase() !== 'all') {
      filteredPosts = filteredPosts.filter(p => p.postingMonth === postingMonth);
    }

    // 2. Filter by Data Added Month (completely independent from posting month!)
    if (dataAddedMonth && dataAddedMonth.toLowerCase() !== 'all') {
      filteredPosts = filteredPosts.filter(p => p.dataAddedMonth === dataAddedMonth);
    }

    // 3. Filter by Selected Client(s) - Supports multiple clients
    let clientFilter = [];
    if (req.query.clients) {
      if (Array.isArray(req.query.clients)) {
        clientFilter = req.query.clients.map(s => String(s).trim()).filter(Boolean);
      } else {
        clientFilter = String(req.query.clients).split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (client && client.toLowerCase() !== 'all') {
      clientFilter = String(client).split(',').map(s => s.trim()).filter(Boolean);
    }

    if (clientFilter.length > 0) {
      const clientSet = new Set(clientFilter);
      filteredPosts = filteredPosts.filter(p => clientSet.has(p.client));
    }

    // 4. Filter by Search Query (Client name matching)
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filteredPosts = filteredPosts.filter(p => 
        p.client.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        (p.postType && p.postType.toLowerCase().includes(q))
      );
    }

    // Group posts into matrix: matrix[client][date] = [post1, post2, ...]
    const matrix = {};
    const dateSet = new Set();
    const activeClientsSet = new Set();

    filteredPosts.forEach(post => {
      dateSet.add(post.postingDate);
      activeClientsSet.add(post.client);

      if (!matrix[post.client]) {
        matrix[post.client] = {};
      }
      if (!matrix[post.client][post.postingDate]) {
        matrix[post.client][post.postingDate] = [];
      }
      matrix[post.client][post.postingDate].push(post);
    });

    // Determine the columns (dates):
    let dates = [];
    if (postingMonth && postingMonth.toLowerCase() !== 'all') {
      // If a specific month is selected (e.g. 2026-11), generate all calendar days in that month!
      const [yearStr, monthStr] = postingMonth.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10);
      const daysInMonth = new Date(y, m, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        dates.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      }
    } else {
      // For "all", sort all distinct posting dates present
      dates = Array.from(dateSet).sort();
    }

    // Clients list for table rows
    let clientList = [];
    if (clientFilter.length > 0) {
      const clientSet = new Set(clientFilter);
      clientList = cache.clients.filter(c => clientSet.has(c.name));
    } else if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      clientList = cache.clients.filter(c => c.name.toLowerCase().includes(q));
    } else {
      // Return all active clients
      clientList = cache.clients;
    }

    // Multi-post days metric
    let multiPostCount = 0;
    Object.keys(matrix).forEach(cName => {
      Object.keys(matrix[cName]).forEach(dStr => {
        if (matrix[cName][dStr].length > 1) {
          multiPostCount++;
        }
      });
    });

    res.json({
      matrix,
      dates,
      clients: clientList,
      allClients: cache.clients,
      filteredPostsCount: filteredPosts.length,
      activeClientsCount: activeClientsSet.size,
      totalDatabaseClients: cache.totalClients,
      totalDatabasePosts: cache.totalPosts,
      availablePostingMonths: cache.availablePostingMonths,
      availableDataAddedMonths: cache.availableDataAddedMonths,
      lastSyncTime: cache.lastSyncTime,
      syncSource: cache.syncSource,
      syncStatus: cache.syncStatus,
      googleSheetId: cache.googleSheetId,
      sheetUrl: cache.sheetUrl || `https://docs.google.com/spreadsheets/d/${cache.googleSheetId}/edit`,
      multiPostCount
    });
  } catch (err) {
    console.error('Error in /api/calendar:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Google Sheet URL / ID and trigger sync
app.post('/api/settings/sheet', async (req, res) => {
  try {
    const { sheetUrl } = req.body;
    if (!sheetUrl) {
      return res.status(400).json({ error: 'sheetUrl or sheetId is required' });
    }
    const result = await syncService.setSheetId(sheetUrl);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger synchronization
app.post('/api/sync', async (req, res) => {
  try {
    const result = await syncService.syncFromGoogleSheets();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new post (for testing and live timestamp tracking demonstration)
app.post('/api/posts', (req, res) => {
  try {
    const post = syncService.addCustomPost(req.body);
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Google Apps Script source code endpoint
app.get('/api/apps-script', (req, res) => {
  res.json({
    code: syncService.getGoogleAppsScriptCode(),
    sheetId: syncService.cache ? syncService.cache.googleSheetId : '1vHL3J2mBLyxLTvrBeh6O9U2LFNGOcjetWKTN2kEu55o'
  });
});

// Overall stats
app.get('/api/stats', (req, res) => {
  res.json({
    totalClients: syncService.cache.totalClients,
    totalPosts: syncService.cache.totalPosts,
    lastSyncTime: syncService.cache.lastSyncTime,
    syncSource: syncService.cache.syncSource,
    syncStatus: syncService.cache.syncStatus,
    availablePostingMonths: syncService.cache.availablePostingMonths,
    availableDataAddedMonths: syncService.cache.availableDataAddedMonths
  });
});

// Serve static frontend in production if built
const distPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Social Media Posting Calendar</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; color: #18181b; text-align: center; }
            .box { background: white; padding: 32px; border-radius: 12px; border: 1px solid #e4e4e7; max-width: 480px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            h2 { color: #059669; margin-top: 0; }
            code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
            a { color: #059669; font-weight: 600; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>Social Media Posting Calendar</h2>
            <p>API server is running successfully!</p>
            <p>To enable the web interface, run <code>npm run build</code></p>
            <p><a href="/api/calendar">View API Endpoint →</a></p>
          </div>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
