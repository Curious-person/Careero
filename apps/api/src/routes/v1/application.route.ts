import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middlewares/auth.middleware';
import * as applicationController from '../../controllers/application.controller';

const router = Router();

// All application routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/applicants/all
 * @desc    Get all applicants across company roles with Careero match scores
 * @access  Private (Company only)
 */
router.get('/all', applicationController.getAllCompanyApplicantsWithScores);

/**
 * @route   GET /api/v1/applicants
 * @desc    Get all applicant users for the company with stats
 * @access  Private (Company only)
 */
router.get('/', applicationController.getCompanyApplicants);

/**
 * @route   GET /api/v1/applicants/roles/:roleId/applicants
 * @desc    Get applicants for a specific role with Careero match scores
 * @access  Private (Company only)
 */
router.get('/roles/:roleId/applicants', applicationController.getRoleApplicantsWithScores);

/**
 * @route   GET /api/v1/applications/stats
 * @desc    Get application statistics for the company
 * @access  Private (Company only)
 */
router.get('/stats', applicationController.getApplicationStats);

/**
 * @route   GET /api/v1/applications
 * @desc    Get all applications for the company
 * @access  Private (Company only)
 */
router.get('/applications', applicationController.getCompanyApplications);

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Get a single application by ID
 * @access  Private (Company only)
 */
router.get('/:id', applicationController.getApplicationById);

/**
 * @route   PATCH /api/v1/applications/:id/notes
 * @desc    Save/update notes for an application
 * @access  Private (Company only)
 */
router.patch('/:id/notes', applicationController.saveApplicationNotes);

/**
 * @route   PATCH /api/v1/applications/:id/status
 * @desc    Update application status
 * @access  Private (Company only)
 */
router.patch('/:id/status', applicationController.updateApplicationStatus);

export default router;
