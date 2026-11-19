import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/token.service.js";
import { Unauthorized } from "../../lib/errors.js";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const requireAuth = (tokenService:TokenService) => (req:Request,_res:Response,next:NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")){
        return next(Unauthorized("Missing access token"));
    };
    try {
        const payload = tokenService.verifyAccessToken(header.slice(7));
        req.userId = payload.sub;
        next();
    } catch {
        next(Unauthorized("Invalid or expired access token"));
    };
};
