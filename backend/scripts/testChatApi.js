// Load backend/.env when running this script directly (so BASE_URL/TOKEN can come from backend/.env)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api/v1';
const TOKEN = process.env.TOKEN || process.argv[2];
const RECEIVER_ID = process.env.RECEIVER_ID || process.argv[3] || 'U003';

if (!TOKEN) {
  console.error('ERROR: Please provide a TOKEN via env TOKEN or as first arg');
  console.error('Usage: TOKEN=<jwt> node scripts/testChatApi.js [token] [receiverId]');
  process.exit(1);
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function run() {
  try {
    console.log('-> Testing GET chat history with', RECEIVER_ID);
    const h = await client.get(`/chat/history/${RECEIVER_ID}`);
    console.log('GET /chat/history -> status', h.status);
    console.log(JSON.stringify(h.data, null, 2));
  } catch (err) {
    console.error('GET /chat/history error:', err.response ? err.response.status : err.message);
    if (err.response && err.response.data) console.error(JSON.stringify(err.response.data, null, 2));
  }

  try {
    const payload = { receiverId: RECEIVER_ID, message: `Test message from automated script ${new Date().toISOString()}` };
    console.log('-> Testing POST send message to', RECEIVER_ID);
    const s = await client.post('/chat/send', payload);
    console.log('POST /chat/send -> status', s.status);
    console.log(JSON.stringify(s.data, null, 2));
  } catch (err) {
    console.error('POST /chat/send error:', err.response ? err.response.status : err.message);
    if (err.response && err.response.data) console.error(JSON.stringify(err.response.data, null, 2));
  }
}

run();
