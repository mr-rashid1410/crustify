// ─────────────────────────────────────────────
//  config/db.js
//  WHY: Centralises the MongoDB connection so
//       server.js stays clean and db logic lives
//       in one place.
// ─────────────────────────────────────────────
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = connectDB;
