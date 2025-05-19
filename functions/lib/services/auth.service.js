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
const speakeasy_1 = __importDefault(require("speakeasy"));
const user_model_1 = __importDefault(require("../models/user.model"));
const email_service_1 = __importDefault(require("./email.service"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customError_1 = __importDefault(require("../utils/customError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const firebase_1 = require("../config/firebase");
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../models/index");
const settingsPreferences_model_1 = __importDefault(require("../models/settingsPreferences.model"));
const admin = __importStar(require("firebase-admin"));
class AuthService {
    static async signup(companyName, email, password) {
        // assuming your user model returns a UserDocument type
        // Check if the user already exists
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            throw new customError_1.default('User already exists', 400);
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Generate a verification code
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret().base32,
            digits: 5,
        });
        // Set the expiration time (10 minutes from now)
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        // Find the admin role
        const adminRole = await index_1.Role.findOne({ name: 'admin' });
        if (!adminRole) {
            throw new customError_1.default('Admin role not found', 500);
        }
        // Create the user
        const user = new user_model_1.default({
            companyName,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            verified: false,
            roles: [adminRole._id],
        });
        await user.save();
        // Create default settings preferences for the user
        const settingsPreferences = new settingsPreferences_model_1.default({
            userId: user._id, // Link the settings preferences to the user
        });
        await settingsPreferences.save();
        // Send the verification code via email using EmailService
        await email_service_1.default.sendVerificationEmail(email, otp);
        // Return the created user
        return user;
    }
    static async verifyEmail(email, otp) {
        // Find the user
        const user = await user_model_1.default.findOne({ email }).populate('roles');
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        console.log('user otp, otp: ', user.otp, otp);
        // Check if the code is valid and not expired
        if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            throw new customError_1.default('Invalid or expired verification code', 400);
        }
        // Mark the user as verified
        user.verified = true;
        user.otp = undefined; // Clear the verification code
        user.otpExpires = undefined; // Clear the expiration time
        await user.save();
        // Send a welcome email using EmailService
        await email_service_1.default.sendWelcomeEmail(email, user.companyName, // Use companyName as the username
        'http://localhost:3000/login' // Example action URL
        );
        // Generate a JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, {
            expiresIn: '360h',
        });
        const settingsPreferences = await settingsPreferences_model_1.default.findOne({
            userId: user._id,
        }).exec();
        const roles = user.roles.map((role) => role.name);
        const userId = user._id.toString();
        const companyName = user.companyName;
        const vendorLegalName = user.vendorCompanyInfo?.vendorLegalName || null;
        const fullName = user.fullName;
        return { token, roles, userId, companyName, vendorLegalName, fullName, settingsPreferences: settingsPreferences || null };
    }
    static async login(email, password) {
        const user = await user_model_1.default.findOne({ email }).populate('roles');
        if (!user) {
            throw new customError_1.default('User Not Found!', 401);
        }
        // Check if user is deleted
        if (user.isDelete) {
            throw new customError_1.default('Your account has been deleted. Please contact support.', 403);
        }
        const isMatch = await bcrypt_1.default.compare(password.trim(), user.password);
        if (!isMatch) {
            throw new customError_1.default('Wrong Password', 401);
        }
        if (!user.verified) {
            throw new customError_1.default('Email not verified!', 401, false);
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, {
            expiresIn: '360h',
        });
        // Fetch the user's settings preferences
        const settingsPreferences = await settingsPreferences_model_1.default.findOne({
            userId: user._id,
        }).exec();
        // Prepare the response
        const roles = user.roles.map((role) => role.name);
        const userId = user._id.toString();
        const companyName = user.companyName;
        const vendorLegalName = user.vendorCompanyInfo?.vendorLegalName || null;
        const verified = user.verified;
        const fullName = user.fullName;
        return {
            token,
            roles,
            userId,
            fullName,
            companyName,
            vendorLegalName,
            verified,
            settingsPreferences: settingsPreferences || null, // Include settings preferences
        };
    }
    static async googleSignIn(idToken) {
        if (!idToken) {
            throw new Error('ID token is required');
        }
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const { email, name, picture, email_verified, uid } = decodedToken;
            // Check if the user already exists
            let user = await user_model_1.default.findOne({ email });
            if (user) {
                // Check if user is deleted
                if (user.isDelete) {
                    throw new customError_1.default('Your account has been deleted. Please contact support.', 403);
                }
            }
            else {
                const randomPassword = crypto_1.default.randomBytes(16).toString('hex');
                const hashedPassword = await bcrypt_1.default.hash(randomPassword, 10);
                const adminRole = await index_1.Role.findOne({ name: 'admin' });
                if (!adminRole) {
                    throw new customError_1.default('Admin role not found', 500);
                }
                user = new user_model_1.default({
                    email,
                    companyName: name,
                    googleId: uid,
                    profilePicture: picture,
                    verified: email_verified,
                    password: hashedPassword,
                    roles: [adminRole._id],
                });
                await user.save();
            }
            const populatedUser = await user.populate('roles');
            const roles = populatedUser.roles.map((role) => role.name);
            const token = jsonwebtoken_1.default.sign({ id: user._id, roles: roles }, process.env.TOKEN_SECRET_KEY, {
                expiresIn: '1h',
            });
            return { token, user, roles };
        }
        catch (error) {
            console.error("Error verifying ID token:", error);
            throw new Error("Invalid ID token");
        }
    }
    static async googleLogin(idToken) {
        if (!idToken) {
            throw new Error('ID token is required');
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
        const { email, name, picture, email_verified, uid } = decodedToken;
        const profilePicture = picture ?? 'https://default-profile-picture.url';
        const [firstName, lastName] = name ? name.split(' ') : ['', ''];
        let user = await user_model_1.default.findOne({ email });
        if (user) {
            // Check if user is deleted
            if (user.isDelete) {
                throw new customError_1.default('Your account has been deleted. Please contact support.', 403);
            }
            // Update existing user
            user.googleId = uid;
            user.profilePicture = profilePicture;
            user.firstName = firstName;
            user.lastName = lastName;
        }
        else {
            const randomPassword = crypto_1.default.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt_1.default.hash(randomPassword, 10);
            user = new user_model_1.default({
                email,
                firstName,
                lastName,
                companyName: name,
                googleId: uid,
                profilePicture: profilePicture,
                verified: email_verified,
                password: hashedPassword,
            });
        }
        await user.save();
        const populatedUser = await user.populate('roles');
        const roles = populatedUser.roles.map((role) => role.name);
        const token = jsonwebtoken_1.default.sign({ id: user._id, roles: roles }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' });
        return { token, user, roles };
    }
    static async requestPasswordReset(email) {
        // Find the user by email
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        // Generate a default password
        const defaultPassword = crypto_1.default.randomBytes(8).toString('hex'); // 8-character random password
        const hashedPassword = await bcrypt_1.default.hash(defaultPassword, 10);
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
        // Send the default password via email
        const resetLink = `http://localhost:3001/login`; // Example login link
        await email_service_1.default.sendPasswordResetEmail(email, `Your new default password is: ${defaultPassword}. Please use this password to log in and change it immediately.`, resetLink);
    }
    static async resetPassword(token, newPassword) {
        // Hash the token before searching in the database
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find the user by the hashed token and check if the token is valid and not expired
        const user = await user_model_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }, // Check if the token is not expired
        });
        if (!user) {
            throw new customError_1.default('Invalid or expired reset token', 400);
        }
        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
        // Update the user's password and clear the reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
    }
    static async changePassword(userId, currentPassword, newPassword) {
        // Find the user by ID
        console.log('user by id after1');
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        console.log('user by id after2');
        // Verify the current password
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        console.log('user by id after3');
        if (!isMatch) {
            console.log('user by id after4');
            throw new customError_1.default('Current password is incorrect', 400);
        }
        console.log('before salt rounds');
        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
    }
    static async resendVerificationEmail(email) {
        // Find the user
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        // Generate a new verification code
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret().base32,
            digits: 5,
        });
        // const otp = "12345";
        // Set the expiration time (10 minutes from now)
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Update the user's verification code and expiration time
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        // Send the verification code via email using EmailService
        await email_service_1.default.sendVerificationEmail(email, otp);
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map