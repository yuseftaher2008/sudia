import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { CORS_ORIGINS } from "./lib/env.js";
import { securityHeaders, apiRateLimit } from "./lib/security.js";
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

app.disable("x-powered-by");
if (process.env.TRUST_PROXY)
    app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

app.use(securityHeaders);
app.use(apiRateLimit);
app.use(express.json({ limit:"10kb" }));
app.use(cookieParser());
app.use(cors({
    origin:CORS_ORIGINS,
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
    maxAge:86400,
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

app.use((_req,res) => {
    res.status(404).json({message:"Not found"});
});

app.use((err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction) => {
    if (err instanceof AppError){
        res.status(err.status).json({message:err.message});
        return;
    };
    const e = err as {type?:string};
    if (e?.type === "entity.parse.failed"){
        res.status(400).json({message:"Invalid JSON body"});
        return;
    };
    if (e?.type === "entity.too.large"){
        res.status(413).json({message:"Request body too large"});
        return;
    };
    console.error(err);
    res.status(500).json({message:"Internal server error"});
});

app.listen(Port, ()=> {
    console.log(`listening on port : ${Port}`)
})
