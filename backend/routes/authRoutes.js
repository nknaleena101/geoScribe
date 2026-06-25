const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;