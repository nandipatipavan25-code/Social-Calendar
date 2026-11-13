const path = require('path');
const fs = require('fs');
const express = require('express');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Serve static frontend in standalone/production mode
const distPath = fs.existsSync(path.join(__dirname, '..', 'dist'))
  ? path.join(__dirname, '..', 'dist')
  : path.join(__dirname, '..', 'client', 'dist');
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
