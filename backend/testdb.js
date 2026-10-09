const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'social_scheduler'
    });

    const [rows] = await conn.execute('SELECT * FROM post_platforms');
    console.log(rows);
    process.exit();
}
checkDb();
