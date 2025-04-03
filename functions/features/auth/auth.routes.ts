import  express from 'express';
import AuthController from './auth.controller';
// import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/verify-email/:email/:otp', AuthController.verifyEmail);
// router.post('/verify-email', AuthController.verifyEmail);
router.post('/login', AuthController.login);
router.post('/request-password-reset', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);
// router.post('/change-password', AuthController.changePassword);
router.post('/resend-verification-email', AuthController.resendVerificationEmail);

export default router;