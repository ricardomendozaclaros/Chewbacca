// lib/redis.js
import { createClient } from 'redis';
import { config } from '../config/default.js';

class RedisService {
  constructor() {
    this.client = createClient({
      host: config.redis.host,
      port: config.redis.port
    });
    
    this.client.on('error', err => console.log('Redis Client Error', err));
    this.client.on('connect', () => console.log('Redis Cliente conectado'));
  }

  async connect() {
    await this.client.connect();
  }

  async get(key) {
    return await this.client.get(key);
  }

  async setEx(key, value) {
    await this.client.setEx(key, config.redis.ttl, value);
  }

  async quit() {
    await this.client.quit();
  }
}

export const redisService = new RedisService();