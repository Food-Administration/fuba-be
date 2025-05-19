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
const user_model_1 = __importDefault(require("../models/user.model"));
const bcrypt = __importStar(require("bcrypt"));
const index_1 = require("../models/index");
const crypto = __importStar(require("crypto"));
const customError_1 = __importDefault(require("../utils/customError"));
const email_service_1 = __importDefault(require("./email.service"));
// import * as fs from 'fs';
// import path from 'path';
class UserService {
    async createUser(userData) {
        const { ...rest } = userData;
        const existingUser = await user_model_1.default.findOne({ email: userData.email });
        if (existingUser) {
            throw new customError_1.default('User with this email already exists', 409);
        }
        const password = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("designation role: ", userData.employmentDetails?.designation);
        let roleName = 'user';
        const designation = userData.employmentDetails?.designation?.toLowerCase();
        if (designation === 'supervisor') {
            roleName = 'supervisor';
        }
        else if (designation === 'manager') {
            roleName = 'manager';
        }
        else if (designation === 'employee') {
            roleName = 'user';
        }
        const role = await index_1.Role.findOne({ name: roleName });
        if (!role) {
            throw new customError_1.default(`${roleName} role not found`, 404);
        }
        const user = new user_model_1.default({
            ...rest,
            password: hashedPassword,
            roles: [role._id],
        });
        await user.save();
        await email_service_1.default.sendUserPasswordEmail(user.email, user.firstName, user.email, password);
        return { ...user.toObject(), _id: user._id.toString() };
    }
    async getUsers() {
        const allowedRoles = await index_1.Role.find({
            name: { $in: ['user', 'supervisor', 'admin', "manager"] }
        });
        if (!allowedRoles.length) {
            throw new customError_1.default('No valid roles found', 404);
        }
        const allowedRoleIds = allowedRoles.map(r => r._id);
        const users = await user_model_1.default.find({
            roles: { $in: allowedRoleIds },
            // $nor: [{ roles: { $in: restrictedRoleIds } }]  // Must NOT have admin or vendor
        }).populate('roles');
        return users.map(user => ({ ...user.toObject(), _id: user._id.toString() }));
    }
    async getUserById(id) {
        return await user_model_1.default.findById(id).populate('roles');
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
    async blockUser(id, isBlocked) {
        const user = await user_model_1.default.findByIdAndUpdate(id, {
            isBlocked,
            status: isBlocked ? 'blocked' : 'active'
        }, { new: true }).populate('roles');
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        return user;
    }
    async assignRole(userId, roleName) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        const role = await index_1.Role.findOne({ name: roleName });
        if (!role) {
            throw new customError_1.default('User role not found', 404);
        }
        user.roles.push(role._id);
        await user.save();
        return { ...user.toObject(), _id: user._id.toString() };
    }
    async importUsers(users) {
        const results = {
            successCount: 0,
            duplicateEmails: [],
            errors: [],
        };
        for (const user of users) {
            try {
                const existingUser = await user_model_1.default.findOne({ email: user.email });
                if (existingUser) {
                    results.duplicateEmails.push(user.email);
                    continue;
                }
                if (!user.password) {
                    console.warn(`Password missing for user: ${user.email}. Generating a random password.`);
                    user.password = crypto.randomBytes(8).toString('hex');
                }
                const hashedPassword = await bcrypt.hash(user.password, 10);
                const newUser = new user_model_1.default({
                    ...user,
                    password: hashedPassword,
                    roles: Array.isArray(user.roles) ? user.roles : [],
                });
                await newUser.save();
                results.successCount++;
            }
            catch (error) {
                results.errors.push({
                    email: user.email,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return results;
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
        }).populate('roles');
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
        const user = await user_model_1.default.findByIdAndUpdate(userId, { profilePicture: imageUrl }, { new: true }).populate('roles');
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        return { ...user.toObject(), _id: user._id.toString() };
    }
    /**
     * Delete a user's profile.
     * @param userId - The ID of the user.
     * @returns A success message.
     */
    async deleteProfile(userId) {
        const user = await user_model_1.default.findByIdAndUpdate(userId, { isDelete: true, status: "suspended" }, { new: true });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        return { message: 'Profile marked as deleted successfully' };
    }
    async restoreProfile(userId) {
        const user = await user_model_1.default.findByIdAndUpdate(userId, { isDelete: false, status: "active" }, { new: true });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        return { message: 'Profile restored successfully' };
    }
    // /**
    //  * Remove a document from a user's fileDocuments array
    //  * @param userId - The ID of the user
    //  * @param filePath - The path of the file to remove
    //  * @returns The updated user document
    //  */
    // async removeDocument(userId: string, filePath: string): Promise<UserDocument> {
    //   const user = await User.findByIdAndUpdate(
    //     userId,
    //     { $pull: { fileDocuments: filePath } },
    //     { new: true }
    //   ).populate('roles');
    //   if (!user) {
    //     throw new CustomError('User not found', 404);
    //   }
    //   const fullPath = path.join(__dirname, '../../', filePath);
    //   try {
    //     if (fs.existsSync(fullPath)) {
    //       fs.unlinkSync(fullPath);
    //       console.log(`Deleted file: ${fullPath}`);
    //     } else {
    //       console.warn(`File not found: ${fullPath}`);
    //     }
    //   } catch (err) {
    //     console.error('Failed to delete file:', err);
    //     throw new CustomError('File deletion failed', 500);
    //   }
    //   return user;
    // }
    /**
     * Get all documents for a user
     * @param userId - The ID of the user
     * @returns The user's fileDocuments array
     */
    async getDocuments(userId) {
        const user = await user_model_1.default.findById(userId).select('fileDocuments');
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        return user.fileDocuments;
    }
    // async updateNotificationPreferences(
    //   userId: string,
    //   email: boolean,
    //   push: boolean,
    //   filters: any
    // ): Promise<UserDocument> {
    //   const user = await User.findByIdAndUpdate(
    //     userId,
    //     { notificationPreferences: { email, push, filters } },
    //     { new: true }
    //   ).select('-password');
    //   if (!user) {
    //     throw new CustomError('User not found', 404);
    //   }
    //   return user;
    // }
    /**
     * Update user's activity status.
     * @param userId - The ID of the user.
     * @param activityStatus - The new activity status.
     * @returns The updated user document.
     */
    // async updateActivityStatus(
    //   userId: string,
    //   activityStatus: string
    // ): Promise<UserDocument> {
    //   const user = await User.findByIdAndUpdate(
    //     userId,
    //     { activityStatus },
    //     { new: true }
    //   ).select('-password');
    //   if (!user) {
    //     throw new CustomError('User not found', 404);
    //   }
    //   return user;
    // }
    // async updateSettings(
    //   userId: string,
    //   currency: string,
    //   calendarIntegration: boolean,
    //   theme: string
    // ): Promise<UserDocument> {
    //   const user = await User.findByIdAndUpdate(
    //     userId,
    //     { settings: { currency, calendarIntegration, theme } },
    //     { new: true }
    //   ).select('-password');
    //   if (!user) {
    //     throw new CustomError('User not found', 404);
    //   }
    //   return user;
    // }
    async uploadDocument(userId, filePath) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        // Add the file path to the user's fileDocuments array
        user.fileDocuments.push(filePath);
        await user.save();
        return { ...user.toObject(), _id: user._id.toString() };
    }
    async deleteDocument(userId, filePath) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        user.fileDocuments = user.fileDocuments.filter((doc) => doc !== filePath);
        await user.save();
        return user;
    }
}
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map