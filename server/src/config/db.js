const mongoose = require('mongoose');

let mode = 'memory';

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_factory_monitor';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    mode = 'mongo';
    console.log(`[db] MongoDB connected -> ${uri}`);
  } catch (err) {
    mode = 'memory';
    console.warn('[db] MongoDB unreachable. Falling back to in-memory demo mode (accounts reset on restart).');
    console.warn('[db] Set MONGO_URI in server/.env to enable persistent MongoDB storage.');
  }
  return mode;
}

function getMode() {
  if (mode === 'mongo' && mongoose.connection.readyState !== 1) return 'memory';
  return mode;
}

module.exports = { connectDB, getMode, mongoose };
