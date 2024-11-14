import { Request, Response, NextFunction } from 'express';
import { client } from './redisClient';

const MAX_REQUESTS = 10;
const WINDOW_TIME = 60 * 1000;
interface UserRequestData {
  tokens: number;
  lastRequestTime: number;
}

const userRequests: { [key: string]: UserRequestData } = {};

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const userIP:string = req.ip || '';
  const currentTime = Date.now();

  if (!userRequests[userIP]) {
    userRequests[userIP] = {
      tokens: MAX_REQUESTS,
      lastRequestTime: currentTime,
    };
  }

  const userData = userRequests[userIP];
  const timeElapsed = currentTime - userData.lastRequestTime;

  if (timeElapsed > WINDOW_TIME) {
    userData.tokens = MAX_REQUESTS;
    userData.lastRequestTime = currentTime;
  } else {
    const tokensToAdd = Math.floor((timeElapsed / WINDOW_TIME) * MAX_REQUESTS);
    userData.tokens = Math.min(MAX_REQUESTS, userData.tokens + tokensToAdd);
    userData.lastRequestTime = currentTime;
  }

  if (userData.tokens > 0) {
    userData.tokens -= 1;
    next(); 
  } else {
    console.log(`Request from ${userIP} denied. Rate limit exceeded.`);
    res.status(429).json({ error: "Too Many Requests - try again later." });
  }
};
