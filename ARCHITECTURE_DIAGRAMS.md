# Excel/CSV Import Feature - Architecture & Flow Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Import Excel    │  │   Edit Data      │  │   Schedule   │  │
│  │    Component     │  │   Component      │  │    Call      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────────┘  │
│           │                     │                                 │
│           └─────────────────────┴──────────┬──────────────────┘  │
│                                           │                      │
│                                    ┌──────▼────────┐             │
│                                    │  ImportContext│             │
│                                    │   (State)     │             │
│                                    └───────────────┘             │
│                                           │                      │
│                                    ┌──────▼─────────────┐        │
│                                    │   API Client       │        │
│                                    │  (api.import)      │        │
│                                    └──────┬─────────────┘        │
│                                           │                      │
└───────────────────────────────────────────┼──────────────────────┘
                                            │
                            ┌───────────────▼──────────────┐
                            │    HTTP (Fetch API)         │
                            │   CORS Enabled              │
                            │   Bearer Token              │
                            └───────────────┬──────────────┘
                                            │
                                            │
┌───────────────────────────────────────────┼──────────────────────┐
│                   BACKEND (Node.js/Express)                      │
├───────────────────────────────────────────┼──────────────────────┤
│                                           │                      │
│                            ┌──────────────▼──────────────┐        │
│                            │   Import Routes            │        │
│                            │  /api/import/*             │        │
│                            └──────────────┬──────────────┘        │
│                                           │                      │
│                 ┌─────────────────────────┼───────────────────┐  │
│                 │                         │                   │  │
│        ┌────────▼─────────┐    ┌─────────▼──────┐   ┌────────▼─┐│
│        │  Multer Middleware│   │ Auth Middleware│   │ importC. ││
│        │  • File Upload    │   │ • JWT Verify   │   │ • Parse  ││
│        │  • Validation     │   │ • User Check   │   │ • Save   ││
│        │  • Memory Storage │   └────────────────┘   │ • History││
│        └────────┬──────────┘                        └────────┬─┘
│                 │                                            │
│                 └────────────────────┬──────────────────────┘
│                                      │
│                           ┌──────────▼─────────┐
│                           │   MongoDB Atlas    │
│                           │  ScheduledCall     │
│                           │  Collection        │
│                           └────────────────────┘
│
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

### Import Process Flow
```
User Action               Frontend                Backend            Database
   │                         │                        │                 │
   ├─ Select File ─────────→ │                        │                 │
   │                         │                        │                 │
   ├─ Upload File ─────────→ │─── POST /upload ──────→ │                 │
   │                         │    (multipart/form)    │                 │
   │                         │                    (Parse)              │
   │                         │                    (Validate)           │
   │                         │ ← JSON Response ────│                 │
   │                         │ (data + errors)    │                 │
   │ ← Show Preview ◄────────│                    │                 │
   │                         │                    │                 │
   ├─ Edit Rows ────────────→ │                    │                 │
   │ ├─ Delete Rows          │                    │                 │
   │ ├─ Add Rows             │ Context API Update   │                 │
   │ └─ Update Cells         │                    │                 │
   │                         │                    │                 │
   ├─ Select Mode ─────────→ │ ┌─ Add New ──┐   │                 │
   │ (Add/Update)            │ │ - Update   │   │                 │
   │                         │ └────────────┘   │                 │
   │                         │                    │                 │
   ├─ Click Save ──────────→ │─ POST /save ─────→ │                 │
   │                         │  (JSON calls)     │                 │
   │                         │                (Bulk Insert/Update)  │
   │                         │                  ├─→ Create Docs ───→ │
   │                         │                  │                    │
   │                         │ ← JSON Response ─│                 │
   │ ← Show Success ◄────────│ (saved + errors) │                 │
   │                         │                  │                 │
   └─ Clear Data ──────────→ │ Context.clearData() │                 │
```

### Edit/Search Flow
```
User Action               Frontend                Backend            Database
   │                         │                        │                 │
   ├─ Navigate ────────────→ │ Fetch All Calls      │                 │
   │ to Edit Data            │ GET /scheduled-calls → │                 │
   │                         │                        │ ← Query ────────→ │
   │                         │                        │   Find All       │
   │                         │                        │ ← Results ────←──│
   │ ← Display Table ◄───────│                        │                 │
   │                         │                        │                 │
   ├─ Search/Filter ───────→ │ Client-side Filter    │                 │
   │                         │ (No API Call)          │                 │
   │ ← Update Table ◄────────│                        │                 │
   │                         │                        │                 │
   ├─ Click Edit ──────────→ │ Inline Edit Mode      │                 │
   │                         │ (No API Call yet)      │                 │
   │                         │                        │                 │
   ├─ Modify & Save ───────→ │ PUT /scheduled-calls/:id → │              │
   │                         │                           │ Update Doc   │
   │                         │                           │ in DB ────────→ │
   │                         │ ← Success Response ──←│                 │
   │ ← Show Updated ◄────────│                        │                 │
   │                         │                        │                 │
   ├─ Change Status ───────→ │ PATCH /status ────────→ │                 │
   │                         │                        │ Update Status  │
   │                         │                        │ ─────────────→ │
   │ ← Status Updated ◄──────│                        │                 │
   │                         │                        │                 │
   └─ Delete ──────────────→ │ DELETE /scheduled-calls/:id → │          │
                             │                           │ Delete Doc    │
                             │ ← Success Response ──←│                 │
                             │                        │                 │
```

## 📦 Component Hierarchy

```
App
│
├─ AuthProvider
│  └─ ImportProvider
│     └─ Layout
│        ├─ Navigation
│        │  ├─ Dashboard (page: 'dashboard')
│        │  ├─ Call Logs (page: 'logs')
│        │  ├─ Schedule Call (page: 'schedule')
│        │  ├─ Import Excel (page: 'import') ✨ NEW
│        │  └─ Edit Data (page: 'edit-data') ✨ NEW
│        │
│        └─ Page Content
│           ├─ Dashboard
│           ├─ CallLogs
│           ├─ ScheduleCall
│           ├─ ImportScheduledCalls ✨ NEW
│           │  └─ ExcelImport ✨ NEW
│           │     ├─ Upload Area
│           │     ├─ Mode Selection
│           │     ├─ Stats Cards
│           │     ├─ Error Display
│           │     ├─ Data Table
│           │     ├─ Edit Form
│           │     └─ Save Button
│           │
│           └─ EditImportData ✨ NEW
│              ├─ Search Bar
│              ├─ Filter Panel
│              ├─ Data Table
│              ├─ Edit Modal
│              └─ Status Controls
```

## 🔐 Authentication Flow

```
User Login                     Frontend                Backend            Database
   │                              │                        │                 │
   ├─ Email + Password ─────────→ │─ POST /auth/signin ──→ │                 │
   │                              │                        │ Find User ──────→ │
   │                              │                        │ ← User Doc ──←──│
   │                              │                      (Hash Check)         │
   │                              │ ← Token Response ────│                 │
   │ ← Token Stored ◄─────────────│ localStorage          │                 │
   │                              │                        │                 │
   │ All API Calls                │                        │                 │
   ├─ Request + Bearer Token ────→ │─ POST /import/upload → │                 │
   │ (Header: Authorization)      │ + Token             (JWT Verify)        │
   │                              │                    (userId Extract)      │
   │                              │ ← Response ────────│                 │
   │ ← Data Received ◄────────────│                        │                 │
```

## 🗂️ File Structure Tree

```
calling/
│
├── backend/
│   ├── server/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── callController.js
│   │   │   ├── scheduledCallController.js
│   │   │   └── importController.js ✨ NEW
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Call.js
│   │   │   └── ScheduledCall.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── callRoutes.js
│   │   │   ├── scheduledCallRoutes.js
│   │   │   └── importRoutes.js ✨ NEW
│   │   └── index.js (modified)
│   │
│   ├── package.json (modified)
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx (modified)
│   │   │   └── ExcelImport.jsx ✨ NEW
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ImportContext.jsx ✨ NEW
│   │   ├── pages/
│   │   │   ├── Auth.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CallLogs.jsx
│   │   │   ├── ScheduleCall.jsx
│   │   │   ├── ImportScheduledCalls.jsx ✨ NEW
│   │   │   ├── EditImportData.jsx ✨ NEW
│   │   │   └── App.jsx (modified)
│   │   └── lib/
│   │       └── api.js (modified)
│   │
│   ├── package.json
│   └── README.md
│
├── EXCEL_IMPORT_GUIDE.md ✨ NEW
├── IMPLEMENTATION_SUMMARY.md ✨ NEW
└── QUICK_START_GUIDE.md ✨ NEW
```

## 🔄 State Management (Context API)

```
ImportProvider (Context)
│
├─ importedData: Call[]
│  └─ { name, phoneNumber, scheduledTime, message, notes, ... }
│
├─ importErrors: Error[]
│  └─ { row, error }
│
├─ importStats: Stats
│  ├─ totalRows: number
│  └─ validRows: number
│
└─ Methods:
   ├─ setData(data)
   ├─ setErrors(errors)
   ├─ setStats(stats)
   ├─ addCall(call)
   ├─ updateCall(index, call)
   ├─ removeCall(index)
   └─ clearData()
```

## 📡 API Endpoints Overview

```
POST /api/import/upload
├─ Input: multipart/form-data (file)
├─ Process: Parse & Validate
└─ Output: {data, errors, stats}

POST /api/import/save
├─ Input: {calls[], mode}
├─ Process: Add/Update Documents
└─ Output: {saved, errors}

GET /api/import/history
├─ Input: (none)
├─ Process: Query Database
└─ Output: [Call[], Call[], ...]
```

## 🎨 UI Component Layout

```
ExcelImport Component
│
├─ Upload Section
│  ├─ Drag & Drop Area
│  ├─ File Input Button
│  └─ Upload Button
│
├─ Mode Selection (if data loaded)
│  ├─ Radio: Add New
│  └─ Radio: Update
│
├─ Stats Cards (if data loaded)
│  ├─ Total Rows
│  ├─ Valid Rows
│  └─ Invalid Rows
│
├─ Error Display (if errors exist)
│  └─ Error List with Row Numbers
│
├─ Data Table (if data loaded)
│  ├─ Column Headers
│  ├─ Data Rows (editable)
│  ├─ Edit Mode Row
│  └─ Action Buttons
│
├─ Add Form (optional)
│  ├─ Input Fields
│  └─ Add Button
│
└─ Save Section
   └─ Save All Button
```

## 🎯 Error Handling Flow

```
User Action
   │
   ├─ File Upload
   │  ├─ Invalid File Type ──→ Show Error: "Unsupported format"
   │  ├─ File Too Large ──────→ Show Error: "File > 10MB"
   │  └─ OK ─────────────────→ Continue
   │
   ├─ File Parse
   │  ├─ Corrupted File ──────→ Show Error: "Can't read file"
   │  ├─ Empty File ──────────→ Show Error: "No data found"
   │  └─ OK ─────────────────→ Continue
   │
   ├─ Data Validation
   │  ├─ Missing Required ────→ Row Error: "Phone/Time required"
   │  ├─ Invalid Date ────────→ Row Error: "Invalid date format"
   │  ├─ Invalid Phone ──────→ Row Error: "Invalid phone"
   │  └─ OK ─────────────────→ Continue
   │
   ├─ Save to DB
   │  ├─ DB Connection Error ─→ Show Error: "Server error"
   │  ├─ Duplicate ID (update)→ Row Error: "Not found"
   │  └─ OK ─────────────────→ Show Success & Clear
   │
   └─ Display Feedback
      └─ Success Message with Count
```

---

## Legend

- `✨ NEW` - Newly created files
- `(modified)` - Previously existing files that were updated
- `→` - Data flow direction
- `←` - Response direction
- `│` - Hierarchy/connection line

