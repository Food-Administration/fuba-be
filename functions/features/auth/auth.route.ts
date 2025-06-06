import * as express from 'express';
import AuthController from './auth.controller';

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleSignIn);
router.post('/google-login', AuthController.googleLogin);
router.post('/request-otp', AuthController.requestOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/new-password', AuthController.newPassword);
router.post('/change-password', AuthController.changePassword);
router.post('/resend-verification-email', AuthController.resendVerificationEmail); 

export default router;