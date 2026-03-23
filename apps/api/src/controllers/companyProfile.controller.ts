import { Request, Response, NextFunction } from 'express';
import { CompanyProfile, ICompanyProfile } from '../models/CompanyProfile';
import { User, IUser } from '../models/User';
import { Role } from '../models/Role';
import { Accumulation } from '../models/Accumulation';
import { AuthRequest, requireCompanyProfile } from '../middlewares/auth.middleware';

interface ExtendedAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Get company details including company profile and user info
 * GET /api/v1/company/details
 */
export const getCompanyDetails = async (req: ExtendedAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }

    // Fetch company profile using JWT-derived user ID
    const profile = await CompanyProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    // Fetch user info
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Company details retrieved successfully',
      data: {
        company: {
          _id: profile._id,
          name: profile.name,
          industry: profile.industry,
          size: profile.size,
          founded: profile.founded,
          description: profile.description,
          logo: profile.logo,
          website: profile.website,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          targetStudents: profile.targetStudents,
        },
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update company profile (partial update with only changed fields)
 * PATCH /api/v1/company/profile
 */
export const updateCompanyProfile = async (req: ExtendedAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }

    // Get allowed fields for update
    const allowedFields = [
      'name', 'industry', 'size', 'founded', 'description',
      'logo', 'website', 'email', 'phone', 'address', 'targetStudents'
    ];

    // Filter request body to only include allowed fields
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update',
        allowedFields,
      });
    }

    // Validate description if provided
    if (updateData.description) {
      const desc = updateData.description as string;
      if (desc.length < 20 || desc.length > 2000) {
        return res.status(400).json({
          message: 'Description must be between 20 and 2000 characters',
        });
      }
    }

    // Validate targetStudents if provided
    if (updateData.targetStudents) {
      const targetStudents = updateData.targetStudents as Array<{ field: string; level: string; skills?: string[] }>;

      if (!Array.isArray(targetStudents)) {
        return res.status(400).json({
          message: 'targetStudents must be an array',
        });
      }

      if (targetStudents.length > 10) {
        return res.status(400).json({
          message: 'Maximum 10 target student preferences allowed',
        });
      }

      for (const student of targetStudents) {
        if (!student.field || !student.level) {
          return res.status(400).json({
            message: 'Each target student must have field and level',
          });
        }
        if (student.skills && student.skills.length > 20) {
          return res.status(400).json({
            message: 'Maximum 20 skills allowed per target student',
          });
        }
      }
    }

    // Find and update profile (create if doesn't exist) using JWT-derived user ID
    const profile = await CompanyProfile.findOneAndUpdate(
      { user: userId },
      updateData,
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      message: 'Company profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get company profile for the authenticated user
 * GET /api/v1/company/profile
 */
export const getCompanyProfile = async (req: ExtendedAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }

    const profile = await CompanyProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    res.json({
      message: 'Company profile retrieved successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update company profile
 * PUT /api/v1/company/profile
 */
export const upsertCompanyProfile = async (req: ExtendedAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }

    const {
      name,
      industry,
      size,
      founded,
      description,
      logo,
      website,
      email,
      phone,
      address,
      targetStudents,
    } = req.body;

    // Validate required fields
    if (!name || !industry || !size || !founded || !description || !email) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'industry', 'size', 'founded', 'description', 'email'],
      });
    }

    // Validate description length
    if (description.length < 20 || description.length > 2000) {
      return res.status(400).json({
        message: 'Description must be between 20 and 2000 characters',
      });
    }

    // Validate target students if provided
    if (targetStudents && !Array.isArray(targetStudents)) {
      return res.status(400).json({
        message: 'targetStudents must be an array',
      });
    }

    if (targetStudents && targetStudents.length > 10) {
      return res.status(400).json({
        message: 'Maximum 10 target student preferences allowed',
      });
    }

    // Validate each target student
    if (targetStudents) {
      for (const student of targetStudents) {
        if (!student.field || !student.level) {
          return res.status(400).json({
            message: 'Each target student must have field and level',
          });
        }
        if (student.skills && student.skills.length > 20) {
          return res.status(400).json({
            message: 'Maximum 20 skills allowed per target student',
          });
        }
      }
    }

    // Upsert (update or insert) using JWT-derived user ID
    const profile = await CompanyProfile.findOneAndUpdate(
      { user: userId },
      {
        name,
        industry,
        size,
        founded,
        description,
        logo,
        website,
        email,
        phone,
        address,
        targetStudents: targetStudents || [],
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json({
      message: 'Company profile saved successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update company logo only
 * PATCH /api/v1/company/profile/logo
 */
export const updateCompanyLogo = async (req: ExtendedAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }

    const { logo } = req.body;

    if (!logo) {
      return res.status(400).json({ message: 'Logo data is required' });
    }

    const profile = await CompanyProfile.findOneAndUpdate(
      { user: userId },
      { logo },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Company logo updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a target student preference
 * POST /api/v1/company/profile/target-students
 */
export const addTargetStudent = async (req: ExtendedAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }

    const { field, level, skills } = req.body;

    if (!field || !level) {
      return res.status(400).json({
        message: 'Field and level are required',
      });
    }

    // Find or create profile using JWT-derived user ID
    let profile = await CompanyProfile.findOne({ user: userId });

    if (!profile) {
      // Create a new profile with minimal required fields
      profile = await CompanyProfile.create({
        user: userId,
        name: '',
        industry: '',
        size: '',
        founded: '',
        description: '',
        targetStudents: [],
      });
    }

    if (profile.targetStudents.length >= 10) {
      return res.status(400).json({
        message: 'Maximum 10 target student preferences allowed',
      });
    }

    profile.targetStudents.push({
      field,
      level,
      skills: skills || [],
    });

    await profile.save();

    res.json({
      message: 'Target student preference added successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a target student preference
 * DELETE /api/v1/company/profile/target-students/:id
 */
export const removeTargetStudent = async (req: ExtendedAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }

    const { id } = req.params;

    const profile = await CompanyProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const initialLength = profile.targetStudents.length;
    profile.targetStudents = profile.targetStudents.filter(
      (student) => student._id?.toString() !== id
    );

    // Only save if a student was actually removed
    if (profile.targetStudents.length < initialLength) {
      await profile.save();
    }

    res.json({
      message: 'Target student preference removed successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a company profile (for school users)
 * Also creates a company user account and links it to the profile
 * POST /api/v1/company/profiles
 */
export const createCompanyProfileBySchool = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name, industry, size, founded, description,
      logo, website, email, phone, address, targetStudents,
      userEmail, userPassword,
    } = req.body;

    if (!name || !industry || !size || !founded || !description || !email) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'industry', 'size', 'founded', 'description', 'email'],
      });
    }

    if (!userEmail || !userPassword) {
      return res.status(400).json({
        message: 'Company user credentials are required',
        required: ['userEmail', 'userPassword'],
      });
    }

    // Dynamically import to avoid circular deps
    const { User } = await import('../models/User');
    const bcrypt = await import('bcryptjs');

    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(userPassword, 10);
    const companyUser = await User.create({
      email: userEmail,
      password: passwordHash,
      role: 'company',
      isVerified: true,
    });

    let profile;
    try {
      profile = await CompanyProfile.create({
        user: companyUser._id,
        name, industry, size, founded, description,
        logo, website, email, phone, address,
        targetStudents: targetStudents || [],
        createdBySchool: true,
      });
    } catch (profileError) {
      // Roll back user creation if profile fails
      await User.findByIdAndDelete(companyUser._id);
      throw profileError;
    }

    res.status(201).json({
      message: 'Company and user account created successfully',
      profile,
      user: { id: companyUser._id, email: companyUser.email, role: companyUser.role },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all company profiles (for school dashboard)
 * GET /api/v1/company/profiles
 */
export const getAllCompanyProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profiles = await CompanyProfile.find({}).select('-user').lean();
    res.json({ message: 'Company profiles retrieved successfully', profiles });
  } catch (error) {
    next(error);
  }
};

/**
 * Get open roles and accumulations for a company profile (for school dashboard)
 * GET /api/v1/company/profiles/:id/details
 */
export const getCompanyProfileDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const profile = await CompanyProfile.findById(id).lean();
    if (!profile) return res.status(404).json({ message: 'Company profile not found' });

    const [roles, accumulations] = await Promise.all([
      Role.find({ company: profile.user, status: 'Open' })
        .select('title department location type openings applicants salaryMin salaryMax salaryPeriod skills status points')
        .lean(),
      Accumulation.find({ company: id, createdBy: 'company' })
        .select('title type status points skillTags deadline description')
        .lean(),
    ]);

    res.json({ roles, accumulations });
  } catch (error) {
    next(error);
  }
};

/**
 * Get company profile completeness score
 * GET /api/v1/company/profile/completeness
 */
export const getProfileCompleteness = async (req: ExtendedAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID required' });
    }

    const profile = await CompanyProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    // Calculate completeness score (virtual field)
    const completenessScore = (profile as any).completenessScore;

    res.json({
      message: 'Profile completeness calculated successfully',
      completenessScore,
      profile: {
        name: profile.name,
        industry: profile.industry,
        size: profile.size,
        hasLogo: !!profile.logo,
        hasDescription: !!profile.description && profile.description.length >= 100,
        targetStudentsCount: profile.targetStudents.length,
        hasContactInfo: !!profile.email && !!profile.phone,
        hasWebsite: !!profile.website,
      },
    });
  } catch (error) {
    next(error);
  }
};
