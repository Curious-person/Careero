import { Router } from 'express';
import * as profileController from '../../controllers/profile.controller';
import { llmLimiter } from '../../middlewares/rateLimiter';

const router = Router();

// All student profiles (school dashboard)
router.get('/students', profileController.getAllStudents);
router.get('/:id', profileController.getStudentById);

// School admin actions
router.post('/admin/create', profileController.adminCreateStudent);
router.patch('/:id/verify', profileController.verifyStudent);
router.delete('/:id', profileController.deleteStudent);

// Retrieve mockup subjects and tags for the UI confirmation step
router.get('/mock-academic', profileController.getMockAcademicData);

// HF Vision OCR Pipeline
router.post('/ocr-upload', profileController.processOcrUpload);

// Formally submit and lock the DB profile
router.post('/onboard', profileController.submitOnboarding);

// Retrieve the securely bound user profile
router.get('/me', profileController.getProfile);

// Appends validations continuously
router.post('/certifications/add', profileController.addCertification);

// AI Resume Builder endpoints
router.post('/resume/generate', llmLimiter, profileController.generateResume);
router.post('/resume/save', profileController.saveResume);

export default router;
