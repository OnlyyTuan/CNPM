// scripts/test-chat.js
// Simple script to call chatService.getChatHistory directly to reproduce errors
require("dotenv").config();
const db = require("../src/db");
const chatService = require("../src/services/chatService");

(async () => {
  try {
    await db.connectDB();
    console.log("DB connected from test script");

    // Replace these IDs with real user IDs from your DB
    const userA = "U001";
    const userB = "U002";

    console.log(`Fetching chat history between ${userA} and ${userB}...`);
    const messages = await chatService.getChatHistory(userA, userB);
    console.log("Messages:", messages);
    process.exit(0);
  } catch (err) {
    console.error(
      "Error running test-chat:",
      err && err.stack ? err.stack : err
    );
    process.exit(1);
  }
})();
