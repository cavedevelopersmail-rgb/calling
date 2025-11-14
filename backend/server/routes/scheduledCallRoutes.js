const express = require('express');
const router = express.Router();
const scheduledCallController = require('../controllers/scheduledCallController');
const auth = require('../middleware/auth');

router.get('/', auth, scheduledCallController.getAllScheduledCalls);
router.post('/', auth, scheduledCallController.createScheduledCall);
router.put('/:id', auth, scheduledCallController.updateScheduledCall);
router.delete('/:id', auth, scheduledCallController.deleteScheduledCall);
router.patch('/:id/status', auth, scheduledCallController.updateScheduledCallStatus);

module.exports = router;
