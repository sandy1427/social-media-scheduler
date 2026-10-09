const db = require('./config/db');
const publisherService = require('./services/publisher.service');

class Scheduler {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
    }

    start() {
        console.log('Background Scheduler Started');
        // Check every 30 seconds
        this.intervalId = setInterval(() => {
            this.checkScheduledPosts();
            this.checkReminders();
        }, 30000);
        
        // Run immediately once on startup
        this.checkScheduledPosts();
        this.checkReminders();
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Background Scheduler Stopped');
        }
    }

    async checkReminders() {
        try {
            const now = new Date();
            
            const [upcomingPosts] = await db.execute(
                `SELECT id, user_id, scheduled_at FROM posts WHERE status = 'scheduled' AND scheduled_at > ?`,
                [now.toISOString()]
            );

            for (const post of upcomingPosts) {
                const scheduledDate = new Date(post.scheduled_at);
                const diffMs = scheduledDate - now;
                const diffMins = Math.floor(diffMs / 60000);

                let reminderType = null;
                let minutesText = '';

                if (diffMins === 30) {
                    reminderType = 'reminder_30m';
                    minutesText = '30 minutes';
                } else if (diffMins === 10) {
                    reminderType = 'reminder_10m';
                    minutesText = '10 minutes';
                } else if (diffMins === 1 || diffMins === 0) {
                    reminderType = 'reminder_1m';
                    minutesText = '1 minute';
                }

                if (reminderType) {
                    // Check if already sent
                    const [existing] = await db.execute(
                        `SELECT id FROM notifications WHERE post_id = ? AND type = ?`,
                        [post.id, reminderType]
                    );
                    if (existing.length === 0) {
                        await db.execute(
                            `INSERT INTO notifications (user_id, post_id, type, title, message) VALUES (?, ?, ?, ?, ?)`,
                            [post.user_id, post.id, reminderType, 'Upcoming Post Reminder', `Your post is scheduled to be published in ${minutesText}.`]
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Scheduler reminder error:', error);
        }
    }

    async checkScheduledPosts() {
        if (this.isRunning) return;
        this.isRunning = true;

        try {
            const nowIso = new Date().toISOString();
            
            // Find all posts that are scheduled and their scheduled_at is in the past or now
            const [duePosts] = await db.execute(
                `SELECT id FROM posts WHERE status = 'scheduled' AND scheduled_at <= ?`,
                [nowIso]
            );

            if (duePosts && duePosts.length > 0) {
                console.log(`Scheduler found ${duePosts.length} due posts.`);
                for (const row of duePosts) {
                    // Process each post
                    await publisherService.processPost(row.id).catch(err => {
                        console.error(`Scheduler error processing post ${row.id}:`, err);
                    });
                }
            }
        } catch (error) {
            console.error('Scheduler check error:', error);
        } finally {
            this.isRunning = false;
        }
    }
}

module.exports = new Scheduler();
