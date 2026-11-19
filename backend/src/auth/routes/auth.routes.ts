import { Router, Request, Response, NextFunction } from "express";
import { AuthService, REFRESH_COOKIE, RequestMeta } from "../services/auth.service.js";
import { TokenService } from "../services/token.service.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/require-auth.js";
import {
    RegisterDto,
    VerifyEmailDto,
    ResendVerificationDto,
    LoginDto,
    ForgotPasswordDto,
    VerifyResetCodeDto,
    ResetPasswordDto,
} from "../dto/auth.dto.js";

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const meta = (req:Request):RequestMeta => ({
    userAgent:req.headers["user-agent"],
    ip:req.ip,
});

const asyncHandler = (fn:(req:Request,res:Response,next:NextFunction)=>Promise<unknown>) =>
    (req:Request,res:Response,next:NextFunction) => fn(req,res,next).catch(next);

export const createAuthRouter = (authService:AuthService, tokenService:TokenService) => {
    const router = Router();
    const auth = requireAuth(tokenService);

    const setRefreshCookie = (res:Response, token:string) => {
        res.cookie(REFRESH_COOKIE, token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            path:"/api/auth",
            maxAge:REFRESH_COOKIE_MAX_AGE,
        });
    };

    const clearRefreshCookie = (res:Response) => {
        res.clearCookie(REFRESH_COOKIE, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            path:"/api/auth",
        });
    };

    router.post("/register", validate(RegisterDto), asyncHandler(async (req,res) => {
        const user = await authService.register(req.body);
        res.status(201).json({user});
    }));

    router.post("/verify-email", validate(VerifyEmailDto), asyncHandler(async (req,res) => {
        const user = await authService.verifyEmail(req.body);
        res.json({user});
    }));

    router.post("/resend-verification", validate(ResendVerificationDto), asyncHandler(async (req,res) => {
        await authService.resendVerification(req.body);
        res.json({message:"Verification email sent"});
    }));

    router.post("/login", validate(LoginDto), asyncHandler(async (req,res) => {
        const {accessToken, refreshToken, user} = await authService.login(req.body, meta(req));
        setRefreshCookie(res, refreshToken);
        res.json({accessToken, user});
    }));

    router.post("/refresh", asyncHandler(async (req,res) => {
        const token = req.cookies[REFRESH_COOKIE];
        if (!token){
            res.status(401).json({message:"Missing refresh token"});
            return;
        };
        const {accessToken, refreshToken} = await authService.refresh(token, meta(req));
        setRefreshCookie(res, refreshToken);
        res.json({accessToken});
    }));

    router.post("/logout", asyncHandler(async (req,res) => {
        const token = req.cookies[REFRESH_COOKIE];
        if (token) await authService.logout(token);
        clearRefreshCookie(res);
        res.json({message:"Logged out"});
    }));

    router.post("/forgot-password", validate(ForgotPasswordDto), asyncHandler(async (req,res) => {
        await authService.forgotPassword(req.body);
        res.json({message:"If that email exists, a reset code was sent"});
    }));

    router.post("/verify-reset-code", validate(VerifyResetCodeDto), asyncHandler(async (req,res) => {
        await authService.verifyResetCode(req.body);
        res.json({message:"Code valid"});
    }));

    router.post("/reset-password", validate(ResetPasswordDto), asyncHandler(async (req,res) => {
        await authService.resetPassword(req.body);
        res.json({message:"Password updated"});
    }));

    router.get("/me", auth, asyncHandler(async (req,res) => {
        const user = await authService.getMe(req.userId!);
        res.json({user});
    }));

    return router;
};
