import bcrypt from 'bcrypt';
import { UserCreateInput, UserModel } from "../../../generated/prisma/models.js";
import { OtpPurpose } from "../../../generated/prisma/enums.js";
import { AuthRepository } from "../repositorys/auth.repository.js";
import { RefreshTokenRepository } from "../repositorys/refresh-token.repository.js";
import { OtpService } from "./otp.service.js";
import { EmailService } from "./email.service.js";
import { TokenService } from "./token.service.js";
import { RegisterInput, LoginInput, VerifyEmailInput, ForgotPasswordInput, VerifyResetCodeInput, ResetPasswordInput } from "../dto/auth.dto.js";
import { Conflict, Unauthorized, Forbidden, BadRequest } from "../../lib/errors.js";
import { BCRYPT_ROUNDS } from "../../lib/env.js";

export const REFRESH_COOKIE = "refreshToken";

export interface RequestMeta {
    userAgent?: string;
    ip?: string;
};

type SafeUser = Omit<UserModel, "passwordHash">;

const safeUser = (user:UserModel):SafeUser => {
    const {passwordHash:_password, ...rest} = user;
    return rest;
};

// compared against when the email is unknown, so login takes the same
// time whether or not the account exists (no user enumeration via timing)
const DUMMY_HASH = bcrypt.hash("timing-equalization-placeholder", BCRYPT_ROUNDS);

export class AuthService {

    constructor (
        private authRepository:AuthRepository,
        private refreshTokenRepository:RefreshTokenRepository,
        private otpService:OtpService,
        private emailService:EmailService,
        private tokenService:TokenService,
    ){};

    async register (data:RegisterInput){

        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (existingUser){
            throw Conflict("Email already in use");
        };

        const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
        const newUser = await this.authRepository.createUser({
            fullName:data.fullName,
            email:data.email,
            passwordHash:hashedPassword
        });

        try {
            const code = await this.otpService.createOtp(newUser.id,OtpPurpose.EMAIL_VERIFICATION);
            await this.emailService.sendVerificationEmail(newUser.email,newUser.fullName,code);
        } catch (error){
            await this.authRepository.deleteUserById(newUser.id);
            throw error;
        };

        return safeUser(newUser);
    };

    async verifyEmail (data:VerifyEmailInput){

        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user) throw BadRequest("Invalid verification request");
        if (user.emailVerifiedAt) return safeUser(user);

        await this.otpService.verifyOtp(user.id,OtpPurpose.EMAIL_VERIFICATION,data.code);
        const updated = await this.authRepository.setEmailVerified(user.id);

        return safeUser(updated);
    };

    async resendVerification (data:{email:string}){

        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user) throw BadRequest("Invalid verification request");
        if (user.emailVerifiedAt) throw Forbidden("Email already verified");

        const code = await this.otpService.createOtp(user.id,OtpPurpose.EMAIL_VERIFICATION);
        await this.emailService.sendVerificationEmail(user.email,user.fullName,code);
    };

    async login (data:LoginInput, meta:RequestMeta){

        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user){
            await bcrypt.compare(data.password, await DUMMY_HASH);
            throw Unauthorized("Invalid email or password");
        }

        const valid = await bcrypt.compare(data.password,user.passwordHash);
        if (!valid) throw Unauthorized("Invalid email or password");

        if (!user.emailVerifiedAt) throw Forbidden("Email not verified");

        const {token, tokenHash} = this.tokenService.generateRefreshToken();
        await this.refreshTokenRepository.create(
            user.id,
            tokenHash,
            this.tokenService.refreshExpiryDate(),
            meta.userAgent,
            meta.ip
        );

        return {
            accessToken:this.tokenService.signAccessToken(user.id),
            refreshToken:token,
            user:safeUser(user)
        };
    };

    async refresh (token:string, meta:RequestMeta){

        const tokenHash = this.tokenService.hashRefreshToken(token);
        const stored = await this.refreshTokenRepository.findByHash(tokenHash);
        if (!stored) throw Unauthorized("Invalid refresh token");

        if (stored.revokedAt){
            // reuse of a rotated/revoked token — assume theft, kill all sessions
            await this.refreshTokenRepository.revokeAllForUser(stored.userId);
            throw Unauthorized("Refresh token reuse detected");
        };

        if (stored.expiresAt < new Date()) throw Unauthorized("Refresh token expired");

        await this.refreshTokenRepository.revoke(stored.id);

        const {token:newToken, tokenHash:newHash} = this.tokenService.generateRefreshToken();
        await this.refreshTokenRepository.create(
            stored.userId,
            newHash,
            this.tokenService.refreshExpiryDate(),
            meta.userAgent,
            meta.ip
        );

        return {
            accessToken:this.tokenService.signAccessToken(stored.userId),
            refreshToken:newToken
        };
    };

    async logout (token:string){

        const tokenHash = this.tokenService.hashRefreshToken(token);
        const stored = await this.refreshTokenRepository.findByHash(tokenHash);
        if (stored && !stored.revokedAt){
            await this.refreshTokenRepository.revoke(stored.id);
        };
    };

    async forgotPassword (data:ForgotPasswordInput){

        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user) return; // no enumeration

        const code = await this.otpService.createOtp(user.id,OtpPurpose.PASSWORD_RESET);
        await this.emailService.sendPasswordResetEmail(user.email,user.fullName,code);
    };

    async verifyResetCode (data:VerifyResetCodeInput){

        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user) throw BadRequest("Invalid or expired code");

        try {
            await this.otpService.checkOtp(user.id,OtpPurpose.PASSWORD_RESET,data.code);
        } catch (error){
            // one generic message so probing an email never reveals whether it exists
            if (error instanceof Error && error.message === "OTP max attempts exceeded")
                throw BadRequest("Too many attempts — request a new code");
            throw BadRequest("Invalid or expired code");
        }
    };

    async resetPassword (data:ResetPasswordInput){

        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user) throw BadRequest("Invalid reset request");

        await this.otpService.verifyOtp(user.id,OtpPurpose.PASSWORD_RESET,data.code);

        const hashedPassword = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
        await this.authRepository.updatePassword(user.id,hashedPassword);
        await this.refreshTokenRepository.revokeAllForUser(user.id);
    };

    async getMe (userId:string){
        const user = await this.authRepository.finduserById(userId);
        if (!user) throw Unauthorized("User not found");
        return safeUser(user);
    };
}
