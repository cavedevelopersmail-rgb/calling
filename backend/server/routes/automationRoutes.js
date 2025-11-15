const express = require('express');
const router = express.Router();
const { runWorkflow } = require('../controllers/automationController');
const authMiddleware = require('../middleware/auth'); // Assuming you have auth middleware

// @route   POST api/automation/run
// @desc    Manually trigger the automation workflow
// @access  Private (assuming only authenticated users can trigger it)
router.post('/run', authMiddleware, runWorkflow);

module.exports = router;
