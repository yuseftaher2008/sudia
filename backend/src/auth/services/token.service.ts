import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";

const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AccessTokenPayload {
    sub: string;
};

export class TokenService {

    signAccessToken (userId:string):string{
        return jwt.sign({}, process.env.JWT_SECRET!, {
            subject:userId,
            expiresIn:ACCESS_TOKEN_TTL,
        });
    };

    verifyAccessToken (token:string):AccessTokenPayload{
        const payload = jwt.verify(token, process.env.JWT_SECRET!);
        if (typeof payload === "string" || !payload.sub){
            throw new Error("Invalid token payload");
        };
        return {sub:payload.sub};
    };

    generateRefreshToken ():{token:string, tokenHash:string}{
        const token = randomBytes(48).toString("base64url");
        return {token, tokenHash:this.hashRefreshToken(token)};
    };

    hashRefreshToken (token:string):string{
        return createHash("sha256").update(token).digest("hex");
    };

    refreshExpiryDate ():Date{
        return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    };
}
