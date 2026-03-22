import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { CompanyProfile } from '../models/CompanyProfile';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as { id: string; role?: string };
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to restrict access to specific user roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Forbidden: Role not found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Access denied for ${req.user.role} role` });
    }

    next();
  };
};

/**
 * Helper function to get company profile from JWT token
 * @param req - AuthRequest with user info from JWT
 * @returns CompanyProfile or null if not found
 */
export const getCompanyProfileFromJwt = async (req: AuthRequest) => {
  const userId = req.user?.id;
  if (!userId) {
    return null;
  }

  const companyProfile = await CompanyProfile.findOne({ user: userId });
  return companyProfile;
};

/**
 * Helper function to require company authentication
 * @param req - AuthRequest with user info from JWT
 * @param res - Response
 * @returns CompanyProfile or sends 401/404 error response
 */
export const requireCompanyProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized: User ID required' });
    return null;
  }

  const companyProfile = await CompanyProfile.findOne({ user: userId });
  if (!companyProfile) {
    res.status(404).json({ message: 'Company profile not found. Please complete your company profile first.' });
    return null;
  }

  return companyProfile;
};
