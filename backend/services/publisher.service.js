const db = require('../config/db');
const facebookService = require('./social/facebook.service');
const instagramService = require('./social/instagram.service');
const xService = require('./social/x.service');
const youtubeService = require('./social/youtube.service');
const threadsService = require('./social/threads.service');
const pinterestService = require('./social/pinterest.service');

class PublisherService {
    
    getServiceForPlatform(platform) {
        switch(platform.toLowerCase()) {
            case 'facebook': return facebookService;
            case 'instagram': return instagramService;
            case 'x': return xService;
            case 'youtube': return youtubeService;
            case 'threads': return threadsService;
            case 'pinterest': return pinterestService;
            default: return null;
        }
    }

    async processPost(postId) {
        console.log(`Starting publish process for post ${postId}`);
        
        // Lock/Claim the post (Update status to publishing)
        const [posts] = await db.execute(`SELECT * FROM posts WHERE id = ?`, [postId]);
        if (!posts || posts.length === 0) return;
        
        const post = posts[0];
        
        // Prevent duplicate publish
        if (post.status === 'published' || post.status === 'publishing') {
            console.log(`Post ${postId} is already ${post.status}. Skipping.`);
            return;
        }

        await db.execute(`UPDATE posts SET status = 'publishing', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [postId]);

        // Get platforms that are pending
        const [platforms] = await db.execute(`SELECT * FROM post_platforms WHERE post_id = ? AND (status = 'pending' OR status = 'failed')`, [postId]);
        
        let successCount = 0;
        let failCount = 0;

        for (const pp of platforms) {
            try {
                // Update platform status to publishing
                await db.execute(`UPDATE post_platforms SET status = 'publishing', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [pp.id]);

                // Fetch social account credentials
                const [accounts] = await db.execute(`SELECT * FROM social_accounts WHERE id = ?`, [pp.social_account_id]);
                if (!accounts || accounts.length === 0) {
                    throw new Error("Social account not found or disconnected.");
                }
                const account = accounts[0];

                const service = this.getServiceForPlatform(pp.platform);
                if (!service) {
                    throw new Error(`Unsupported platform: ${pp.platform}`);
                }

                // Call the real publishing logic
                const result = await service.publishPost(account, post);

                if (result.success) {
                    await db.execute(
                        `UPDATE post_platforms SET status = 'published', external_post_id = ?, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                        [result.external_post_id, pp.id]
                    );
                    successCount++;
                } else {
                    await db.execute(
                        `UPDATE post_platforms SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                        [result.error, pp.id]
                    );
                    failCount++;
                }
            } catch (error) {
                console.error(`Error publishing post ${postId} to ${pp.platform}:`, error);
                await db.execute(
                    `UPDATE post_platforms SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [error.message || 'Unknown error', pp.id]
                );
                failCount++;
            }
        }

        // Determine final overall status
        const [allPlatforms] = await db.execute(`SELECT * FROM post_platforms WHERE post_id = ?`, [postId]);
        const total = allPlatforms.length;
        const totalPublished = allPlatforms.filter(p => p.status === 'published').length;
        
        let finalStatus = 'failed';
        if (totalPublished === total && total > 0) {
            finalStatus = 'published';
        } else if (totalPublished > 0) {
            finalStatus = 'partially_published';
        }

        await db.execute(`UPDATE posts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [finalStatus, postId]);
        console.log(`Finished processing post ${postId}. Final status: ${finalStatus}`);
        
        // Insert notification
        let notifType = finalStatus;
        let notifTitle = 'Post published successfully';
        let notifMsg = `Your post was published successfully.`;
        if (finalStatus === 'failed') {
            notifTitle = 'Post publishing failed';
            notifMsg = `Your post could not be published.`;
        } else if (finalStatus === 'partially_published') {
            notifTitle = 'Post partially published';
            notifMsg = `Your post was published to some platforms but failed on others.`;
        }
        
        await db.execute(
            `INSERT INTO notifications (user_id, post_id, type, title, message) VALUES (?, ?, ?, ?, ?)`,
            [post.user_id, postId, notifType, notifTitle, notifMsg]
        );

        return finalStatus;
    }
}

module.exports = new PublisherService();
