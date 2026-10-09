const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
    getConnectedAccounts, 
    connectAccount, 
    oauthCallback, 
    disconnectAccount 
} = require('../controllers/socialController');

const router = express.Router();

router.get('/accounts', protect, getConnectedAccounts);
router.get('/:platform/connect', protect, connectAccount);
router.get('/:platform/callback', oauthCallback); // Callback is public, relies on state token
router.post('/:platform/disconnect', protect, disconnectAccount);
router.post('/:platform/reconnect', protect, connectAccount); // Reconnect uses the same connect logic

module.exports = router;
