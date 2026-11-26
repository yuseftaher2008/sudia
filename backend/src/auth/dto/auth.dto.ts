import { z } from "zod";

export const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Keep your password under 128 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a symbol");

export const RegisterDto = z.strictObject({
    fullName: z.string().min(1).max(200),
    email: z.email().max(320),
    password: passwordSchema,
});

export const VerifyEmailDto = z.object({
    email: z.email().max(320),
    code: z.string().regex(/^\d{6}$/),
});

export const ResendVerificationDto = z.object({
    email: z.email().max(320),
});

export const LoginDto = z.strictObject({
    email: z.email().max(320),
    password: z.string().min(1).max(72),
});

export const RefreshDto = z.object({}).optional();

export const ForgotPasswordDto = z.object({
    email: z.email().max(320),
});

export const VerifyResetCodeDto = z.object({
    email: z.email().max(320),
    code: z.string().regex(/^\d{6}$/),
});

export const ResetPasswordDto = z.object({
    email: z.email().max(320),
    code: z.string().regex(/^\d{6}$/),
    newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailDto>;
export type ResendVerificationInput = z.infer<typeof ResendVerificationDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordDto>;
export type VerifyResetCodeInput = z.infer<typeof VerifyResetCodeDto>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordDto>;
