import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Keep your password under 128 characters")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a symbol");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Enter your full name")
      .max(200, "Keep your name under 200 characters"),
    email: z.email("Enter a valid email address").max(320),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don’t match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don’t match",
    path: ["confirmPassword"],
  });

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const next: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!next[key]) next[key] = issue.message;
  }
  return next;
}

export interface PasswordChecks {
  length: boolean;
  lower: boolean;
  upper: boolean;
  number: boolean;
  symbol: boolean;
}

export function passwordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export interface PasswordStrength {
  passed: number;
  filled: number;
  level: 1 | 2 | 3 | 4;
  label: string;
}

export function passwordStrength(password: string): PasswordStrength {
  const checks = passwordChecks(password);
  const passed = Object.values(checks).filter(Boolean).length;

  if (passed <= 1) return { passed, filled: 1, level: 1, label: "Too weak" };
  if (passed === 2) return { passed, filled: 2, level: 2, label: "Weak" };
  if (passed === 3) return { passed, filled: 3, level: 3, label: "Fair" };
  if (passed === 4) return { passed, filled: 4, level: 4, label: "Strong" };
  return { passed, filled: 4, level: 4, label: "Very strong" };
}
