import { Router } from 'express';
import * as profileController from '../../controllers/profile.controller';
import { llmLimiter } from '../../middlewares/rateLimiter';

const router = Router();

/**
 * IMPORTANT: Static prefix routes must be declared BEFORE wildcard routes (/:id, /:id/verify, etc.)
 * to prevent Express from treating static path segments as ID params.
 */

// All student profiles (school dashboard)
router.get('/students', profileController.getAllStudents);

// Retrieve mockup subjects and tags for the UI confirmation step
router.get('/mock-academic', profileController.getMockAcademicData);

// Retrieve the securely bound user profile (must be before /:id)
router.get('/me', profileController.getProfile);

// HF Vision OCR Pipeline
router.post('/ocr-upload', profileController.processOcrUpload);

// Formally submit and lock the DB profile
router.post('/onboard', profileController.submitOnboarding);

// Appends validations continuously
router.post('/certifications/add', profileController.addCertification);

// AI Resume Builder endpoints
router.post('/resume/generate', llmLimiter, profileController.generateResume);
router.post('/resume/save', profileController.saveResume);

// School admin actions
router.post('/admin/create', profileController.adminCreateStudent);

// ── Wildcard routes LAST ──────────────────────────────────────────────────
router.get('/:id', profileController.getStudentById);
router.patch('/:id/verify', profileController.verifyStudent);
router.delete('/:id', profileController.deleteStudent);

export default router;
