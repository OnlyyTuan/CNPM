require('dotenv').config();
const db = require('./db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT NOW() AS time');
    console.log('MySQL is connected! Current time:', rows[0].time);
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
