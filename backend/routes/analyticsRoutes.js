const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

router.use(protect);

router.get('/', getAnalytics);

module.exports = router;
