import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

export const securityHeaders = helmet();

const tooManyRequests = (limit:number) => ({
    limit,
    windowMs: 15 * 60 * 1000,
    standardHeaders: "draft-7" as const,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" },
});

// general ceiling for the whole API
export const apiRateLimit = rateLimit(tooManyRequests(300));

// every /api/auth route
export const authRateLimit = rateLimit(tooManyRequests(30));

// credential/OTP endpoints — brute force protection
export const strictRateLimit = rateLimit(tooManyRequests(5));
