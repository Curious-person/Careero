import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import * as companyProfileController from '../../controllers/companyProfile.controller';

const router = Router();

// All company profile routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/company/profile
 * @desc    Get company profile for authenticated user
 * @access  Private (Company only)
 */
router.get('/', companyProfileController.getCompanyProfile);

/**
 * @route   PUT /api/v1/company/profile
 * @desc    Create or update company profile
 * @access  Private (Company only)
 */
router.put('/', companyProfileController.upsertCompanyProfile);

/**
 * @route   PATCH /api/v1/company/profile/logo
 * @desc    Update company logo only
 * @access  Private (Company only)
 */
router.patch('/logo', companyProfileController.updateCompanyLogo);

/**
 * @route   POST /api/v1/company/profile/target-students
 * @desc    Add a target student preference
 * @access  Private (Company only)
 */
router.post('/target-students', companyProfileController.addTargetStudent);

/**
 * @route   DELETE /api/v1/company/profile/target-students/:id
 * @desc    Remove a target student preference
 * @access  Private (Company only)
 */
router.delete('/target-students/:id', companyProfileController.removeTargetStudent);

/**
 * @route   GET /api/v1/company/profile/completeness
 * @desc    Get company profile completeness score
 * @access  Private (Company only)
 */
router.get('/completeness', companyProfileController.getProfileCompleteness);

export default router;
