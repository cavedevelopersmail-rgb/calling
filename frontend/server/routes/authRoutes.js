const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.get('/me', auth, authController.getUser);

module.exports = router;
