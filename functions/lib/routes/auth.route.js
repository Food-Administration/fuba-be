"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
// import jwtAuth from '../middleware/jwtAuth';
const router = express.Router();
// Signup route
router.post('/signup', auth_controller_1.default.signup);
// Verify email route
// router.post('/verify-email', AuthController.verifyEmail);
router.post('/verify-email/:email/:otp', auth_controller_1.default.verifyEmail);
// Login route
// router.post('/login', passport.authenticate('local', { session: false }), AuthController.login);
router.post('/login', auth_controller_1.default.login);
// Google OAuth routes 
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google', passport.authenticate('google', { scope: ["https://googleapis.com/auth/plus.login"] }));
// passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' });
// Google Sign-In route
router.post('/google', auth_controller_1.default.googleSignIn);
router.post('/google-login', auth_controller_1.default.googleLogin);
router.post('/request-password-reset', auth_controller_1.default.requestPasswordReset);
router.post('/reset-password', auth_controller_1.default.resetPassword);
router.post('/change-password', auth_controller_1.default.changePassword);
router.post('/resend-verification-email', auth_controller_1.default.resendVerificationEmail);
// router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: "/" }), AuthController.googleCallback);
// 2FA routes
// router.post('/2fa/setup', passport.authenticate('jwt', { session: false }), AuthController.setup2FA);
// router.post('/2fa/verify', passport.authenticate('jwt', { session: false }), AuthController.verify2FA);
exports.default = router;
//# sourceMappingURL=auth.route.js.map