import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middlewares/auth.middleware';
import * as accumulationController from '../../controllers/accumulation.controller';

const router = Router();

// All accumulation routes require authentication
router.use(authenticateToken);

/**
 * ========================================
 * SHARED ROUTES (Accessible by both roles)
 * ========================================
 */

// GET /api/v1/accumulations - Get all accumulations (optional source filter)
router.get('/', accumulationController.getAccumulations);

/**
 * ========================================
 * SCHOOL-SPECIFIC ROUTES (Must be before /:id)
 * ========================================
 */

// GET /api/v1/accumulations/school/my - Get all school-created accumulations
router.get('/school/my', authorizeRoles('school'), accumulationController.getMySchoolAccumulations);

// POST /api/v1/accumulations/school - Create a new school accumulation
router.post('/school', authorizeRoles('school'), accumulationController.createSchoolAccumulation);

// PATCH /api/v1/accumulations/school/:id/end - End a school accumulation
router.patch('/school/:id/end', authorizeRoles('school'), accumulationController.endSchoolAccumulation);

// POST /api/v1/accumulations/school/:id/grade - Grade a participant (school)
router.post('/school/:id/grade', authorizeRoles('school'), accumulationController.gradeSchoolParticipant);

// DELETE /api/v1/accumulations/school/:id - Delete a school accumulation
router.delete('/school/:id', authorizeRoles('school'), accumulationController.deleteSchoolAccumulation);

/**
 * ========================================
 * COMPANY-SPECIFIC ROUTES (Must be before /:id)
 * ========================================
 */

// GET /api/v1/accumulations/company - Get all accumulations (for dropdowns/selection)
// Note: Returns ALL accumulations so companies can link roles to any relevant accumulation
router.get('/company', authenticateToken, accumulationController.getCompanyAccumulations);

// GET /api/v1/accumulations/company/my - Get all company-created accumulations
router.get('/company/my', authorizeRoles('company'), accumulationController.getMyCompanyAccumulations);

// POST /api/v1/accumulations/company - Create a new company accumulation
router.post('/company', authorizeRoles('company'), accumulationController.createCompanyAccumulation);

// PATCH /api/v1/accumulations/company/:id/end - End a company accumulation
router.patch('/company/:id/end', authorizeRoles('company'), accumulationController.endCompanyAccumulation);

// POST /api/v1/accumulations/company/:id/grade - Grade a participant (company)
router.post('/company/:id/grade', authorizeRoles('company'), accumulationController.gradeCompanyParticipant);

// DELETE /api/v1/accumulations/company/:id - Delete a company accumulation
router.delete('/company/:id', authorizeRoles('company'), accumulationController.deleteCompanyAccumulation);

/**
 * ========================================
 * STUDENT-SPECIFIC ROUTES (Must be before /:id)
 * ========================================
 */

// GET /api/v1/accumulations/student/available - Course-filtered accumulations for logged-in student
router.get('/student/available', accumulationController.getStudentAccumulations);

// POST /api/v1/accumulations/:id/join - Student joins an accumulation
router.post('/:id/join', accumulationController.joinAccumulation);

// POST /api/v1/accumulations/:id/complete - Student marks completion, earns points + skillTags
router.post('/:id/complete', accumulationController.completeAccumulation);

/**
 * ========================================
 * GENERIC ROUTES (Must be last)
 * ========================================
 */

// GET /api/v1/accumulations/:id - Get a single accumulation by ID
router.get('/:id', accumulationController.getAccumulation);

export default router;
