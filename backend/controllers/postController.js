const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const publisherService = require('../services/publisher.service');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// @desc    Create a new post draft
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { caption, link_url, platforms, media_url, media_type, scheduledAt, timezone } = req.body;
        const userId = req.user.id;
        
        const status = scheduledAt ? 'scheduled' : 'draft';
        // Insert into posts table
        const result = await db.execute(
            `INSERT INTO posts (user_id, caption, link_url, media_url, media_type, status, scheduled_at, timezone) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, caption || '', link_url || '', media_url || '', media_type || '', status, scheduledAt || null, timezone || null]
        );
        
        // SQLite returns lastID for inserts using .lastID on the statement object if using sqlite3
        // But our db wrapper (sqlite) might return it differently. Let's get the latest id.
        const postId = result[0].insertId;

        // Insert selected platforms
        if (platforms && platforms.length > 0) {
            for (const accountId of platforms) {
                // Get platform name for the account id
                const [accRows] = await db.execute(
                    'SELECT platform FROM social_accounts WHERE id = ? AND user_id = ?',
                    [accountId, userId]
                );
                
                if (accRows.length > 0) {
                    await db.execute(
                        `INSERT INTO post_platforms (post_id, social_account_id, platform) 
                         VALUES (?, ?, ?)`,
                        [postId, accountId, accRows[0].platform]
                    );
                }
            }
        }

        if (status === 'scheduled') {
            await db.execute(
                `INSERT INTO notifications (user_id, post_id, type, title, message) VALUES (?, ?, ?, ?, ?)`,
                [userId, postId, 'scheduled', 'Post Scheduled', 'Your post was successfully scheduled.']
            );
        }

        res.status(201).json({ id: postId, message: 'Post saved as draft' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error creating post' });
    }
};

// @desc    Upload media for a post
// @route   POST /api/posts/media
// @access  Private
const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Construct the URL to access the uploaded file
        const mediaUrl = `/uploads/${req.file.filename}`;
        
        let mediaType = 'image';
        if (req.file.mimetype.startsWith('video')) mediaType = 'video';
        if (req.file.mimetype.startsWith('audio')) mediaType = 'audio';
        
        res.json({ 
            media_url: mediaUrl, 
            media_type: mediaType 
        });
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ message: 'Server error uploading media' });
    }
};

// @desc    Get all posts for the logged in user
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [posts] = await db.execute(
            'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        // Get platforms for each post
        for (let post of posts) {
            const [platforms] = await db.execute(
                'SELECT social_account_id, platform, status FROM post_platforms WHERE post_id = ?',
                [post.id]
            );
            post.platforms = platforms;
        }
        
        res.json(posts);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ message: 'Server error retrieving posts' });
    }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        
        const [posts] = await db.execute(
            'SELECT * FROM posts WHERE id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const post = posts[0];
        
        const [platforms] = await db.execute(
            'SELECT social_account_id, platform, status FROM post_platforms WHERE post_id = ?',
            [post.id]
        );
        post.platforms = platforms;
        
        res.json(post);
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({ message: 'Server error retrieving post' });
    }
};

// @desc    Update a post draft
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
    try {
        const { caption, link_url, platforms, media_url, media_type } = req.body;
        const userId = req.user.id;
        const postId = req.params.id;

        // Check if post exists and belongs to user
        const [existing] = await db.execute(
            'SELECT id FROM posts WHERE id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        // Update posts table
        await db.execute(
            `UPDATE posts SET 
             caption = ?, link_url = ?, media_url = ?, media_type = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [caption || '', link_url || '', media_url || '', media_type || '', postId]
        );

        // Delete existing platforms
        await db.execute('DELETE FROM post_platforms WHERE post_id = ?', [postId]);

        // Insert selected platforms
        if (platforms && platforms.length > 0) {
            for (const accountId of platforms) {
                const [accRows] = await db.execute(
                    'SELECT platform FROM social_accounts WHERE id = ? AND user_id = ?',
                    [accountId, userId]
                );
                
                if (accRows.length > 0) {
                    await db.execute(
                        `INSERT INTO post_platforms (post_id, social_account_id, platform) 
                         VALUES (?, ?, ?)`,
                        [postId, accountId, accRows[0].platform]
                    );
                }
            }
        }

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error updating post' });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        
        // Check if post exists and belongs to user
        const [existing] = await db.execute(
            'SELECT id FROM posts WHERE id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }
        
        // Delete platforms
        await db.execute('DELETE FROM post_platforms WHERE post_id = ?', [postId]);
        
        // Delete post
        await db.execute('DELETE FROM posts WHERE id = ?', [postId]);
        
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error deleting post' });
    }
};

// @desc    Get all scheduled posts
// @route   GET /api/posts/scheduled
// @access  Private
const getScheduledPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [posts] = await db.execute(
            "SELECT * FROM posts WHERE user_id = ? AND status IN ('scheduled', 'publishing', 'published', 'partially_published', 'failed') ORDER BY created_at DESC",
            [userId]
        );
        
        for (let post of posts) {
            const [platforms] = await db.execute(
                'SELECT social_account_id, platform, status, error_message, external_post_id FROM post_platforms WHERE post_id = ?',
                [post.id]
            );
            post.platforms = platforms;
        }
        
        res.json(posts);
    } catch (error) {
        console.error('Error getting scheduled posts:', error);
        res.status(500).json({ message: 'Server error retrieving scheduled posts' });
    }
};

// @desc    Schedule a post
// @route   POST /api/posts/:id/schedule
// @access  Private
const schedulePost = async (req, res) => {
    try {
        const { scheduledAt, timezone } = req.body;
        const userId = req.user.id;
        const postId = req.params.id;

        if (!scheduledAt || !timezone) {
            return res.status(400).json({ message: 'Scheduled date and timezone are required' });
        }

        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
            return res.status(400).json({ message: 'Please select a future date and time.' });
        }

        const [existing] = await db.execute(
            'SELECT id FROM posts WHERE id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        const [platforms] = await db.execute('SELECT id FROM post_platforms WHERE post_id = ?', [postId]);
        if (platforms.length === 0) {
            return res.status(400).json({ message: 'Please select at least one account to post to.' });
        }

        await db.execute(
            `UPDATE posts SET status = 'scheduled', scheduled_at = ?, timezone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [scheduledAt, timezone, postId]
        );

        await db.execute(
            `INSERT INTO notifications (user_id, post_id, type, title, message) VALUES (?, ?, ?, ?, ?)`,
            [userId, postId, 'scheduled', 'Post Scheduled', 'Your post was successfully scheduled.']
        );

        res.json({ success: true, message: 'Post scheduled successfully' });
    } catch (error) {
        console.error('Error scheduling post:', error);
        res.status(500).json({ message: 'Server error scheduling post' });
    }
};

// @desc    Reschedule a post
// @route   PUT /api/posts/:id/reschedule
// @access  Private
const reschedulePost = async (req, res) => {
    try {
        const { scheduledAt, timezone } = req.body;
        const userId = req.user.id;
        const postId = req.params.id;

        if (!scheduledAt || !timezone) {
            return res.status(400).json({ message: 'Scheduled date and timezone are required' });
        }

        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
            return res.status(400).json({ message: 'Please select a future date and time.' });
        }

        const [existing] = await db.execute(
            'SELECT id FROM posts WHERE id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        await db.execute(
            `UPDATE posts SET scheduled_at = ?, timezone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [scheduledAt, timezone, postId]
        );

        await db.execute(
            `INSERT INTO notifications (user_id, post_id, type, title, message) VALUES (?, ?, ?, ?, ?)`,
            [userId, postId, 'rescheduled', 'Post rescheduled successfully', `Your post was rescheduled to ${scheduledDate.toLocaleString()}`]
        );

        res.json({ success: true, message: 'Post rescheduled successfully' });
    } catch (error) {
        console.error('Error rescheduling post:', error);
        res.status(500).json({ message: 'Server error rescheduling post' });
    }
};

// @desc    Unschedule a post
// @route   POST /api/posts/:id/unschedule
// @access  Private
const unschedulePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;

        const [existing] = await db.execute(
            'SELECT id FROM posts WHERE id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        await db.execute(
            `UPDATE posts SET status = 'draft', scheduled_at = NULL, timezone = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [postId]
        );

        await db.execute(
            `INSERT INTO notifications (user_id, post_id, type, title, message) VALUES (?, ?, ?, ?, ?)`,
            [userId, postId, 'unscheduled', 'Post moved back to draft.', 'Your scheduled post was moved back to drafts.']
        );

        res.json({ success: true, message: 'Post removed from schedule' });
    } catch (error) {
        console.error('Error unscheduling post:', error);
        res.status(500).json({ message: 'Server error unscheduling post' });
    }
};

// @desc    Publish a post immediately
// @route   POST /api/posts/:id/publish
// @access  Private
const publishNow = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;

        const [existing] = await db.execute(
            'SELECT id FROM posts WHERE id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        const [platforms] = await db.execute('SELECT id FROM post_platforms WHERE post_id = ?', [postId]);
        if (platforms.length === 0) {
            return res.status(400).json({ message: 'Please select at least one account to post to.' });
        }

        // Run publishing engine directly without awaiting, so UI doesn't hang
        publisherService.processPost(postId).catch(err => {
            console.error('Background publishing error:', err);
        });

        res.json({ success: true, message: 'Publishing process started in background', status: 'publishing' });
    } catch (error) {
        console.error('Error publishing post now:', error);
        res.status(500).json({ message: 'Server error publishing post' });
    }
};

const getPostAnalytics = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        // Verify post ownership
        const [posts] = await db.execute('SELECT id FROM posts WHERE id = ? AND user_id = ?', [postId, userId]);
        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Fetch all platforms for this post
        const [platforms] = await db.execute('SELECT p.platform, p.external_post_id, a.access_token FROM post_platforms p JOIN social_accounts a ON p.social_account_id = a.id WHERE p.post_id = ? AND p.status = "published"', [postId]);

        let totalLikes = 0;
        let totalComments = 0;
        const axios = require('axios');

        for (const plat of platforms) {
            if (!plat.external_post_id || plat.external_post_id.startsWith('mock_')) continue;

            try {
                if (plat.platform === 'facebook') {
                    const response = await axios.get(`https://graph.facebook.com/v18.0/${plat.external_post_id}?fields=likes.summary(true),comments.summary(true)&access_token=${plat.access_token}`);
                    if (response.data.likes?.summary?.total_count) totalLikes += response.data.likes.summary.total_count;
                    if (response.data.comments?.summary?.total_count) totalComments += response.data.comments.summary.total_count;
                } else if (plat.platform === 'instagram') {
                    const response = await axios.get(`https://graph.facebook.com/v18.0/${plat.external_post_id}?fields=like_count,comments_count&access_token=${plat.access_token}`);
                    if (response.data.like_count) totalLikes += response.data.like_count;
                    if (response.data.comments_count) totalComments += response.data.comments_count;
                }
            } catch (err) {
                // Temporarily disabled console.error for analytics to prevent terminal spam 
                // console.error(`Error fetching analytics for ${plat.platform}:`, err.response?.data || err.message);
            }
        }

        return res.json({
            likes: totalLikes,
            comments: totalComments
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
module.exports = {
    createPost,
    uploadMedia,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    getScheduledPosts,
    schedulePost,
    reschedulePost,
    unschedulePost,
    publishNow,
    getPostAnalytics
};
