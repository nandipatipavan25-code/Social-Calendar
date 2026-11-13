# Social Media Posting Calendar

A consolidated web application that eliminates manual cross-tab tracking by automatically aggregating posting schedules across all client worksheets from Google Sheets into a single, unified calendar matrix.

![Social Media Posting Calendar](https://raw.githubusercontent.com/nandipatipavan25-code/Social-Calendar/main/preview.png)

---

## 🌟 Key Features

- **Consolidated Client Matrix**:
  - Client names fixed on the left with individual total post counts.
  - Chronological posting dates across the top with weekend indicators and "Today" highlighting.
  - Green checkmark (`✓`) indicates a scheduled post on that date.
  - Clean indicator with count (`✓ 2`, `✓ 3`) when multiple posts are scheduled for the same client on the same day.
  - Clean dash (`—`) when no post is scheduled.
  - View density toggle (**Comfortable** vs **Compact View**).

- **Click-to-View Post Details Modal**:
  - Click any checkmark to view full details: Client Name, Row Number, Actual Scheduled Posting Date, Post Type, Topic, Image Content, Post Description / Body Copy (with 1-click copy), Creative Asset Link (clickable), Internal Deadline, Client Approval, Content Structuring Date (Col B), and Data Entry Date.
  - Tabbed multi-post navigation for dates with multiple posts (`Post 1 of 2`, `Post 2 of 2`).

- **Month & Year Filtering**:
  - Prominent **Month dropdown** at the top toolbar allowing single month selection (e.g. *November 2026*, *October 2026*, etc.) or **"All Months (View All)"**.
  - Previous (`<`) / Next (`>`) month buttons and **Today** button to immediately jump to the current month.

- **Dynamic Client Selection & Multi-Client Support**:
  - **Initial Selection (9 Priority Clients)** loaded by default:
    1. Dr. Rajesh Reddy
    2. Clear Skin
    3. Brain to Spine
    4. Healing Hastha
    5. GA Digital
    6. GA Consulting
    7. GA HireSync
    8. Pave Path
    9. JDP & Co Charted Accountants
  - **All Clients**: Switch to all 48 clients with one click.
  - **Checklist Filter**: Interactive popover with search and individual checkboxes to compare any custom subset of clients.
  - Selected client tag chips with quick-remove (`✕`) buttons.

- **Data Added Month Tracking & Timestamping**:
  - Independent **Data Added Month** filter to track when posts were originally entered into the sheet.
  - Historical records without timestamps cleanly display `"Not Available (Historical Record)"`.
  - Built-in **Google Apps Script** generator to auto-timestamp all future entries in Google Sheets.
  - In-app **"+ Schedule Post"** action with real-time ISO timestamp recording.

- **Live Google Sheet Synchronization**:
  - Connected directly to Google Sheet workbook `1vHL3J2mBLyxLTvrBeh6O9U2LFNGOcjetWKTN2kEu55o`.
  - **"Refresh Sheet Data"** button pulls the latest data live from Google Sheets in seconds.
  - Live status indicator displaying the timestamp of the latest successful sync.
  - Change/reconnect Google Sheet URL anytime via the settings modal.
  - Automatically excludes internal administrative worksheets (*Dashboard, Art Works - Status View, Project Scope, Blogs, Timesheets, etc.*).
  - High-speed local cache for sub-second page loads and offline reliability.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (installed with Node)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nandipatipavan25-code/Social-Calendar.git
   cd Social-Calendar
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install && npm run build && cd ..
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Vite, Lucide React
- **Backend**: Node.js, Express, XLSX (SheetJS)
- **Data Source**: Live Google Sheets API / CSV Export with local fallback archive

---

## 📄 License

ISC License
