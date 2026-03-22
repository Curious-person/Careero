"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInterviewInvitation = exports.sendOtpEmail = void 0;
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
const sendInterviewInvitation = async (options) => {
    const { to, applicantName, companyName, roleName, date, time, duration, meetingType, meetingLink, } = options;
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const meetingTypeText = {
        video: 'Video Call',
        phone: 'Phone Call',
        'in-person': 'In-Person Meeting',
    }[meetingType];
    const meetingInstructions = {
        video: meetingLink
            ? `Join the meeting using this link: <a href="${meetingLink}" style="color: #0066cc;">${meetingLink}</a>`
            : 'Meeting link will be provided separately.',
        phone: 'The company will call you at the scheduled time. Please ensure your phone is available.',
        'in-person': meetingLink
            ? `Location: ${meetingLink}`
            : 'Location details will be provided separately.',
    }[meetingType];
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
        from: `"${companyName} Recruiting" <recruiting@careero.com>`,
        to,
        subject: `Interview Invitation - ${roleName} at ${companyName}`,
        text: `
Dear ${applicantName},

We are pleased to invite you for an interview for the position of ${roleName} at ${companyName}.

Interview Details:
- Date: ${formattedDate}
- Time: ${time}
- Duration: ${duration} minutes
- Type: ${meetingTypeText}
${meetingLink ? `- Link/Location: ${meetingLink}` : ''}

Please confirm your availability for this interview slot.

Best regards,
${companyName} Recruiting Team
    `.trim(),
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Interview Invitation</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${companyName}</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 16px 16px;">
          <p style="font-size: 16px; margin-bottom: 24px;">Dear ${applicantName},</p>
          
          <p style="font-size: 16px; margin-bottom: 24px; line-height: 1.6;">
            We are pleased to invite you for an interview for the position of 
            <strong style="color: #667eea;">${roleName}</strong> at <strong>${companyName}</strong>.
          </p>

          <!-- Interview Details Card -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1a1a1a;">📅 Interview Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Date:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Time:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Duration:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${duration} minutes</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Type:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${meetingTypeText}</td>
              </tr>
            </table>

            <!-- Meeting Link/Instructions -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">📍 ${meetingInstructions}</p>
            </div>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 32px 0;">
            <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
              Please confirm your availability for this interview slot.
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e5e5; padding-top: 24px; text-align: center;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Best regards,<br/>
              <strong style="color: #1a1a1a;">${companyName} Recruiting Team</strong>
            </p>
          </div>
        </div>

        <!-- Secondary Footer -->
        <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
          <p style="margin: 0;">This is an automated message from Careero platform.</p>
          <p style="margin: 8px 0 0 0;">Please do not reply directly to this email.</p>
        </div>
      </div>
    `,
    });
    if (!env_1.env.SMTP_HOST) {
        console.log(`\n📧  Interview Invitation Sent! Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}\n`);
    }
    return info;
};
exports.sendInterviewInvitation = sendInterviewInvitation;
