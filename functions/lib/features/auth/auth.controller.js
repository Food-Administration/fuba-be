"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("./auth.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class AuthController {
}
_a = AuthController;
AuthController.initiateEmailVerification = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    const { message } = await auth_service_1.default.initiateEmailVerification(email);
    res.status(200).json({
        message,
        success: true
    });
});
AuthController.verifyEmail = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const { verification_token, message } = await auth_service_1.default.verifyEmail(email, otp);
    res.status(200).json({
        message,
        success: true,
        verification_token
    });
});
AuthController.completeRegistration = (0, asyncHandler_1.default)(async (req, res) => {
    const { verification_token, first_name, last_name, phone_number, password, role } = req.body;
    const { user, token } = await auth_service_1.default.completeRegistration(verification_token, first_name, last_name, phone_number, password, role);
    res.status(201).json({
        message: 'Registration completed successfully',
        success: true,
        token,
        user: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            verified: user.verified
        }
    });
});
AuthController.login = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const { token, userId, user } = await auth_service_1.default.login(email, password);
    res.status(200).json({ token, userId, user });
});
AuthController.googleSignIn = (0, asyncHandler_1.default)(async (req, res) => {
    const { idToken } = req.body;
    const { token, user } = await auth_service_1.default.googleSignIn(idToken);
    res.status(200).json({ token, user });
});
AuthController.googleLogin = (0, asyncHandler_1.default)(async (req, res) => {
    const { idToken } = req.body;
    const { token, user } = await auth_service_1.default.googleLogin(idToken);
    res.status(200).json({ token, user });
});
AuthController.requestOTP = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    const { otp, message } = await auth_service_1.default.requestOTP(email);
    res.status(200).json({ otp, message });
});
AuthController.verifyOTP = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const { token, user } = await auth_service_1.default.verifyOTP(email, otp);
    res.status(200).json({ message: 'OTP verified successfully', success: true, token, user });
});
AuthController.newPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, new_password, confirm_password, otp } = req.body;
    const { token, user } = await auth_service_1.default.newPassword(email, new_password, confirm_password, otp);
    res.status(200).json({ message: 'New Password Changed Successfully', success: true, token, user });
});
AuthController.changePassword = (0, asyncHandler_1.default)(async (req, res) => {
    const user = req.user;
    const userId = user._id.toString();
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