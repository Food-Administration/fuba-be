import * as express from 'express';
import AuthController from './auth.controller';
import RestaurantAuthController from './restaurant.auth.controller';
import { upload } from '../../middleware/upload';

const router = express.Router();

// ─── Restaurant Registration ────────────────────────────────
router.post('/initiate-verification', RestaurantAuthController.initiateVerification);
router.post('/verify', RestaurantAuthController.verifyOtp);
router.post('/resend-otp', RestaurantAuthController.resendOtp);
router.post(
    '/register',
    upload.fields([
        { name: 'brand_logo', maxCount: 1 },
        { name: 'cover_image', maxCount: 1 },
        { name: 'cac_certificate', maxCount: 1 }
    ]),
    RestaurantAuthController.register
);

// ─── Restaurant Login ───────────────────────────────────────
router.post('/login', AuthController.login);

// ─── Restaurant Password Reset ──────────────────────────────
router.post('/request-otp', AuthController.requestOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/reset-password', AuthController.newPassword);
router.post('/change-password', AuthController.changePassword);

export default router;
