const db = require('../config/db');
const bcrypt = require('bcrypt');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, full_name, email, profile_pic, created_at FROM users WHERE id = ?', [req.user.id]);
        
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const { full_name, profile_pic } = req.body;

    if (!full_name) {
        return res.status(400).json({ message: 'Full name is required' });
    }

    try {
        if (profile_pic !== undefined) {
            await db.execute('UPDATE users SET full_name = ?, profile_pic = ? WHERE id = ?', [full_name, profile_pic, req.user.id]);
        } else {
            await db.execute('UPDATE users SET full_name = ? WHERE id = ?', [full_name, req.user.id]);
        }
        
        const [rows] = await db.execute('SELECT id, full_name, email, profile_pic, created_at FROM users WHERE id = ?', [req.user.id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide current and new password' });
    }

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        const match = await bcrypt.compare(currentPassword, user.password_hash);

        if (!match) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, req.user.id]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword
};
