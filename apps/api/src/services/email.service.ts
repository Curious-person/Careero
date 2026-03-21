import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create a transporter using either provided SMTP credentials or Ethereal for dev
const createTransporter = async () => {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal mock email for testing
  const testAccount = await nodemailer.createTestAccount();
  console.log('Using Ethereal mock email for SMTP.');

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendOtpEmail = async (to: string, code: string) => {
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

  if (!env.SMTP_HOST) {
    console.log(`\n📧  Mock Email Sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`);
  }

  return info;
};
