const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);
        res.json({ count: rows[0].count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching unread count' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error marking all as read' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await db.execute('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting notification' });
    }
};

exports.clearAll = async (req, res) => {
    try {
        await db.execute('DELETE FROM notifications WHERE user_id = ?', [req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error clearing notifications' });
    }
};
