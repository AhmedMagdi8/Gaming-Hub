import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost', // Adjust based on your Redis setup
  port: Number(process.env.REDIS_PORT) || 6379,
});

export default redis;
