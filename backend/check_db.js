import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkDB() {
  try {
    await client.connect();
    
    const tables = ['users', 'closet_items', 'outfits', 'planner_events', 'tryon_sessions'];
    const results = [];
    
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT count(*) FROM ${table}`);
        results.push({ table, count: parseInt(res.rows[0].count) });
      } catch (e) {
        results.push({ table, count: 'Error or Table missing' });
      }
    }
    
    console.log('\n--- Database Record Counts ---');
    console.table(results);
    
    try {
      const usersRes = await client.query('SELECT id, name, email FROM users LIMIT 3');
      console.log('\n--- Sample Users ---');
      if (usersRes.rows.length === 0) {
        console.log('No users found in the database.');
      } else {
        console.table(usersRes.rows);
      }
    } catch (e) {
      console.log('Could not fetch users.');
    }
    
  } catch (err) {
    console.error('Connection Error:', err);
  } finally {
    await client.end();
  }
}

checkDB();
