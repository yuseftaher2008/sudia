import { Router } from "express";
import { AuthService } from "../services/auth.service.js";
import { TokenService } from "../services/token.service.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authRateLimit, strictRateLimit } from "../../lib/security.js";
import { createAuthController } from "../controllers/auth.controller.js";
import {
    RegisterDto,
    VerifyEmailDto,
    ResendVerificationDto,
    LoginDto,
    ForgotPasswordDto,
    VerifyResetCodeDto,
    ResetPasswordDto,
} from "../dto/auth.dto.js";

export const createAuthRouter = (authService:AuthService, tokenService:TokenService) => {
    const router = Router();
    const ctrl = createAuthController(authService);
    const auth = requireAuth(tokenService);

    router.use(authRateLimit);

    router.post("/register", validate(RegisterDto), asyncHandler(ctrl.register));
    router.post("/verify-email", validate(VerifyEmailDto), asyncHandler(ctrl.verifyEmail));
    router.post("/resend-verification", validate(ResendVerificationDto), asyncHandler(ctrl.resendVerification));
    router.post("/login", strictRateLimit, validate(LoginDto), asyncHandler(ctrl.login));
    router.post("/refresh", asyncHandler(ctrl.refresh));
    router.post("/logout", asyncHandler(ctrl.logout));
    router.post("/forgot-password", strictRateLimit, validate(ForgotPasswordDto), asyncHandler(ctrl.forgotPassword));
    router.post("/verify-reset-code", strictRateLimit, validate(VerifyResetCodeDto), asyncHandler(ctrl.verifyResetCode));
    router.post("/reset-password", strictRateLimit, validate(ResetPasswordDto), asyncHandler(ctrl.resetPassword));
    router.get("/me", auth, asyncHandler(ctrl.getMe));

    return router;
};
