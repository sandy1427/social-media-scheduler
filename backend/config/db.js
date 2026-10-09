const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// Ensure database folder exists
const dbPath = path.join(__dirname, '../../database/database.sqlite');

let dbPromise = open({
  filename: dbPath,
  driver: sqlite3.Database
}).then(async (db) => {
    // Initialize database schema
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS social_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            platform VARCHAR(50) NOT NULL,
            platform_user_id VARCHAR(255),
            account_name VARCHAR(255),
            username VARCHAR(255),
            profile_image_url TEXT,
            access_token TEXT,
            refresh_token TEXT,
            token_expires_at DATETIME,
            status VARCHAR(50) DEFAULT 'connected',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            caption TEXT,
            link_url VARCHAR(255),
            media_url VARCHAR(255),
            media_type VARCHAR(50),
            status VARCHAR(50) DEFAULT 'draft',
            scheduled_time DATETIME,
            scheduled_at DATETIME,
            timezone VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS post_platforms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            social_account_id INTEGER NOT NULL,
            platform VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY(social_account_id) REFERENCES social_accounts(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            post_id INTEGER,
            platform VARCHAR(50),
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
        );
    `);
    
    // Add columns if they don't exist (for existing databases)
    try {
        await db.exec(`ALTER TABLE posts ADD COLUMN timezone VARCHAR(100)`);
    } catch (e) {}
    try {
        await db.exec(`ALTER TABLE posts ADD COLUMN scheduled_at DATETIME`);
    } catch (e) {}
    
    // Module 5 extensions for post_platforms
    try {
        await db.exec(`ALTER TABLE post_platforms ADD COLUMN published_at DATETIME`);
    } catch (e) {}
    try {
        await db.exec(`ALTER TABLE post_platforms ADD COLUMN external_post_id VARCHAR(255)`);
    } catch (e) {}
    try {
        await db.exec(`ALTER TABLE post_platforms ADD COLUMN error_message TEXT`);
    } catch (e) {}
    try {
        await db.exec(`ALTER TABLE post_platforms ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
    } catch (e) {}
    
    return db;
});

// Create a wrapper that behaves exactly like mysql2's pool.promise()
const wrapper = {
  execute: async (sql, params = []) => {
    const db = await dbPromise;
    
    // Simple query type detection
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = await db.all(sql, params);
      return [rows]; // Return wrapped in array to mimic [rows, fields]
    } else {
      const result = await db.run(sql, params);
      return [{ insertId: result.lastID, affectedRows: result.changes }];
    }
  }
};

module.exports = wrapper;
