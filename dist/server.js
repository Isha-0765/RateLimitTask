"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const app = (0, express_1.default)();
const PORT = 3000;
const client = (0, redis_1.createClient)();
client.on('error', (err) => console.error('Redis Client Error:', err));
client.connect();
const MAX_REQUESTS = 10;
const WINDOW_TIME = 60 * 1000;
const userRequests = {};
const rateLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userIP = req.ip || '';
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
    }
    else {
        const tokensToAdd = Math.floor((timeElapsed / WINDOW_TIME) * MAX_REQUESTS);
        userData.tokens = Math.min(MAX_REQUESTS, userData.tokens + tokensToAdd);
        userData.lastRequestTime = currentTime;
    }
    if (userData.tokens > 0) {
        userData.tokens -= 1;
        next();
    }
    else {
        console.log(`Request from ${userIP} denied. Rate limit exceeded.`);
        res.status(429).json({ error: "Too Many Requests - try again later." });
    }
});
app.use(rateLimit);
app.get('/', (req, res) => {
    res.send('TypeScript Rate Limited Server!');
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
