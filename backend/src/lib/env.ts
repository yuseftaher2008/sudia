import "dotenv/config";

const MIN_SECRET_LENGTH = 32;

const requireSecret = (name:string):string => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    if (value.length < MIN_SECRET_LENGTH)
        throw new Error(`${name} must be at least ${MIN_SECRET_LENGTH} characters long`);
    return value;
};

export const JWT_SECRET = requireSecret("JWT_SECRET");
export const OTP_SECRET = requireSecret("OTP_SECRET");

const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
if (!Number.isInteger(rounds) || rounds < 10 || rounds > 15)
    throw new Error("BCRYPT_SALT_ROUNDS must be an integer between 10 and 15");
export const BCRYPT_ROUNDS = rounds;

const rawCors = process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGIN ?? ""
    : process.env.CORS_ORIGIN ?? "http://localhost:5173";

export const CORS_ORIGINS = rawCors
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (process.env.NODE_ENV === "production" && CORS_ORIGINS.length === 0)
    throw new Error("CORS_ORIGIN must be set in production");
