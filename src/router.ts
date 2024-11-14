import { Router, Request, Response } from 'express';

export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the TypeScript Rate Limited Server!');
});
