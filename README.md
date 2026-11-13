# Social Media Posting Calendar

A consolidated web application that eliminates manual cross-tab tracking by automatically aggregating posting schedules across all client worksheets from a master Google Sheets workbook into a single, unified calendar matrix.

---

## 🌟 Key Features

- **Consolidated Client Matrix**:
  - Client names dynamically listed on the left column with individual post count badges.
  - Chronological posting dates across the top with weekend indicators and "Today" highlighting.
  - Distinct checkmark (`✓`) indicates a scheduled post on that date.
  - Numbered indicator (`✓ 2`, `✓ 3`) when multiple posts are scheduled for the same client on the same day.
  - Clean dash (`—`) when no post is scheduled.
  - View density toggle (**Comfortable** vs **Compact View**) to fit dozens of client rows on screen simultaneously.
  - Horizontal and vertical sticky scrolling keeps headers and client names always in view.

- **Click-to-View Post Details Modal**:
  - Click any checkmark to view full details: Client Name, Sheet Row Number, Actual Scheduled Posting Date, Post Type, Topic, Image Content, Post Description / Body Copy (with 1-click copy), Creative Asset Link (clickable), Internal Deadline, Client Approval, Content Structuring Date, and Data Entry Date.
  - Tabbed multi-post navigation for dates with multiple posts (`Post 1 of 2`, `Post 2 of 2`).

- **Month & Year Filtering**:
  - Prominent **Month dropdown** at the top toolbar allowing single month selection (e.g. *November 2026*, *October 2026*, etc.) or **"All Months (View All)"**.
  - Previous (`<`) and Next (`>`) month navigation buttons.
  - **Today** button to immediately jump to the current active month.

- **Dynamic Client Selection & Multi-Client Support**:
  - **Default Client Focus**: Priority client list loaded automatically on startup.
  - **All Clients**: Switch to all active client worksheets with one click.
  - **Checklist Filter**: Interactive popover with instant search and individual checkboxes to select and compare any custom subset of clients.
  - Active client tag chips with quick-remove (`✕`) buttons.
  - **Automatic Detection**: Automatically detects and includes any new client worksheet added to the Google Sheet without manual code updates or configuration.

- **Data Added Month Tracking & Timestamping**:
  - Independent **Data Added Month** filter to track when posts were originally entered into the sheet (completely separate from the scheduled posting date).
  - Historical records without timestamps cleanly display `"Not Available (Historical Record)"`.
  - Built-in **Google Apps Script** generator to auto-timestamp all future entries in Google Sheets.
  - In-app **"+ Schedule Post"** action with real-time ISO timestamp recording.

- **Live Google Sheet Synchronization**:
  - Connects directly to your live Google Sheets workbook.
  - **"Refresh Sheet Data"** button pulls the latest data live from Google Sheets in seconds.
  - Live status indicator displaying the timestamp of the latest successful sync.
  - Change or reconnect Google Sheet URL anytime via the settings modal.
  - Automatically excludes internal administrative worksheets (*Dashboard, Status View, Project Scope, Blogs, Timesheets, Instructions, etc.*).
  - Built-in local cache for sub-second page loads and offline reliability.

---

## 🚀 Getting Started & Deployment

### Local Running

1. Clone the repository:
   ```bash
   git clone https://github.com/nandipatipavan25-code/Social-Calendar.git
   cd Social-Calendar
   ```

2. Install dependencies & build:
   ```bash
   npm install
   npm run build
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open [http://localhost:5000](http://localhost:5000)

---

## 🌐 Deploying to Cloud Hosts (Vercel, Render, Railway)

### Option 1: Deploy on Vercel (1-Click Deployment)
The repository includes a ready-to-use `vercel.json` and serverless API handler in `api/index.js`:
1. Go to [vercel.com/new](https://vercel.com/new) and import your repository:
   `https://github.com/nandipatipavan25-code/Social-Calendar.git`
2. Leave all settings at their default (Vercel automatically detects `vercel.json`, `npm run build`, and `client/dist`).
3. Click **Deploy**. Vercel will build and launch your live URL in under a minute!

---

### Option 2: Deploy on Render (Web Service)
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository: `https://github.com/nandipatipavan25-code/Social-Calendar.git`.
3. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Click **Deploy Web Service**. Render will build and launch your live URL!

---

### Option 3: Deploy on Railway
1. Go to [railway.app](https://railway.app/) and click **New Project > Deploy from GitHub repo**.
2. Select `Social-Calendar`.
3. Railway automatically detects `npm run build` and `npm start` and provides a live HTTPS URL.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Vite, Lucide Icons
- **Backend**: Node.js, Express, XLSX (SheetJS)
- **Data Source**: Live Google Sheets API / CSV Export with local fallback cache

---

## 📄 License

ISC License
