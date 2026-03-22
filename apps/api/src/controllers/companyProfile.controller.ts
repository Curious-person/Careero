import { Request, Response, NextFunction } from 'express';
import { CompanyProfile, ICompanyProfile } from '../models/CompanyProfile';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Get company profile for the authenticated user
 * GET /api/v1/company/profile
 */
export const getCompanyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
export const upsertCompanyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    // Upsert (update or insert)
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
export const updateCompanyLogo = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

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
export const addTargetStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const profile = await CompanyProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
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
export const removeTargetStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    profile.targetStudents = profile.targetStudents.filter(
      (student) => student._id?.toString() !== id
    );

    await profile.save();

    res.json({
      message: 'Target student preference removed successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get company profile completeness score
 * GET /api/v1/company/profile/completeness
 */
export const getProfileCompleteness = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
