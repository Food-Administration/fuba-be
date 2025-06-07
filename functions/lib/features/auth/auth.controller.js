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
AuthController.signup = (0, asyncHandler_1.default)(async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;
    const user = await auth_service_1.default.signup(first_name, last_name, email, password, role);
    res.status(201).json({
        message: 'Verification code sent to your email',
        success: true,
        userId: user._id.toString(),
        email: user.email,
    });
});
AuthController.login = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const { token, userId } = await auth_service_1.default.login(email, password);
    res.status(200).json({ token, userId });
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
    await auth_service_1.default.verifyOTP(email, otp);
    res.status(200).json({ message: 'OTP verified successfully' });
});
AuthController.newPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, new_password, confirm_password } = req.body;
    const result = await auth_service_1.default.newPassword(email, new_password, confirm_password);
    res.status(200).json(result);
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