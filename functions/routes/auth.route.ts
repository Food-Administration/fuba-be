import * as express from 'express';
import AuthController from '../controllers/auth.controller';
// import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

// Signup route
router.post('/signup', AuthController.signup);

// Verify email route
// router.post('/verify-email', AuthController.verifyEmail);
router.post('/verify-email/:email/:otp', AuthController.verifyEmail);

// Login route
// router.post('/login', passport.authenticate('local', { session: false }), AuthController.login);
router.post('/login', AuthController.login);

// Google OAuth routes 
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google', passport.authenticate('google', { scope: ["https://googleapis.com/auth/plus.login"] }));
// passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' });
// Google Sign-In route
router.post('/google', AuthController.googleSignIn);
router.post('/google-login', AuthController.googleLogin);
router.post('/request-password-reset', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);
router.post('/change-password', AuthController.changePassword);
router.post('/resend-verification-email', AuthController.resendVerificationEmail); 

// router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: "/" }), AuthController.googleCallback);
 
// 2FA routes
// router.post('/2fa/setup', passport.authenticate('jwt', { session: false }), AuthController.setup2FA);
// router.post('/2fa/verify', passport.authenticate('jwt', { session: false }), AuthController.verify2FA);

export default router;