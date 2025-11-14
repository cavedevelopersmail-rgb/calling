const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');
const auth = require('../middleware/auth');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .xlsx, .xls, and .csv files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload and parse file
router.post('/upload', auth, upload.single('file'), importController.importScheduledCalls);

// Save imported calls
router.post('/save', auth, importController.saveImportedCalls);

// Get import history
router.get('/history', auth, importController.getImportHistory);

module.exports = router;
