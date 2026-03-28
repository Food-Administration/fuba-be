import * as express from 'express';
import AuthController from './auth.controller';
import VendorAuthController from './vendor.auth.controller';
import RestaurantAuthController from './restaurant.auth.controller';
import jwtAuth from '../../middleware/jwtAuth';
import { upload } from '../../middleware/upload';

const router = express.Router();

// ─── Customer Auth (existing) ──────────────────────────────
router.post('/initiate-verification', AuthController.initiateEmailVerification);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/register', AuthController.completeRegistration);

// ─── Shared Auth ───────────────────────────────────────────
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleSignIn);
router.post('/google-login', AuthController.googleLogin);
router.post('/request-otp', AuthController.requestOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/reset-password', AuthController.newPassword);
router.post('/change-password', AuthController.changePassword);
router.post('/resend-verification-email', AuthController.resendVerificationEmail);

// ─── Food Vendor Auth ──────────────────────────────────────
router.post('/vendor/check-area', VendorAuthController.checkArea);
router.post('/vendor/waitlist', VendorAuthController.joinWaitlist);
router.post('/vendor/initiate-verification', VendorAuthController.initiateVerification);
router.post('/vendor/verify', VendorAuthController.verifyOtp);
router.post(
    '/vendor/register',
    upload.fields([
        { name: 'brand_logo', maxCount: 1 },
        { name: 'brand_cover', maxCount: 1 },
        { name: 'cac_certificate', maxCount: 1 }
    ]),
    VendorAuthController.register
);
router.post('/vendor/nafdac-request', jwtAuth, VendorAuthController.requestNafdacSeal);
router.post('/vendor/nafdac-verify-payment', jwtAuth, VendorAuthController.verifyNafdacPayment);
router.post(
    '/vendor/nafdac-upload',
    jwtAuth,
    upload.single('nafdac_seal'),
    VendorAuthController.uploadNafdacSeal
);

// ─── Luxury Restaurant Auth ────────────────────────────────
router.post('/restaurant/initiate-verification', RestaurantAuthController.initiateVerification);
router.post('/restaurant/verify', RestaurantAuthController.verifyOtp);
router.post('/restaurant/resend-otp', RestaurantAuthController.resendOtp);
router.post(
    '/restaurant/register',
    upload.fields([
        { name: 'brand_logo', maxCount: 1 },
        { name: 'cover_image', maxCount: 1 },
        { name: 'cac_certificate', maxCount: 1 }
    ]),
    RestaurantAuthController.register
);

export default router;