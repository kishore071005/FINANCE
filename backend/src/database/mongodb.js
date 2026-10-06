const mongoose = require('mongoose');
const env = require('../config/env');

class MongoDBConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return;
      }

      // Fail fast so a missing MongoDB does not block server startup.
      // Default serverSelectionTimeoutMS is 30s - too long for Phase 0.
      const connection = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      this.isConnected = connection.connections[0].readyState === 1;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      // Graceful failure - do not throw, just log
      // This allows the app to start even if DB is not available
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }
    await mongoose.disconnect();
    this.isConnected = false;
    console.log('MongoDB disconnected');
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

module.exports = new MongoDBConnection();