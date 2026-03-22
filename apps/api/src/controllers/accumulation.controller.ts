import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as accumulationService from '../services/accumulation.service';

/**
 * ===========================
 * SHARED HANDLERS (Read-only)
 * ===========================
 */

/**
 * GET /api/v1/accumulations
 * Get all accumulations (filtered by source query param)
 * Accessible by: school, company
 */
export const getAccumulations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source } = req.query;
    const data = await accumulationService.getAllAccumulations(source as string | undefined);
    res.json({ message: 'Accumulations retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/accumulations/:id
 * Get a single accumulation by ID
 * Accessible by: school, company
 */
export const getAccumulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accum = await accumulationService.getAccumulationById(req.params.id);
    if (!accum) return res.status(404).json({ message: 'Accumulation not found' });
    res.json({ message: 'Accumulation retrieved successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

/**
 * ===========================
 * SCHOOL-SPECIFIC HANDLERS
 * ===========================
 */

/**
 * POST /api/v1/accumulations/school
 * Create a new accumulation (school)
 * Accessible by: school only
 */
export const createSchoolAccumulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const accum = await accumulationService.createAccumulation({
      ...req.body,
      source: 'school',
      createdBy: 'school',
    });
    res.status(201).json({ message: 'Accumulation created successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/accumulations/school/:id/end
 * End a school accumulation
 * Accessible by: school only
 */
export const endSchoolAccumulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const accum = await accumulationService.endAccumulation(req.params.id, 'school');
    res.json({ message: 'Accumulation ended successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/accumulations/school/:id/grade
 * Grade a participant in a school accumulation
 * Accessible by: school only
 */
export const gradeSchoolParticipant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { participantName, grade, skillRatings, feedback } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const accum = await accumulationService.gradeParticipant(req.params.id, participantName, {
      grade,
      skillRatings,
      feedback,
    });
    res.json({ message: 'Participant graded successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/accumulations/school/:id
 * Delete a school accumulation
 * Accessible by: school only
 */
export const deleteSchoolAccumulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    await accumulationService.deleteAccumulation(req.params.id, 'school');
    res.json({ message: 'Accumulation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/accumulations/school/my
 * Get all accumulations created by school
 * Accessible by: school only
 */
export const getMySchoolAccumulations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const data = await accumulationService.getAccumulationsByCreator('school');
    res.json({ message: 'School accumulations retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

/**
 * ===========================
 * COMPANY-SPECIFIC HANDLERS
 * ===========================
 */

/**
 * POST /api/v1/accumulations/company
 * Create a new accumulation (company)
 * Accessible by: company only
 */
export const createCompanyAccumulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const accum = await accumulationService.createAccumulation({
      ...req.body,
      source: 'company',
      createdBy: 'company', // Hardcoded as per requirement
    });
    res.status(201).json({ message: 'Accumulation created successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/accumulations/company/:id/end
 * End a company accumulation
 * Accessible by: company only
 */
export const endCompanyAccumulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const accum = await accumulationService.endAccumulation(req.params.id, 'company');
    res.json({ message: 'Accumulation ended successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/accumulations/company/:id/grade
 * Grade a participant in a company accumulation
 * Accessible by: company only
 */
export const gradeCompanyParticipant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { participantName, grade, skillRatings, feedback } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const accum = await accumulationService.gradeParticipant(req.params.id, participantName, {
      grade,
      skillRatings,
      feedback,
    });
    res.json({ message: 'Participant graded successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/accumulations/company/:id
 * Delete a company accumulation
 * Accessible by: company only
 */
export const deleteCompanyAccumulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    await accumulationService.deleteAccumulation(req.params.id, 'company');
    res.json({ message: 'Accumulation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/accumulations/company
 * Get all accumulations (for dropdowns/selection when creating roles)
 * Accessible by: company only
 */
export const getCompanyAccumulations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    console.log('getCompanyAccumulations - User ID:', userId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    // Get ALL accumulations (from school and other companies) for selection
    // This allows companies to link their roles to any relevant accumulation
    console.log('Fetching all accumulations...');
    const data = await accumulationService.getAllAccumulations(undefined);
    console.log('Fetched accumulations count:', data.length);
    res.json({ message: 'All accumulations retrieved successfully', data });
  } catch (error) {
    console.error('Error in getCompanyAccumulations:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    next(error);
  }
};

/**
 * GET /api/v1/accumulations/company/my
 * Get all accumulations created by company
 * Accessible by: company only
 */
export const getMyCompanyAccumulations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const data = await accumulationService.getAccumulationsByCreator('company');
    res.json({ message: 'Company accumulations retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

/**
 * ===========================
 * STUDENT-SPECIFIC HANDLERS
 * ===========================
 */

/**
 * GET /api/v1/accumulations/student/available
 * Returns all Active/Closing Soon accumulations filtered by the student's course.
 * Accessible by: student only
 */
export const getStudentAccumulations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { StudentProfile } = await import('../models/StudentProfile');
    const profile = await StudentProfile.findOne({ user: userId }).lean();
    if (!profile) return res.status(404).json({ message: 'Student profile not found. Please complete onboarding.' });

    const course = (profile as any).basicInfo?.course;
    if (!course) return res.status(400).json({ message: 'Course not set in your profile.' });

    const { Accumulation } = await import('../models/Accumulation');
    const data = await Accumulation.find({
      courses: course,
      status: { $ne: 'Ended' }
    }).lean();

    res.json({ message: 'Accumulations retrieved successfully', data, studentCourse: course });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/accumulations/:id/join
 * Adds the authenticated student to an accumulation's participantList.
 * Accessible by: student only
 */
export const joinAccumulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { StudentProfile } = await import('../models/StudentProfile');
    const profile = await StudentProfile.findOne({ user: userId }).lean();
    if (!profile) return res.status(404).json({ message: 'Student profile not found.' });

    const studentName = `${(profile as any).basicInfo?.firstName} ${(profile as any).basicInfo?.lastName}`.trim();
    const studentCourse = (profile as any).basicInfo?.course || '';

    const { Accumulation } = await import('../models/Accumulation');
    const accum = await Accumulation.findById(req.params.id);
    if (!accum) return res.status(404).json({ message: 'Accumulation not found' });

    // Check if already joined
    const alreadyJoined = accum.participantList.some((p: any) => p.name === studentName);
    if (alreadyJoined) return res.status(409).json({ message: 'You have already joined this accumulation.' });

    accum.participantList.push({ name: studentName, course: studentCourse, status: 'In Progress' });
    accum.participants = accum.participantList.length;
    await accum.save();

    res.json({ message: 'Successfully joined the accumulation!', data: accum });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/accumulations/:id/complete
 * Marks the student as Completed in the participantList AND awards points/skillTags to their StudentProfile.
 * Accessible by: student only
 */
export const completeAccumulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { StudentProfile } = await import('../models/StudentProfile');
    const profile = await StudentProfile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ message: 'Student profile not found.' });

    const studentName = `${(profile as any).basicInfo?.firstName} ${(profile as any).basicInfo?.lastName}`.trim();

    const { Accumulation } = await import('../models/Accumulation');
    const accum = await Accumulation.findById(req.params.id);
    if (!accum) return res.status(404).json({ message: 'Accumulation not found' });

    // Find participant entry
    const participant = accum.participantList.find((p: any) => p.name === studentName);
    if (!participant) return res.status(400).json({ message: 'You have not joined this accumulation yet.' });
    if ((participant as any).status === 'Completed') return res.status(409).json({ message: 'You have already completed this accumulation.' });

    // Mark as completed in the accumulation
    (participant as any).status = 'Completed';
    await accum.save();

    // ── Award Points to StudentProfile ──
    const bonusPoints = accum.points || 0;
    const currentAccumPts = (profile as any).pointsBreakdown?.accumulations || 0;
    const newAccumPts = currentAccumPts + bonusPoints;

    // Merge new skill tags (accumulation.skillTags) into the profile's skillTags
    const existingTags: string[] = ((profile as any).skillTags || []).map((t: any) => (typeof t === 'string' ? t : t.tag));
    const newTags = (accum.skillTags || []).filter((tag: string) => !existingTags.includes(tag));
    const mergedTags = [
      ...(profile as any).skillTags,
      ...newTags.map((tag: string) => ({ tag, confidence: 0.80 }))
    ];

    // Recalculate total points
    const currentTotal = (profile as any).totalPoints || 0;
    const newTotal = currentTotal + bonusPoints;

    await StudentProfile.findByIdAndUpdate((profile as any)._id, {
      $set: {
        skillTags: mergedTags,
        totalPoints: newTotal,
        'pointsBreakdown.accumulations': newAccumPts,
      }
    });

    res.json({
      message: `Accumulation completed! You earned +${bonusPoints} points and ${newTags.length} new skill tags.`,
      awardedPoints: bonusPoints,
      newSkillTags: newTags,
      newTotal,
    });
  } catch (error) {
    next(error);
  }
};
