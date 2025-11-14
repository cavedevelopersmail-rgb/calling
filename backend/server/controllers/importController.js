const ScheduledCall = require('../models/ScheduledCall');
const XLSX = require('xlsx');
const Papa = require('papaparse');

exports.importScheduledCalls = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    let parsedData = [];

    // Parse Excel or CSV file
    if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
    } else if (originalName.endsWith('.csv')) {
      // Parse CSV file
      const csvText = fileBuffer.toString('utf-8');
      const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      parsedData = result.data;
    } else {
      return res.status(400).json({ message: 'Unsupported file format. Use .xlsx, .xls, or .csv' });
    }

    if (!parsedData || parsedData.length === 0) {
      return res.status(400).json({ message: 'No data found in the file' });
    }

    // Validate and transform data
    const transformedCalls = [];
    const errors = [];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      try {
        // Map flexible column names to expected fields
        const phoneNumber = row.phoneNumber || row.phone || row['Phone Number'] || row['phone number'];
        const scheduledTime = row.scheduledTime || row.scheduled_time || row['Scheduled Time'] || row['scheduled time'];
        const name = row.name || row.Name || row['Contact Name'] || row['contact name'];
        const message = row.message || row.Message || row['Message'];
        const notes = row.notes || row.Notes || row['Notes'];

        if (!phoneNumber || !scheduledTime) {
          errors.push({
            row: i + 2,
            error: 'Phone number and scheduled time are required',
          });
          continue;
        }

        // Parse and validate date
        let parsedDate = new Date(scheduledTime);
        if (isNaN(parsedDate.getTime())) {
          errors.push({
            row: i + 2,
            error: `Invalid date format: ${scheduledTime}`,
          });
          continue;
        }

        transformedCalls.push({
          phoneNumber: String(phoneNumber).trim(),
          scheduledTime: parsedDate,
          name: String(name || '').trim(),
          message: String(message || '').trim(),
          notes: String(notes || '').trim(),
          userId: req.userId,
        });
      } catch (error) {
        errors.push({
          row: i + 2,
          error: error.message,
        });
      }
    }

    if (transformedCalls.length === 0) {
      return res.status(400).json({ 
        message: 'No valid records to import', 
        errors 
      });
    }

    res.status(200).json({
      message: `Successfully processed ${transformedCalls.length} records`,
      data: transformedCalls,
      errors: errors.length > 0 ? errors : null,
      totalRows: parsedData.length,
      validRows: transformedCalls.length,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Server error during import', error: error.message });
  }
};

exports.saveImportedCalls = async (req, res) => {
  try {
    const { calls, mode } = req.body;

    if (!calls || !Array.isArray(calls) || calls.length === 0) {
      return res.status(400).json({ message: 'No calls data provided' });
    }

    if (!['add', 'update'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode. Use "add" or "update"' });
    }

    let savedCalls = [];
    let errors = [];

    for (let i = 0; i < calls.length; i++) {
      try {
        const callData = calls[i];
        callData.userId = req.userId;

        if (mode === 'add') {
          const newCall = new ScheduledCall(callData);
          const saved = await newCall.save();
          savedCalls.push(saved);
        } else if (mode === 'update' && callData._id) {
          // Update existing call
          const updated = await ScheduledCall.findOneAndUpdate(
            { _id: callData._id, userId: req.userId },
            { ...callData, updatedAt: new Date() },
            { new: true, runValidators: true }
          );

          if (!updated) {
            errors.push({
              index: i,
              error: 'Call not found or unauthorized',
            });
          } else {
            savedCalls.push(updated);
          }
        }
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      message: `Successfully saved ${savedCalls.length} calls`,
      data: savedCalls,
      errors: errors.length > 0 ? errors : null,
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: 'Server error while saving', error: error.message });
  }
};

exports.getImportHistory = async (req, res) => {
  try {
    const calls = await ScheduledCall.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json(calls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
