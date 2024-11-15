import { Request, Response, NextFunction } from 'express';
import { client } from './redisClient';

const MAX_REQUESTS = 10; 
const WINDOW_TIME = 60; 

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const userIP = req.ip || '';

  try {
    const userData = await client.get(userIP);

    if (!userData) {
      await client.set(userIP, MAX_REQUESTS - 1, {
        EX: WINDOW_TIME,
      });
      next();
    } else {
      let tokens = parseInt(userData, 10);

      if (tokens > 0) {
        tokens -= 1;
        await client.set(userIP, tokens);
        next();
      } else {
        console.log(`Request from ${userIP} denied. Rate limit exceeded.`);
        res.status(429).json({ error: 'Too Many Requests - try again later.' });
      }
    }
  } catch (error) {
    console.error('Redis error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
