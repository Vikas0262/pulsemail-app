import dotenv from 'dotenv';
import IORedis from 'ioredis';

dotenv.config();

const redisUrl = process.env.REDIS_URL?.trim();

if (!redisUrl) {
  throw new Error('[redis] REDIS_URL is missing or empty');
}

const RedisClient = IORedis as any;

const connection = new RedisClient(redisUrl, {
  maxRetriesPerRequest: null, // BullMQ requires this setting
});

export default connection;