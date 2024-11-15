import { Request, Response, NextFunction } from 'express';
import { client } from './redisClient';

const MAX_REQUESTS = 10;
const WINDOW_TIME = 60 * 1000;

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const userIP: string = req.ip || '';
  const currentTime = Date.now();
  const key = `rate_limit:${userIP}`;

  try {
    const userData = await client.get(key);

    if (userData) {
      const parsedData = JSON.parse(userData);
      const timeElapsed = currentTime - parsedData.lastRequestTime;

      if (timeElapsed > WINDOW_TIME) {
        await client.set(key, JSON.stringify({
          tokens: MAX_REQUESTS,
          lastRequestTime: currentTime,
        }), { EX: Math.floor(WINDOW_TIME / 1000) });
      } else {
        const tokensToAdd = Math.floor((timeElapsed / WINDOW_TIME) * MAX_REQUESTS);
        const newTokens = Math.min(MAX_REQUESTS, parsedData.tokens + tokensToAdd);

        if (newTokens > 0) {
          await client.set(key, JSON.stringify({
            tokens: newTokens - 1,
            lastRequestTime: currentTime,
          }), { EX: Math.floor(WINDOW_TIME / 1000) });
          next();
          return;
        }
      }
    } else {
      await client.set(key, JSON.stringify({
        tokens: MAX_REQUESTS - 1,
        lastRequestTime: currentTime,
      }), { EX: Math.floor(WINDOW_TIME / 1000) });
      next();
      return;
    }

    res.status(429).json({ error: "Too Many Requests - try again later." });
  } catch (error) {
    console.error('Error processing rate limit:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
