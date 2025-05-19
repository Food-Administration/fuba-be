"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const settingsPreferences_model_1 = __importDefault(require("../models/settingsPreferences.model"));
class AuthController {
}
_a = AuthController;
AuthController.signup = (0, asyncHandler_1.default)(async (req, res) => {
    const { companyName, email, password } = req.body;
    // Receive the created user from the service
    let user = await auth_service_1.default.signup(companyName, email, password);
    await user.populate('roles', 'name');
    // Fetch the associated settings preferences
    const settingsPreferences = await settingsPreferences_model_1.default.findOne({
        userId: user._id,
    }).exec();
    res.status(201).json({
        message: 'Verification code sent to your email',
        success: true,
        userId: user._id,
        email: user.email,
        verified: user.verified,
        roles: user.roles.map((role) => ('name' in role ? role.name : role)),
        companyName: user.companyName,
        settingsPreferences: settingsPreferences || null,
    });
});
AuthController.verifyEmail = (0, asyncHandler_1.default)(async (req, res) => {
    console.log('Request params:', req.params);
    const { email, otp } = req.params;
    const { token, roles, userId, companyName, vendorLegalName, fullName, settingsPreferences } = await auth_service_1.default.verifyEmail(email, otp);
    res.json({ token, roles, userId, companyName, vendorLegalName, fullName, settingsPreferences, message: 'Email verified successfully', success: true, emailVerified: true });
});
AuthController.login = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    // Call the AuthService.login method
    const { token, roles, userId, companyName, vendorLegalName, verified, fullName, settingsPreferences } = await auth_service_1.default.login(email, password);
    // Send the response with settings preferences
    res.status(200).json({
        token,
        roles,
        userId,
        companyName,
        vendorLegalName,
        fullName,
        verified,
        settingsPreferences, // Include settings preferences in the response
    });
});
AuthController.googleSignIn = (0, asyncHandler_1.default)(async (req, res) => {
    const { idToken } = req.body;
    const { token, user, roles } = await auth_service_1.default.googleSignIn(idToken);
    res.json({ token, user, roles });
});
AuthController.googleLogin = (0, asyncHandler_1.default)(async (req, res) => {
    const { idToken } = req.body;
    const { token, user, roles } = await auth_service_1.default.googleLogin(idToken);
    res.json({ token, user, roles });
});
AuthController.requestPasswordReset = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    await auth_service_1.default.requestPasswordReset(email);
    res.json({ message: 'Password reset email sent' });
});
AuthController.resetPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { token, newPassword } = req.body;
    await auth_service_1.default.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successfully' });
});
AuthController.changePassword = (0, asyncHandler_1.default)(async (req, res) => {
    const user = req.user;
    console.log('user data: ', user);
    const userId = user._id.toString(); // Ensure user ID is retrieved from the authenticated user
    console.log('userId data: ', userId);
    const { currentPassword, newPassword } = req.body;
    await auth_service_1.default.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: 'Password changed successfully' });
});
AuthController.resendVerificationEmail = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    await auth_service_1.default.resendVerificationEmail(email);
    res.status(200).json({ message: 'Verification email resent', success: true });
});
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map