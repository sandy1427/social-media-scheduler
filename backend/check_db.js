const db = require('./config/db');
async function run() {
  const [rows] = await db.execute('SELECT * FROM post_platforms ORDER BY id DESC LIMIT 1');
  console.log('Post Platform:', rows[0]);
  const [accs] = await db.execute('SELECT access_token FROM social_accounts WHERE id = ?', [rows[0].social_account_id]);
  console.log('Account Token:', accs[0].access_token);
  process.exit(0);
}
run();
