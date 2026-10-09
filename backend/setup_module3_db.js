const db = require('./config/db');

async function setupDB() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                caption TEXT,
                media_url TEXT,
                media_type TEXT,
                link_url TEXT,
                status VARCHAR(50) DEFAULT 'draft',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS post_platforms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                social_account_id INTEGER NOT NULL,
                platform VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id),
                FOREIGN KEY (social_account_id) REFERENCES social_accounts(id)
            )
        `);

        console.log("Module 3 tables created successfully in SQLite.");
    } catch (e) {
        console.error(e);
    }
}

setupDB();
