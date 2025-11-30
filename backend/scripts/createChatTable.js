// Load backend/.env so DB credentials are available when running this script directly
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const db = require('../src/db');

async function create() {
  try {
    await db.connectDB();
    const sql = `
    CREATE TABLE IF NOT EXISTS chat_message (
      id varchar(255) NOT NULL,
      sender_id varchar(255) NOT NULL,
      receiver_id varchar(255) NOT NULL,
      message text NOT NULL,
      is_read tinyint(1) NOT NULL DEFAULT '0',
      created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_sender (sender_id),
      KEY idx_receiver (receiver_id),
      KEY idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    await db.sequelize.query(sql);
    console.log('✅ chat_message table created (or already exists)');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create chat_message table:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

create();
