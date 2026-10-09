const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, changePassword } = require('../controllers/userController');
const router = express.Router();

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/change-password', protect, changePassword);

module.exports = router;
