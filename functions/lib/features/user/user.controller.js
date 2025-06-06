"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("./user.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class UserController {
}
_a = UserController;
UserController.getUserById = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    console.log('userId: ', userId);
    const user = await user_service_1.default.getUserById(userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.status(200).json(user);
});
// Get a user's profile
UserController.getProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const profile = await user_service_1.default.getProfile(userId);
    res.status(200).json(profile);
});
// Update a user's profile
UserController.updateProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;
    const updatedProfile = await user_service_1.default.updateProfile(userId, updateData);
    res.status(200).json(updatedProfile);
});
// Update a user's password
UserController.updatePassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
    const result = await user_service_1.default.updatePassword(userId, oldPassword, newPassword);
    res
        .status(200)
        .json({ result, message: 'Password Changed Successfully' });
});
// Update a user's profile picture
UserController.updateProfilePicture = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { imageUrl } = req.body;
    const updatedProfile = await user_service_1.default.updateProfilePicture(userId, imageUrl);
    res.status(200).json(updatedProfile);
});
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map