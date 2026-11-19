import { prisma } from "../../lib/prisma.js";

export class RefreshTokenRepository {

    create (userId:string, tokenHash:string, expiresAt:Date, userAgent?:string, ip?:string){
        return prisma.refreshToken.create({
            data:{userId, tokenHash, expiresAt, userAgent, ip}
        });
    };

    findByHash (tokenHash:string){
        return prisma.refreshToken.findUnique({
            where:{tokenHash}
        });
    };

    revoke (id:string){
        return prisma.refreshToken.update({
            where:{id},
            data:{revokedAt:new Date()}
        });
    };

    revokeAllForUser (userId:string){
        return prisma.refreshToken.updateMany({
            where:{userId, revokedAt:null},
            data:{revokedAt:new Date()}
        });
    };

    touchLastUsed (id:string){
        return prisma.refreshToken.update({
            where:{id},
            data:{lastUsedAt:new Date()}
        });
    };
}
