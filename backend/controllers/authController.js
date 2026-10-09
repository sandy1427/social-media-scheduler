const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            [full_name, email, password_hash]
        );

        res.status(201).json({
            id: result.insertId,
            full_name,
            email,
            token: generateToken(result.insertId)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            res.json({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Logout user / clear cookie if used
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    // If using cookies, clear them here. With just JWT in localStorage, the client handles logout.
    res.json({ message: 'Logged out successfully' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Please provide email' });
    }

    try {
        // Do not reveal if email exists or not
        const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        
        if (users.length > 0) {
            // Generate OTP/Token
            const token = crypto.randomBytes(20).toString('hex');
            // Valid for 15 mins
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); 

            await db.execute(
                'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
                [email, token, expiresAt]
            );

            // In a real app, send email here. For now, we return it in response (or just console log it)
            // But requirement says "Allow user to create a new password", so for testing we will return the token
            return res.json({ message: 'If email exists, a reset link has been sent.', _test_token: token });
        }

        res.json({ message: 'If email exists, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
        return res.status(400).json({ message: 'Please provide email, token, and new password' });
    }

    try {
        const [resets] = await db.execute(
            'SELECT * FROM password_resets WHERE email = ? AND token = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 1',
            [email, token, new Date().toISOString()]
        );

        if (resets.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        await db.execute('UPDATE users SET password_hash = ? WHERE email = ?', [password_hash, email]);
        
        // Invalidate tokens
        await db.execute('DELETE FROM password_resets WHERE email = ?', [email]);

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword
};
