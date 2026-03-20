import { Router } from 'express';
import * as authController from '../../controllers/auth.controller';
import { loginLimiter, otpLimiter } from '../../middlewares/rateLimiter';
import { validateEmail, validatePassword, validateOtpFormat } from '../../middlewares/validate.middleware';

const router = Router();

router.post('/check-email', validateEmail, authController.checkEmail);
router.post('/request-otp', otpLimiter, validateEmail, authController.requestOtp);
router.post('/verify-otp', otpLimiter, validateEmail, validateOtpFormat, authController.verifyOtp);
router.post('/register', validateEmail, validatePassword, authController.register);
router.post('/login', loginLimiter, validateEmail, authController.login);

export default router;
