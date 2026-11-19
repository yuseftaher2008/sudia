import { randomInt, createHmac, timingSafeEqual } from "node:crypto";
import { OtpRepository } from "../repositorys/otp.repository.js";
import { OtpPurpose } from "../../../generated/prisma/enums.js";
import { BadRequest } from "../../lib/errors.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export class OtpService {
    constructor (private otpRepository:OtpRepository){}

    private hashOtp (code:string){
        return createHmac("sha256", process.env.OTP_SECRET!)
        .update(code)
        .digest("hex");
    }

    async createOtp (userId:string,purpose:OtpPurpose):Promise<string>{

        const code = randomInt(100000, 1000000).toString();
        const codeHash = this.hashOtp(code);
        const expiresAt = new Date(Date.now() + OTP_TTL_MS);
        await this.otpRepository.upsertOtp(userId,purpose,codeHash,expiresAt);
        return code;

    }


    private async findValidOtp (userId:string,purpose:OtpPurpose,code:string){
        const otp = await this.otpRepository.findByUserAndPurpose(userId,purpose);
        if (!otp) throw BadRequest("OTP not found");
        if (otp.usedAt) throw BadRequest("OTP already used");
        if (otp.expiresAt < new Date()) throw BadRequest("OTP expired");
        if (otp.attempts >= MAX_ATTEMPTS){
            await this.otpRepository.deleteByUserAndPurpose(userId,purpose);
            throw BadRequest("OTP max attempts exceeded");
        }

        const expected = Buffer.from(otp.codeHash,"hex");
        const actual = Buffer.from(this.hashOtp(code),"hex");
        const valid = expected.length === actual.length && timingSafeEqual(expected,actual);

        if (!valid){
            await this.otpRepository.incrementAttempts(otp.id);
            throw BadRequest("Invalid OTP code");
        }

        return otp;
    }


    async verifyOtp (userId:string,purpose:OtpPurpose,code:string):Promise<void>{
        const otp = await this.findValidOtp(userId,purpose,code);
        await this.otpRepository.markAsUsed(otp.id);
    }


    async checkOtp (userId:string,purpose:OtpPurpose,code:string):Promise<void>{
        // validates without consuming the code — the final reset still needs it
        await this.findValidOtp(userId,purpose,code);
    }
}
