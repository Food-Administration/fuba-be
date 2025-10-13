import * as express from 'express';
import AuthController from './auth.controller';

const router = express.Router();

// New email verification flow
router.post('/initiate-verification', AuthController.initiateEmailVerification);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/register', AuthController.completeRegistration);

// Existing routes
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleSignIn);
router.post('/google-login', AuthController.googleLogin);
router.post('/request-otp', AuthController.requestOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/reset-password', AuthController.newPassword);
router.post('/change-password', AuthController.changePassword);
router.post('/resend-verification-email', AuthController.resendVerificationEmail);

export default router;