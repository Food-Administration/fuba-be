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
const user_model_1 = __importDefault(require("./user.model"));
const bcrypt = __importStar(require("bcrypt"));
const customError_1 = __importDefault(require("../../utils/customError"));
class UserService {
    async getUserById(id) {
        return await user_model_1.default.findById(id);
    }
    static async getUserById(userId) {
        const user = await user_model_1.default.findById(userId).select('fileDocuments'); // Ensure fileDocuments are included
        return user;
    }
    async findUserByEmail(email) {
        return await user_model_1.default.findOne({ email });
    }
    async updateUser(id, updateData) {
        return await user_model_1.default.findByIdAndUpdate(id, updateData, { new: true });
    }
    async deleteUser(id) {
        return await user_model_1.default.findByIdAndDelete(id);
    }
    async getProfile(userId) {
        const user = await user_model_1.default.findById(userId).populate('roles');
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        return { ...user.toObject(), _id: user._id.toString() };
    }
    async updateProfile(userId, updateData) {
        const user = await user_model_1.default.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        return { ...user.toObject(), _id: user._id.toString() };
    }
    async updatePassword(userId, oldPassword, newPassword) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new customError_1.default('Invalid old password', 400);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return { message: 'Password updated successfully' };
    }
    /**
     * Upload or update a user's profile picture.
     * @param userId - The ID of the user.
     * @param imageUrl - The URL of the profile picture.
     * @returns The updated user profile.
     */
    async updateProfilePicture(userId, imageUrl) {
        const user = await user_model_1.default.findByIdAndUpdate(userId, { profilePicture: imageUrl }, { new: true });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        return { ...user.toObject(), _id: user._id.toString() };
    }
}
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map