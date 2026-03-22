import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import * as interviewController from '../../controllers/interview.controller';

const router = Router();

// All interview routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/interviews/schedule
 * @desc    Schedule a new interview and send invitation
 * @access  Private (Company only)
 */
router.post('/schedule', interviewController.scheduleInterview);

/**
 * @route   GET /api/v1/interviews
 * @desc    Get all interviews for the company
 * @access  Private (Company only)
 */
router.get('/', interviewController.getCompanyInterviews);

/**
 * @route   GET /api/v1/interviews/:id
 * @desc    Get a specific interview by ID
 * @access  Private (Company only)
 */
router.get('/:id', interviewController.getInterviewById);

/**
 * @route   GET /api/v1/interviews/:id/is-active
 * @desc    Check if interview date/time matches current time
 * @access  Private (Company only)
 */
router.get('/:id/is-active', interviewController.checkInterviewActive);

/**
 * @route   PATCH /api/v1/interviews/:id/confirm
 * @desc    Confirm a pending interview
 * @access  Private (Company only)
 */
router.patch('/:id/confirm', interviewController.confirmInterview);

/**
 * @route   PATCH /api/v1/interviews/:id/cancel
 * @desc    Cancel an interview
 * @access  Private (Company only)
 */
router.patch('/:id/cancel', interviewController.cancelInterview);

/**
 * @route   PATCH /api/v1/interviews/:id/reschedule
 * @desc    Reschedule an interview
 * @access  Private (Company only)
 */
router.patch('/:id/reschedule', interviewController.rescheduleInterview);

/**
 * @route   PATCH /api/v1/interviews/:id/complete
 * @desc    Complete an interview and add feedback
 * @access  Private (Company only)
 */
router.patch('/:id/complete', interviewController.completeInterview);

export default router;
