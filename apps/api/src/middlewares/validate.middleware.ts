import { Request, Response, NextFunction } from 'express';

export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Standard email regex format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address format' });
  }

  next();
};

export const validatePassword = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password is required' });

  // Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long and contain one uppercase, one lowercase letter, one number, and one special character' 
    });
  }

  next();
};

export const validateOtpFormat = (req: Request, res: Response, next: NextFunction) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ message: 'OTP code is required' });

  // Strictly exactly 6 numerical digits
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    return res.status(400).json({ message: 'OTP must be exactly 6 digits' });
  }

  next();
};
