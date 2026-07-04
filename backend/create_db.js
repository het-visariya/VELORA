import pg from 'pg';
const client = new pg.Client({ host: 'localhost', port: 5432, database: 'postgres', user: 'postgres', password: 'postgres' });
client.connect().then(() => {
  client.query('CREATE DATABASE velora_db').then(() => {
    console.log('Database created');
    process.exit(0);
  }).catch(e => {
    console.log('Error or already exists:', e.message);
    process.exit(0);
  });
}).catch(e => {
  console.log('Cannot connect to pg:', e.message);
  process.exit(1);
});
