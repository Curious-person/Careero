"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOtpFormat = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (req, res, next) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ message: 'Email is required' });
    // Standard email regex format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address format' });
    }
    next();
};
exports.validateEmail = validateEmail;
const validatePassword = (req, res, next) => {
    const { password } = req.body;
    if (!password)
        return res.status(400).json({ message: 'Password is required' });
    // Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long and contain one uppercase, one lowercase letter, one number, and one special character'
        });
    }
    next();
};
exports.validatePassword = validatePassword;
const validateOtpFormat = (req, res, next) => {
    const { otp } = req.body;
    if (!otp)
        return res.status(400).json({ message: 'OTP code is required' });
    // Strictly exactly 6 numerical digits
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
        return res.status(400).json({ message: 'OTP must be exactly 6 digits' });
    }
    next();
};
exports.validateOtpFormat = validateOtpFormat;
