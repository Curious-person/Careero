"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = exports.verifyOtp = exports.requestOtp = exports.checkEmail = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authService = __importStar(require("../services/auth.service"));
const setAuthCookies = (res, jwtToken, deviceToken) => {
    res.cookie('jwt', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.cookie('deviceToken', deviceToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};
const checkEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const exists = await authService.checkEmailExists(email);
        // Skip OTP if existing user AND has a valid device session footprint
        const hasDeviceToken = req.cookies && req.cookies.deviceToken;
        const skipOtp = exists && !!hasDeviceToken;
        res.json({ exists, skipOtp });
    }
    catch (error) {
        next(error);
    }
};
exports.checkEmail = checkEmail;
const requestOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        await authService.requestOtp(email);
        res.json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.requestOtp = requestOtp;
const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const isValid = await authService.verifyOtp(email, otp);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        res.json({ message: 'OTP verified successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
const register = async (req, res, next) => {
    try {
        const { email, password, role, studentId } = req.body;
        const result = await authService.registerUser(email, password, role, studentId);
        setAuthCookies(res, result.jwtToken, result.deviceToken);
        res.json({ message: 'Registration successful', user: result.user });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        setAuthCookies(res, result.jwtToken, result.deviceToken);
        res.json({ message: 'Login successful', user: result.user });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        res.clearCookie('deviceToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's email, role, and display name.
 * Resolves the display name from the role-specific profile.
 */
const getMe = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;
        if (!token)
            return res.status(401).json({ message: 'Unauthorized' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
        const user = await User.findById(userId).lean();
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        let displayName = user.email.split('@')[0]; // fallback: email prefix
        // Resolve name from role-specific profile
        if (user.role === 'student') {
            const { StudentProfile } = await Promise.resolve().then(() => __importStar(require('../models/StudentProfile')));
            const profile = await StudentProfile.findOne({ user: userId }).lean();
            if (profile && profile.basicInfo?.firstName) {
                const { firstName, lastName } = profile.basicInfo;
                displayName = `${firstName} ${lastName}`.trim();
            }
        }
        else if (user.role === 'company') {
            const { CompanyProfile } = await Promise.resolve().then(() => __importStar(require('../models/CompanyProfile')));
            const profile = await CompanyProfile.findOne({ user: userId }).lean();
            if (profile && profile.companyName) {
                displayName = profile.companyName;
            }
        }
        else if (user.role === 'school') {
            // School users typically just have the email as identifier
            displayName = user.email.split('@')[0];
        }
        return res.json({
            email: user.email,
            role: user.role,
            displayName,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
