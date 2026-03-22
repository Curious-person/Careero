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
