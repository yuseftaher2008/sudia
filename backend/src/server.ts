import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import { AuthRepository } from "./auth/repositorys/auth.repository.js";
import { RefreshTokenRepository } from "./auth/repositorys/refresh-token.repository.js";
import { OtpRepository } from "./auth/repositorys/otp.repository.js";
import { OtpService } from "./auth/services/otp.service.js";
import { EmailService } from "./auth/services/email.service.js";
import { TokenService } from "./auth/services/token.service.js";
import { AuthService } from "./auth/services/auth.service.js";
import { createAuthRouter } from "./auth/routes/auth.routes.js";
import { AppError } from "./lib/errors.js";

const Port:number = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: corsOrigins,
    credentials: true,
}));

const authRepository = new AuthRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const otpRepository = new OtpRepository();
const otpService = new OtpService(otpRepository);
const emailService = new EmailService();
const tokenService = new TokenService();
const authService = new AuthService(
    authRepository,
    refreshTokenRepository,
    otpService,
    emailService,
    tokenService
);

app.get("/api",(_req,res) => {
    res.json("hello world!")
});

app.use("/api/auth", createAuthRouter(authService, tokenService));

app.use((err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction) => {
    if (err instanceof AppError){
        res.status(err.status).json({message:err.message});
        return;
    };
    console.error(err);
    res.status(500).json({message:"Internal server error"});
});

app.listen(Port, ()=> {
    console.log(`listening on port : ${Port}`)
})
