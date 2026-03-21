"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
// Create a transporter using either provided SMTP credentials or Ethereal for dev
const createTransporter = async () => {
    if (env_1.env.SMTP_HOST && env_1.env.SMTP_USER && env_1.env.SMTP_PASS) {
        return nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST,
            port: Number(env_1.env.SMTP_PORT) || 587,
            secure: Number(env_1.env.SMTP_PORT) === 465,
            auth: {
                user: env_1.env.SMTP_USER,
                pass: env_1.env.SMTP_PASS,
            },
        });
    }
    // Fallback to Ethereal mock email for testing
    const testAccount = await nodemailer_1.default.createTestAccount();
    console.log('Using Ethereal mock email for SMTP.');
    return nodemailer_1.default.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};
const sendOtpEmail = async (to, code) => {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
        from: '"Careero Security" <security@careero.com>',
        to,
        subject: 'Your Careero Verification Code',
        text: `Your verification code is: ${code}. It expires in 10 minutes.`,
        html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Use the following 6-digit code to continue your login or registration:</p>
        <h1 style="letter-spacing: 5px; background: #f4f4f5; padding: 20px; text-align: center; border-radius: 12px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
    });
    if (!env_1.env.SMTP_HOST) {
        console.log(`\n📧  Mock Email Sent! Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}\n`);
    }
    return info;
};
exports.sendOtpEmail = sendOtpEmail;
