// server/lib/redis.js
import { createClient } from 'redis';

class RedisService {
  constructor() {
    this.client = createClient();
    this.client.on('error', err => console.log('Redis Client Error', err));
    this.client.on('connect', () => console.log('Redis Cliente conectado'));
  }

  async connect() {
    await this.client.connect();
  }

  async get(key) {
    return await this.client.get(key);
  }

  async setEx(key, ttl = 86400, value) {
    // Redis expect setEx(key, ttl, value)
    return await this.client.setEx(key, ttl, value);
  }

  async del(key) {
    return await this.client.del(key);
  }

  async quit() {
    await this.client.quit();
  }

  async keys(pattern) {
    return await this.client.keys(pattern);
  }
}

export const redisService = new RedisService();