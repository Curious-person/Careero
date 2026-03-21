import { Router } from 'express';
import * as profileController from '../../controllers/profile.controller';

const router = Router();

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

export default router;
