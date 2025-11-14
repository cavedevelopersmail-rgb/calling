const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const auth = require('../middleware/auth');

router.get('/', auth, callController.getAllCalls);
router.post('/', auth, callController.createCall);
router.get('/:id', auth, callController.getCallById);

module.exports = router;
