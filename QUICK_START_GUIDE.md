# Quick Start Guide - Excel/CSV Import Feature

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
npm run dev
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Create Excel File
Open Excel/Sheets and create a file with these columns:

```
Contact Name | Phone Number | Scheduled Time | Message | Notes
John Doe | +1234567890 | 2024-01-15 10:30 | Follow-up | VIP
Jane Smith | +9876543210 | 2024-01-16 14:00 | Check-in | Regular
```

**Required columns:** Phone Number, Scheduled Time
**Optional columns:** Contact Name, Message, Notes

### Step 4: Import
1. Click "Import Excel" in sidebar
2. Upload your file
3. Review data
4. Click "Save All Calls"

Done! ✨

---

## 📋 Excel Template Examples

### Minimal Template (Required Fields Only)
```
Phone Number | Scheduled Time
+1234567890 | 2024-01-15 10:30:00
+9876543210 | 2024-01-16 14:00:00
```

### Complete Template (All Fields)
```
Contact Name | Phone Number | Scheduled Time | Message | Notes
John Doe | +1234567890 | 2024-01-15 10:30:00 | Follow-up call | VIP client, high priority
Jane Smith | +9876543210 | 2024-01-16 14:00:00 | Check-in call | Regular follow-up
Bob Johnson | +1111111111 | 2024-01-17 09:00:00 | Sales call | New prospect
```

### Alternative Column Names (All Supported)
```
Name | Phone | ScheduledTime | Message | Notes
---OR---
name | phoneNumber | scheduled_time | message | notes
---OR---
Contact Name | Phone Number | Scheduled Time | Message | Notes
---OR---
CONTACT_NAME | PHONE_NUMBER | SCHEDULED_TIME | MESSAGE | NOTES
```

### Date Format Examples (All Supported)
```
2024-01-15 10:30:00     [ISO format recommended]
1/15/2024 10:30 AM      [US format]
15-01-2024 10:30        [EU format]
2024-01-15T10:30:00     [ISO with T]
01/15/2024 14:00        [Alternative US]
```

---

## 🔍 Supported Flexible Column Names

### Phone Number Column
- `phoneNumber`
- `phone`
- `Phone Number`
- `phone number`
- `Phone`
- `PHONE_NUMBER`

### Scheduled Time Column
- `scheduledTime`
- `scheduled_time`
- `Scheduled Time`
- `scheduled time`
- `DateTime`
- `datetime`

### Contact Name Column
- `name`
- `Name`
- `Contact Name`
- `contact_name`
- `ContactName`

### Message Column
- `message`
- `Message`
- `MESSAGE`

### Notes Column
- `notes`
- `Notes`
- `NOTES`

---

## ✅ Pre-Import Checklist

- [ ] File is .xlsx, .xls, or .csv
- [ ] File size is less than 10MB
- [ ] First row contains headers
- [ ] Phone number column exists
- [ ] Scheduled time column exists
- [ ] Date format is recognizable
- [ ] No special characters in phone (except +, -, ())
- [ ] No empty rows in middle of data

---

## 🐛 Troubleshooting

### "File upload failed"
**Solutions:**
- Check file format (.xlsx, .xls, or .csv)
- Ensure file is less than 10MB
- Try renaming file (remove special characters)
- Clear browser cache and try again

### "No valid records to import"
**Possible causes:**
- Missing required columns (Phone Number, Scheduled Time)
- Column names don't match expected names
- All rows have validation errors

**Solution:**
Check column headers and row data match the template

### "Phone number and scheduled time are required"
**Causes:**
- One or both columns are missing
- Column names are different

**Solution:**
Ensure columns are named exactly:
- `phoneNumber` or `Phone Number`
- `scheduledTime` or `Scheduled Time`

### "Invalid date format"
**Causes:**
- Date format not recognized
- Invalid date (e.g., 2024-13-45)

**Solution:**
Use standard date format: YYYY-MM-DD HH:MM:SS

### "Database save failed"
**Causes:**
- MongoDB connection issue
- Duplicate records (if using update mode)

**Solution:**
- Check MongoDB is running
- Use "Add New" mode instead of "Update"

### "Can't see new navigation items"
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart frontend server
- Refresh page (Ctrl+F5)

### "Import button not working"
**Solution:**
- Check browser console for errors (F12)
- Verify backend is running
- Check network tab for API requests
- Ensure token is valid

---

## 📊 Example Data Flows

### Scenario 1: Adding New Calls
```
User uploads file → System parses → Displays 10 calls → User clicks "Save" → 
Selects "Add New" mode → Database now has 10 new calls
```

### Scenario 2: Updating Existing Calls
```
User uploads file → System parses → Displays 5 calls with _id → 
User edits data → Clicks "Save" → Selects "Update Existing" → 
Database updates those 5 calls
```

### Scenario 3: Editing Before Save
```
User uploads file → System shows 8 calls → 2 rows have errors → 
User clicks edit on 3 rows → Modifies data → Deletes 2 error rows → 
Clicks "Save All 6 Calls" → Saves 6 calls to database
```

---

## 🎯 Common Use Cases

### Use Case 1: Bulk Import New Leads
1. Export leads from CRM to Excel
2. Select only: Name, Phone, Date to call
3. Upload to "Import Excel"
4. Review and save with "Add New" mode
5. View all calls in "Call Logs"

### Use Case 2: Update Call Dates
1. Export current calls with _id
2. Update scheduled times in Excel
3. Upload file
4. Select "Update Existing" mode
5. Save - dates are updated

### Use Case 3: Mixed Import & Edit
1. Upload file with 20 calls
2. Delete 5 calls that are wrong
3. Edit 3 calls with incorrect phone
4. Manually add 2 missing calls
5. Save 14 valid calls

---

## 🔧 Configuration

### File Size Limit
**Current:** 10MB
**To change:** Edit `backend/server/routes/importRoutes.js`
```javascript
limits: {
  fileSize: 50 * 1024 * 1024, // 50MB
}
```

### Allowed File Types
**Current:** .xlsx, .xls, .csv
**To add more:** Edit multer fileFilter in `importRoutes.js`

---

## 📈 Best Practices

✅ **DO:**
- Use standard column names (matching template)
- Use ISO date format (YYYY-MM-DD)
- Keep file size under 5MB
- Review errors before saving
- Use "Add New" for new records
- Use "Update" only when you have _id

❌ **DON'T:**
- Upload corrupted files
- Use weird date formats
- Leave required fields empty
- Upload 100MB+ files
- Mix add/update in same file
- Delete data without backup

---

## 📞 Support

### Getting Help
1. Check this guide first
2. Review EXCEL_IMPORT_GUIDE.md
3. Check browser console (F12)
4. Review API response in Network tab
5. Check backend server logs

### Error Messages Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| "Unsupported file format" | File is not Excel/CSV | Use .xlsx, .xls, or .csv |
| "No file uploaded" | Upload area received empty | Try again |
| "No data found" | File is empty or unreadable | Check file content |
| "Phone number... required" | Missing required data | Check all rows have both fields |
| "Invalid date format" | Date can't be parsed | Use YYYY-MM-DD format |
| "Call not found" | ID doesn't exist | Don't use update mode for new data |
| "Server error" | Backend issue | Check server logs |

---

## 🎓 Tips & Tricks

### Tip 1: Validate Before Upload
Open file in Excel, sort by phone number to see duplicates

### Tip 2: Create Template
Keep a template Excel file to copy/paste data into

### Tip 3: Batch Operations
Import in batches of 100+ records for efficiency

### Tip 4: Export Then Re-import
Use "Edit Data" to export, modify in Excel, re-import

### Tip 5: Use Status Filter
Filter calls by status after import to track them

---

## 📚 Related Documentation

- `EXCEL_IMPORT_GUIDE.md` - Detailed feature guide
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- Backend code: `backend/server/controllers/importController.js`
- Frontend code: `frontend/src/components/ExcelImport.jsx`

---

## ✨ Feature Roadmap (Future Enhancements)

- [ ] Export data to Excel
- [ ] Schedule bulk calls
- [ ] Duplicate detection
- [ ] Field mapping UI
- [ ] Import templates
- [ ] Batch status update
- [ ] Rollback capability
- [ ] Import history tracking
- [ ] Webhook notifications
- [ ] API webhooks

---

**Version:** 1.0.0
**Last Updated:** November 2024
**Status:** Production Ready ✅
