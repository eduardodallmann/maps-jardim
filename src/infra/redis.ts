import { Redis } from 'ioredis';

let redis: Redis;
let subscriber: Redis;

export function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  return redis;
}

export function getRedisSubscriber() {
  if (!subscriber) {
    subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  return subscriber;
}
