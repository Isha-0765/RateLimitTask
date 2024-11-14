import { createClient } from 'redis';

export const client = createClient();

export const connectRedis = async () => {
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};
