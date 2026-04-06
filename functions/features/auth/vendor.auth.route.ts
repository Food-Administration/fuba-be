import * as express from 'express';
import AuthController from './auth.controller';
import VendorAuthController from './vendor.auth.controller';
import jwtAuth from '../../middleware/jwtAuth';
import { upload } from '../../middleware/upload';

const router = express.Router();

// ─── Vendor Registration ────────────────────────────────────
router.post('/check-area', VendorAuthController.checkArea);
router.post('/waitlist', VendorAuthController.joinWaitlist);
router.post('/initiate-verification', VendorAuthController.initiateVerification);
router.post('/verify', VendorAuthController.verifyOtp);
router.post(
    '/register',
    upload.fields([
        { name: 'brand_logo', maxCount: 1 },
        { name: 'brand_cover', maxCount: 1 },
        { name: 'cac_certificate', maxCount: 1 }
    ]),
    VendorAuthController.register
);

// ─── Vendor NAFDAC ──────────────────────────────────────────
router.post('/nafdac-request', jwtAuth, VendorAuthController.requestNafdacSeal);
router.post('/nafdac-verify-payment', jwtAuth, VendorAuthController.verifyNafdacPayment);
router.post(
    '/nafdac-upload',
    jwtAuth,
    upload.single('nafdac_seal'),
    VendorAuthController.uploadNafdacSeal
);

// ─── Vendor Login ───────────────────────────────────────────
router.post('/login', AuthController.login);

// ─── Vendor Password Reset ──────────────────────────────────
router.post('/request-otp', AuthController.requestOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/reset-password', AuthController.newPassword);
router.post('/change-password', AuthController.changePassword);

export default router;
