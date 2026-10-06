const redis = require('redis');
const env = require('../config/env');

class RedisConnection {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect({ timeoutMs = 3000 } = {}) {
    try {
      if (this.isConnected) {
        return;
      }

      const redisUrl = env.REDIS_PASSWORD
        ? `redis://:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`
        : `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`;

      // Fail fast when Redis is down: no infinite reconnect loop during startup.
      // Default node-redis reconnectStrategy retries forever, which makes
      // `await client.connect()` hang and blocks app.listen().
      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 2000,
          reconnectStrategy: false
        }
      });

      this.client.on('error', () => {
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        this.isConnected = false;
      });

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Redis connection timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      await Promise.race([this.client.connect(), timeout]);
      this.isConnected = true;
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Redis connection failed (graceful):', error.message);
      // Graceful failure - do not throw, just log
      try {
        if (this.client) {
          await this.client.disconnect().catch(() => {});
        }
      } catch (_) {
        // ignore cleanup errors
      }
      this.client = null;
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('Redis disconnected');
    }
  }

  getClient() {
    return this.client;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

module.exports = new RedisConnection();