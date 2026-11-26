import { Request, Response } from "express";
import { AuthService, REFRESH_COOKIE, RequestMeta } from "../services/auth.service.js";

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const meta = (req:Request):RequestMeta => ({
    userAgent:req.headers["user-agent"],
    ip:req.ip,
});

export const createAuthController = (authService:AuthService) => {
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

    const register = async (req:Request, res:Response) => {
        const user = await authService.register(req.body);
        res.status(201).json({user});
    };

    const verifyEmail = async (req:Request, res:Response) => {
        const user = await authService.verifyEmail(req.body);
        res.json({user});
    };

    const resendVerification = async (req:Request, res:Response) => {
        await authService.resendVerification(req.body);
        res.json({message:"Verification email sent"});
    };

    const login = async (req:Request, res:Response) => {
        const {accessToken, refreshToken, user} = await authService.login(req.body, meta(req));
        setRefreshCookie(res, refreshToken);
        res.json({accessToken, user});
    };

    const refresh = async (req:Request, res:Response) => {
        const token = req.cookies[REFRESH_COOKIE];
        if (!token){
            res.status(401).json({message:"Missing refresh token"});
            return;
        };
        const {accessToken, refreshToken} = await authService.refresh(token, meta(req));
        setRefreshCookie(res, refreshToken);
        res.json({accessToken});
    };

    const logout = async (req:Request, res:Response) => {
        const token = req.cookies[REFRESH_COOKIE];
        if (token) await authService.logout(token);
        clearRefreshCookie(res);
        res.json({message:"Logged out"});
    };

    const forgotPassword = async (req:Request, res:Response) => {
        await authService.forgotPassword(req.body);
        res.json({message:"If that email exists, a reset code was sent"});
    };

    const verifyResetCode = async (req:Request, res:Response) => {
        await authService.verifyResetCode(req.body);
        res.json({message:"Code valid"});
    };

    const resetPassword = async (req:Request, res:Response) => {
        await authService.resetPassword(req.body);
        res.json({message:"Password updated"});
    };

    const getMe = async (req:Request, res:Response) => {
        const user = await authService.getMe(req.userId!);
        res.json({user});
    };

    return {
        register,
        verifyEmail,
        resendVerification,
        login,
        refresh,
        logout,
        forgotPassword,
        verifyResetCode,
        resetPassword,
        getMe,
    };
};

export type AuthController = ReturnType<typeof createAuthController>;
