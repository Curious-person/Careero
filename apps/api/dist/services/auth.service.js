"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.loginUser = exports.verifyOtp = exports.requestOtp = exports.checkEmailExists = void 0;
const User_1 = require("../models/User");
const Otp_1 = require("../models/Otp");
const email_service_1 = require("./email.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const checkEmailExists = async (email) => {
    const user = await User_1.User.findOne({ email });
    return !!user;
};
exports.checkEmailExists = checkEmailExists;
const requestOtp = async (email) => {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // Upsert OTP in database
    await Otp_1.Otp.findOneAndUpdate({ email }, { code, expiresAt }, { upsert: true, new: true });
    // Send the email
    await (0, email_service_1.sendOtpEmail)(email, code);
    return true;
};
exports.requestOtp = requestOtp;
const verifyOtp = async (email, code) => {
    const otpRecord = await Otp_1.Otp.findOne({ email, code });
    if (!otpRecord)
        return false;
    if (otpRecord.expiresAt < new Date()) {
        await Otp_1.Otp.deleteOne({ email }); // Clean up expired
        return false;
    }
    // Delete OTP after successful verification
    await Otp_1.Otp.deleteOne({ email });
    return true;
};
exports.verifyOtp = verifyOtp;
const loginUser = async (email, passwordPlain) => {
    const user = await User_1.User.findOne({ email }).select('+password');
    if (!user || !user.password)
        throw new Error('Invalid credentials');
    const isMatch = await bcryptjs_1.default.compare(passwordPlain, user.password);
    if (!isMatch)
        throw new Error('Invalid credentials');
    return {
        jwtToken: generateToken(user.id),
        deviceToken: generateToken(`${user.id}-device-token`), // unique footprint
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        }
    };
};
exports.loginUser = loginUser;
const registerUser = async (email, passwordPlain, role, studentId) => {
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser)
        throw new Error('User already exists');
    // CRITICAL FIX: Hash the password before saving!
    const passwordHash = await bcryptjs_1.default.hash(passwordPlain, 10);
    const user = await User_1.User.create({
        email,
        password: passwordHash,
        role,
        studentId,
        isVerified: true
    });
    return {
        jwtToken: generateToken(user.id),
        deviceToken: generateToken(`${user.id}-device-token`),
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        }
    };
};
exports.registerUser = registerUser;
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, env_1.env.JWT_SECRET, { expiresIn: '30d' });
};
