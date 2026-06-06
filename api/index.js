const mongoose = require('mongoose');

// Cache the MongoDB connection across serverless invocations
// (Vercel can reuse warm function instances)
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
};

const app = require('../server/server');

// Vercel serverless handler
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
