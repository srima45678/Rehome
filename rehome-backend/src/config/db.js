// db.js
// This file connects our server to MongoDB database
// Like connecting our kitchen to the storage room

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect = opens connection to MongoDB
    // process.env.MONGODB_URI = the address from .env file
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`❌ MongoDB Error: ${error.message}`);
    // Exit the process if database fails to connect
    process.exit(1);
  }
};

module.exports = connectDB;