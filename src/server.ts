import express from 'express';
import { rateLimit } from './rateLimit';
import { connectRedis } from './redisClient';
import { router } from './router';

const app = express();
const PORT = 3000;

connectRedis();
app.use(rateLimit);
app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
