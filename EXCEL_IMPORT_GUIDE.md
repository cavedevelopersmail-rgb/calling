# Excel/CSV Import Feature - Implementation Guide

## Overview
This implementation adds a complete Excel/CSV import feature to your calling application, allowing users to:
- Import scheduled calls from Excel (.xlsx, .xls) or CSV files
- Preview and edit imported data before saving
- Add new calls manually
- Edit, update, and delete calls
- Save with two modes: "Add New" or "Update Existing"

## Backend Implementation

### 1. **Packages Added** (backend/package.json)
```
- xlsx: For reading Excel files
- multer: For handling file uploads
- papaparse: For parsing CSV files
```

**Install them with:**
```bash
cd backend
npm install
```

### 2. **New Backend Files Created**

#### a. `backend/server/controllers/importController.js`
Handles file parsing and data validation:
- `importScheduledCalls`: Parses Excel/CSV and validates data
- `saveImportedCalls`: Saves validated calls to MongoDB with add/update modes
- `getImportHistory`: Retrieves import history

#### b. `backend/server/routes/importRoutes.js`
Three main endpoints:
- `POST /api/import/upload` - Upload and parse file
- `POST /api/import/save` - Save parsed calls to database
- `GET /api/import/history` - Get all imported calls

#### c. Updated `backend/server/index.js`
Added import routes to the Express app:
```javascript
app.use('/api/import', importRoutes);
```

### 3. **Field Mapping**
The import controller automatically maps flexible column names:
- `phoneNumber` / `phone` / `Phone Number` / `phone number`
- `scheduledTime` / `scheduled_time` / `Scheduled Time`
- `name` / `Name` / `Contact Name`
- `message` / `Message`
- `notes` / `Notes`

## Frontend Implementation

### 1. **New Context** - `frontend/src/contexts/ImportContext.jsx`
Manages imported data state across components using Context API:
- `importedData`: Array of parsed calls
- `importErrors`: Validation errors
- `importStats`: Statistics (total rows, valid rows)
- Methods: `setData`, `setErrors`, `setStats`, `addCall`, `updateCall`, `removeCall`, `clearData`

### 2. **New Components**

#### a. `ExcelImport.jsx` - Import & Preview Component
Features:
- File upload with drag-and-drop area
- File type validation (.xlsx, .xls, .csv)
- Real-time parsing and validation
- Stats display (total, valid, invalid rows)
- Error messages for invalid rows
- Editable data table with row-by-row editing
- Add new calls manually
- Delete rows
- Save with mode selection (Add/Update)

#### b. `EditImportData.jsx` - Edit Database Records
Features:
- Search by name, phone, or message
- Filter by status (Pending, Completed, Cancelled, Failed)
- Inline editing of records
- Status management
- Delete records
- Real-time data refresh
- Responsive table design

### 3. **New Pages**

#### a. `ImportScheduledCalls.jsx`
Main page wrapper for the import component

#### b. `EditImportData.jsx`
Dedicated page for editing existing calls in the database

### 4. **Updated Files**

#### a. `App.jsx`
- Added `ImportProvider` wrapper
- Imported new pages and components
- Added routes for 'import' and 'edit-data' pages
- Updated `renderPage()` switch statement

#### b. `Layout.jsx`
- Added `FileSpreadsheet` icon import
- Added two new navigation items:
  - "Import Excel" → page: 'import'
  - "Edit Data" → page: 'edit-data'

#### c. `lib/api.js`
Added `import` API methods:
```javascript
api.import.upload(formData)    // Upload and parse file
api.import.save(data)          // Save to database
api.import.getHistory()        // Get import history
```

## How to Use

### Backend Setup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Make sure MongoDB is running and `MONGODB_URI` is set in `.env`

3. Start the backend:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Make sure all new files are in place
2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### Using the Feature

#### **Step 1: Import Excel/CSV**
1. Navigate to "Import Excel" from the sidebar
2. Click "Choose File" and select your Excel or CSV file
3. Required columns: `phoneNumber` and `scheduledTime`
4. Optional columns: `name`, `message`, `notes`
5. Click "Upload & Parse File"

#### **Step 2: Review & Edit**
1. System shows stats (Total, Valid, Invalid rows)
2. View any errors that occurred during parsing
3. Edit individual rows by clicking the edit icon
4. Add new calls manually using the "Add New Call Manually" button
5. Delete rows as needed

#### **Step 3: Save to Database**
1. Choose save mode:
   - **Add New**: Creates new call records
   - **Update Existing**: Updates existing records (requires `_id`)
2. Click "Save All [X] Calls to Database"

#### **Step 4: Manage Existing Data**
1. Navigate to "Edit Data" from the sidebar
2. Search by name, phone, or message
3. Filter by status
4. Click edit icon to modify records
5. Click status dropdown to change status
6. Click trash icon to delete records

## API Documentation

### File Upload & Parse
```
POST /api/import/upload
Content-Type: multipart/form-data
Body: file (Excel or CSV)

Response:
{
  "message": "Successfully processed X records",
  "data": [...parsed calls],
  "errors": [...validation errors],
  "totalRows": number,
  "validRows": number
}
```

### Save Imported Calls
```
POST /api/import/save
Content-Type: application/json
Body: {
  "calls": [...call objects],
  "mode": "add" | "update"
}

Response:
{
  "message": "Successfully saved X calls",
  "data": [...saved calls],
  "errors": [...save errors if any]
}
```

### Get Import History
```
GET /api/import/history

Response: [Array of all scheduled calls]
```

## Example Excel Template

Create an Excel file with these columns:

| Contact Name | Phone Number | Scheduled Time | Message | Notes |
|---|---|---|---|---|
| John Doe | +1234567890 | 2024-01-15 10:30 AM | Follow-up call | VIP client |
| Jane Smith | +9876543210 | 2024-01-16 2:00 PM | Check in | Regular |

## Data Validation

The system validates:
- ✅ Phone number is required and present
- ✅ Scheduled time is required and valid date format
- ✅ Date format can be: ISO 8601, common formats, or numbers
- ✅ No duplicate saves (data is deduplicated before save)

## Error Handling

Errors are displayed in two places:
1. **Row-level errors**: Shown when parsing fails for specific rows
2. **Save errors**: Shown when database operation fails
3. All errors include row number and error message

## Features Summary

✨ **Import Features**
- Upload Excel/CSV files
- Flexible column name mapping
- Real-time validation and parsing
- Error tracking and reporting

📝 **Edit Features**
- Search and filter capabilities
- Inline editing of records
- Status management
- Batch operations support

🔄 **Data Management**
- Add/Update modes
- Delete records
- Refresh data
- View history

## Browser Support

Works on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## File Size Limits

- Maximum file size: 10MB
- No limit on number of rows (depends on system memory)

## Next Steps (Optional Enhancements)

1. Add bulk status update
2. Export data to Excel
3. Schedule bulk calls
4. Import history with rollback
5. Duplicate detection and handling
6. Field mapping customization UI
7. Import templates download

## Troubleshooting

**File upload failing?**
- Ensure file is .xlsx, .xls, or .csv
- File should be less than 10MB
- Check browser console for error messages

**Data not saving?**
- Verify MongoDB connection
- Check that required fields are present
- Review error messages in the response

**Can't see new pages?**
- Clear browser cache
- Ensure all files were created correctly
- Restart development servers (frontend and backend)
