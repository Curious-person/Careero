import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service';

const setAuthCookies = (res: Response, jwtToken: string, deviceToken: string) => {
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

export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const exists = await authService.checkEmailExists(email);
    
    // Skip OTP if existing user AND has a valid device session footprint
    const hasDeviceToken = req.cookies && req.cookies.deviceToken;
    const skipOtp = exists && !!hasDeviceToken;

    res.json({ exists, skipOtp });
  } catch (error) {
    next(error);
  }
};

export const requestOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await authService.requestOtp(email);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const isValid = await authService.verifyOtp(email, otp);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role, studentId } = req.body;
    const result = await authService.registerUser(email, password, role, studentId);
    
    setAuthCookies(res, result.jwtToken, result.deviceToken);
    res.json({ message: 'Registration successful', user: result.user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    
    setAuthCookies(res, result.jwtToken, result.deviceToken);
    res.json({ message: 'Login successful', user: result.user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.clearCookie('deviceToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's email, role, and display name.
 * Resolves the display name from the role-specific profile.
 */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const userId = decoded.id;
    const { User } = await import('../models/User');
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    let displayName = (user as any).email.split('@')[0]; // fallback: email prefix

    // Resolve name from role-specific profile
    if ((user as any).role === 'student') {
      const { StudentProfile } = await import('../models/StudentProfile');
      const profile = await StudentProfile.findOne({ user: userId }).lean();
      if (profile && (profile as any).basicInfo?.firstName) {
        const { firstName, lastName } = (profile as any).basicInfo;
        displayName = `${firstName} ${lastName}`.trim();
      }
    } else if ((user as any).role === 'company') {
      const { CompanyProfile } = await import('../models/CompanyProfile');
      const profile = await CompanyProfile.findOne({ user: userId }).lean();
      if (profile && (profile as any).companyName) {
        displayName = (profile as any).companyName;
      }
    } else if ((user as any).role === 'school') {
      // School users typically just have the email as identifier
      displayName = (user as any).email.split('@')[0];
    }

    return res.json({
      email: (user as any).email,
      role: (user as any).role,
      displayName,
    });
  } catch (error) {
    next(error);
  }
};
