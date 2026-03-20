import { User } from '../models/User';
import { Otp } from '../models/Otp';
import { sendOtpEmail } from './email.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const checkEmailExists = async (email: string) => {
  const user = await User.findOne({ email });
  return !!user;
};

export const requestOtp = async (email: string) => {
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiration to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Upsert OTP in database
  await Otp.findOneAndUpdate(
    { email },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  // Send the email
  await sendOtpEmail(email, code);
  
  return true;
};

export const verifyOtp = async (email: string, code: string) => {
  const otpRecord = await Otp.findOne({ email, code });
  
  if (!otpRecord) return false;
  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({ email }); // Clean up expired
    return false;
  }

  // Delete OTP after successful verification
  await Otp.deleteOne({ email });
  return true;
};

export const loginUser = async (email: string, passwordPlain: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(passwordPlain, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

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

export const registerUser = async (email: string, passwordPlain: string, role: string, studentId?: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  // CRITICAL FIX: Hash the password before saving!
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  const user = await User.create({
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

const generateToken = (id: string) => {
  return jwt.sign({ id }, env.JWT_SECRET as string, { expiresIn: '30d' });
};
