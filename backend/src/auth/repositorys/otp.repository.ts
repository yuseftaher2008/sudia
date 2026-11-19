import { OtpPurpose } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";


export class OtpRepository {

    upsertOtp (userId: string, purpose: OtpPurpose, codeHash: string, expiresAt: Date){
        return prisma.otpCode.upsert({
            where: { userId_purpose: { userId, purpose } },
            update: { codeHash, expiresAt, attempts: 0, usedAt: null },
            create: { userId, purpose, codeHash, expiresAt }
        });
    };


    findByUserAndPurpose (userId: string, purpose: OtpPurpose){
        return prisma.otpCode.findUnique({
            where: { userId_purpose: { userId, purpose } }
        });
    };


    markAsUsed (id: string){
        return prisma.otpCode.update({
            where: { id },
            data: { usedAt: new Date() }
        });
    };


    incrementAttempts (id: string){
        return prisma.otpCode.update({
            where: { id },
            data: { attempts: { increment: 1 } }
        });
    };


    deleteByUserAndPurpose (userId: string, purpose: OtpPurpose){
        return prisma.otpCode.deleteMany({
            where: { userId, purpose }
        });
    };
}
