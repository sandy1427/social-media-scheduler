const db = require('../config/db');

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end, platform } = req.query;

        // Parse dates
        let startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        let endDate = end ? new Date(end) : new Date();
        
        // Ensure end date covers the whole day
        endDate.setHours(23, 59, 59, 999);
        
        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();

        // 1. Fetch connected accounts
        const [accounts] = await db.execute(
            'SELECT platform, status FROM social_accounts WHERE user_id = ?',
            [userId]
        );

        // 2. Fetch posts within date range
        // For draft posts, we use created_at. For scheduled/published, we use scheduled_at or created_at.
        const [posts] = await db.execute(
            `SELECT p.id, p.caption, p.status, p.media_url, p.created_at, p.scheduled_at 
             FROM posts p 
             WHERE p.user_id = ? 
             AND (p.scheduled_at BETWEEN ? AND ? OR (p.scheduled_at IS NULL AND p.created_at BETWEEN ? AND ?))`,
            [userId, startIso, endIso, startIso, endIso]
        );

        // 3. Fetch platforms for these posts
        const postIds = posts.map(p => p.id);
        let postPlatforms = [];
        if (postIds.length > 0) {
            const placeholders = postIds.map(() => '?').join(',');
            const [platforms] = await db.execute(
                `SELECT post_id, platform, status, published_at, error_message FROM post_platforms WHERE post_id IN (${placeholders})`,
                [...postIds]
            );
            postPlatforms = platforms;
        }

        // Apply platform filter if provided
        let filteredPosts = posts;
        if (platform && platform !== 'All') {
            const platformLower = platform.toLowerCase();
            const relevantPostIds = new Set(postPlatforms.filter(pp => pp.platform === platformLower).map(pp => pp.post_id));
            filteredPosts = posts.filter(p => relevantPostIds.has(p.id));
        }

        // Calculate Summaries
        const summary = {
            total: filteredPosts.length,
            published: filteredPosts.filter(p => p.status === 'published' || p.status === 'partially_published').length,
            scheduled: filteredPosts.filter(p => p.status === 'scheduled').length,
            failed: filteredPosts.filter(p => p.status === 'failed').length,
            drafts: filteredPosts.filter(p => p.status === 'draft').length,
        };

        // Posts Over Time
        const postsOverTimeMap = {};
        filteredPosts.forEach(p => {
            const dateStr = (p.scheduled_at || p.created_at).split('T')[0];
            if (!postsOverTimeMap[dateStr]) {
                postsOverTimeMap[dateStr] = { date: dateStr, published: 0, scheduled: 0, failed: 0, draft: 0 };
            }
            if (p.status === 'partially_published') postsOverTimeMap[dateStr].published++;
            else postsOverTimeMap[dateStr][p.status]++;
        });
        const postsOverTime = Object.values(postsOverTimeMap).sort((a, b) => a.date.localeCompare(b.date));

        // Platform Distribution
        const platformCounts = {};
        postPlatforms.forEach(pp => {
            if (!platformCounts[pp.platform]) platformCounts[pp.platform] = { total: 0, published: 0, failed: 0 };
            platformCounts[pp.platform].total++;
            if (pp.status === 'published') platformCounts[pp.platform].published++;
            if (pp.status === 'failed') platformCounts[pp.platform].failed++;
        });

        // Map over all supported platforms to provide full view
        const supportedPlatforms = ['facebook', 'instagram', 'x', 'youtube', 'threads', 'pinterest'];
        const platformPerformance = supportedPlatforms.map(plat => {
            const account = accounts.find(a => a.platform === plat);
            const stats = platformCounts[plat] || { total: 0, published: 0, failed: 0 };
            return {
                platform: plat,
                isConnected: !!account && account.status === 'connected',
                ...stats,
                engagement: {
                    likes: null,
                    comments: null,
                    shares: null,
                    rate: null
                }
            };
        });

        // Top Posts (Based on published posts, since we don't have real engagement APIs, we just return recent published posts)
        const topPosts = filteredPosts
            .filter(p => p.status === 'published' || p.status === 'partially_published')
            .sort((a, b) => new Date(b.scheduled_at || b.created_at) - new Date(a.scheduled_at || a.created_at))
            .slice(0, 5)
            .map(p => {
                const platData = postPlatforms.filter(pp => pp.post_id === p.id);
                return {
                    id: p.id,
                    caption: p.caption,
                    media_url: p.media_url,
                    published_at: p.scheduled_at || p.created_at,
                    platforms: platData.map(pp => pp.platform),
                    engagement: { likes: null, comments: null }
                };
            });

        res.json({
            summary,
            postsOverTime,
            platformPerformance,
            topPosts,
            successRate: (summary.published + summary.failed) > 0 
                ? Math.round((summary.published / (summary.published + summary.failed)) * 100) 
                : null
        });
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};
