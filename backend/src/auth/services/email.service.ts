import { transporter } from "../../lib/mailer.js";

export class EmailService {

    async sendVerificationEmail (to:string, fullName:string, code:string){
        await transporter.sendMail({
            from:`"Studia" <${process.env.EMAIL_USER}>`,
            to,
            subject:"Verify your email",
            html:`
                <p>Hi ${escapeHtml(fullName)},</p>
                <p>Your verification code is:</p>
                <p style="font-size:24px;letter-spacing:4px;"><b>${code}</b></p>
                <p>This code expires in 10 minutes.</p>
                <p>If you didn't create a Studia account, ignore this email.</p>
            `,
        });
    };

    async sendPasswordResetEmail (to:string, fullName:string, code:string){
        await transporter.sendMail({
            from:`"Studia" <${process.env.EMAIL_USER}>`,
            to,
            subject:"Reset your password",
            html:`
                <p>Hi ${escapeHtml(fullName)},</p>
                <p>Your password reset code is:</p>
                <p style="font-size:24px;letter-spacing:4px;"><b>${code}</b></p>
                <p>This code expires in 10 minutes.</p>
                <p>If you didn't request this, ignore this email.</p>
            `,
        });
    };
};

const escapeHtml = (value:string) => value
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
