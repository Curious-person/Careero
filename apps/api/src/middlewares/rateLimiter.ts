import rateLimit from 'express-rate-limit';

// Global API rate limit (allow 100 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict OTP request rate limit (allow 3 requests per 5 minutes to prevent email spam)
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3, 
  message: { message: 'You have requested too many OTPs. Please wait 5 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Login rate limit (allow 5 failed attempts per 15 minutes)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: { message: 'Too many login attempts. For security reasons your IP is blocked for 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
