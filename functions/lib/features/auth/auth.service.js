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
const user_model_1 = __importStar(require("../user/user.model"));
const email_service_1 = __importDefault(require("../mail/email.service"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customError_1 = __importDefault(require("../../utils/customError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const firebase_1 = require("../../config/firebase");
const crypto_1 = __importDefault(require("crypto"));
class AuthService {
    /**
     * Initiates email verification for new users
     */
    static async initiateEmailVerification(email) {
        // Check if user already exists and is verified
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser && existingUser.verified) {
            throw new customError_1.default('User already exists with this email', 400);
        }
        // Generate OTP
        const otp_secret = speakeasy_1.default.generateSecret().base32;
        const otp = speakeasy_1.default.totp({
            secret: otp_secret,
            digits: 4,
        });
        const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        if (existingUser) {
            // Update existing unverified user with new OTP
            existingUser.otp = otp;
            existingUser.otp_secret = otp_secret;
            existingUser.otp_expires = otp_expires;
            existingUser.verified = false;
            await existingUser.save();
        }
        else {
            // Create a temporary user record for verification
            const tempUser = new user_model_1.default({
                email,
                otp,
                otp_secret,
                otp_expires,
                verified: false,
                role: user_model_1.Role.Consumer, // Default role, can be changed during registration
                // Set temporary placeholder values
                first_name: 'Pending',
                last_name: 'Verification',
                phone_number: 'pending',
                password: await bcrypt_1.default.hash(crypto_1.default.randomBytes(16).toString('hex'), 10), // Temporary password
            });
            await tempUser.save();
        }
        // Send OTP via email
        await email_service_1.default.sendVerificationEmail(email, otp);
        return {
            message: 'Verification code sent to your email. Please verify to continue registration.'
        };
    }
    /**
     * Verifies email OTP
     */
    static async verifyEmail(email, otp) {
        // Find user by email
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('No verification session found. Please start verification again.', 400);
        }
        if (user.verified) {
            throw new customError_1.default('Email is already verified', 400);
        }
        if (!user.otp || !user.otp_expires) {
            throw new customError_1.default('No OTP found. Please request a new one.', 400);
        }
        if (user.otp_expires < new Date()) {
            throw new customError_1.default('OTP has expired. Please request a new one.', 400);
        }
        if (user.otp !== otp) {
            throw new customError_1.default('Invalid OTP', 400);
        }
        // Generate verification token (short-lived)
        const verification_token = jsonwebtoken_1.default.sign({
            email,
            verified: true,
            purpose: 'email_verification',
            userId: user._id.toString()
        }, process.env.TOKEN_SECRET_KEY, { expiresIn: '30m' } // 30 minutes to complete registration
        );
        return {
            verification_token,
            message: 'Email verified successfully. You can now complete your registration.'
        };
    }
    /**
     * Completes user registration after email verification
     */
    static async completeRegistration(verification_token, first_name, last_name, phone_number, password, role) {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(verification_token, process.env.TOKEN_SECRET_KEY);
        }
        catch (error) {
            throw new customError_1.default('Invalid or expired verification token', 400);
        }
        if (!decoded.verified || !decoded.email || decoded.purpose !== 'email_verification') {
            throw new customError_1.default('Invalid verification token', 400);
        }
        const { email, userId } = decoded;
        // Find and verify the user
        const user = await user_model_1.default.findOne({
            _id: userId,
            email,
            verified: false // Ensure user is not already verified
        });
        if (!user) {
            throw new customError_1.default('User not found or already verified. Please start verification again.', 400);
        }
        if (!role) {
            throw new customError_1.default('User role is required.', 400);
        }
        if (role === user_model_1.Role.Admin) {
            throw new customError_1.default('Admin users cannot sign up through this method.', 403);
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Update user with actual registration data
        user.first_name = first_name;
        user.last_name = last_name;
        user.phone_number = phone_number;
        user.password = hashedPassword;
        user.role = role;
        user.verified = true;
        user.otp = undefined;
        user.otp_secret = undefined;
        user.otp_expires = undefined;
        await user.save();
        // Generate auth token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, {
            expiresIn: '360h',
        });
        return { user, token };
    }
    /**
     * Resend verification email
     */
    static async resendVerificationEmail(email) {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('No user found with this email. Please start verification first.', 404);
        }
        if (user.verified) {
            throw new customError_1.default('Email is already verified', 400);
        }
        // Generate new OTP
        const otp_secret = user.otp_secret || speakeasy_1.default.generateSecret().base32;
        const otp = speakeasy_1.default.totp({
            secret: otp_secret,
            digits: 4,
        });
        const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Update user with new OTP
        user.otp = otp;
        user.otp_secret = otp_secret;
        user.otp_expires = otp_expires;
        await user.save();
        // Send OTP via email
        await email_service_1.default.sendVerificationEmail(email, otp);
        return {
            message: 'Verification code resent to your email.'
        };
    }
    /**
     * Clean up expired verification records (optional cron job)
     */
    static async cleanupExpiredVerifications() {
        const result = await user_model_1.default.deleteMany({
            verified: false,
            otp_expires: { $lt: new Date() },
            createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
        });
        return { deletedCount: result.deletedCount || 0 };
    }
    // ... rest of your existing methods (login, googleSignIn, etc.) remain the same
    /**
     * Logs in a user with the provided email and password.
     */
    static async login(email, password) {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('User Not Found!', 401);
        }
        if (!user.verified) {
            throw new customError_1.default('User is not verified. Please verify your email before logging in.', 401);
        }
        const isMatch = await bcrypt_1.default.compare(password.trim(), user.password);
        if (!isMatch) {
            throw new customError_1.default('Wrong Password', 401);
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, {
            expiresIn: '360h',
        });
        // Prepare the response
        const userId = user._id.toString();
        const full_name = user.full_name;
        // Remove password and otp from user object before returning
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        return {
            token,
            userId,
            full_name,
            user: userObj
        };
    }
    /**
     * Signs in a user using Google authentication.
     * @param idToken - The ID token received from Google.
     * @returns A promise that resolves to an object containing the JWT token and user document.
     */
    static async googleSignIn(idToken) {
        if (!idToken) {
            throw new Error('ID token is required');
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
        const { email, name, picture, email_verified, uid } = decodedToken;
        const profilePicture = picture ?? 'https://default-profile-picture.url';
        const [firstName, lastName] = name ? name.split(' ') : ['', ''];
        let user = await user_model_1.default.findOne({ email });
        if (user) {
            user.googleId = uid;
            user.profile_picture = profilePicture;
            user.first_name = firstName;
            user.last_name = lastName;
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
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' });
        return { token, user };
    }
    /**
     * Logs in a user using Google authentication.
     * @param idToken - The ID token received from Google.
     * @returns A promise that resolves to an object containing the JWT token and user document.
     */
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
            user.googleId = uid;
            user.profile_picture = profilePicture;
            user.first_name = firstName;
            user.last_name = lastName;
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
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' });
        return { token, user };
    }
    /**
     * Requests a One-Time Password (OTP) for the user identified by the provided email.
     * @param email - The email address of the user.
     */
    static async requestOTP(email) {
        // Find the user by email
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        // Generate a new OTP
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret().base32,
            digits: 4,
        });
        // Set OTP expiration (10 minutes from now)
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        // Update user with OTP and expiration
        user.otp = otp;
        user.otp_expires = otpExpires;
        await user.save();
        // Optionally, send the OTP via email
        await email_service_1.default.sendVerificationEmail(email, otp);
        return {
            otp,
            message: 'OTP sent successfully. Please check your email for the 4-digit OTP code.',
        };
    }
    /**
     * Verifies the OTP for the user identified by the provided email.
     * @param email - The email address of the user.
     * @param otp - The OTP to verify.
     */
    static async verifyOTP(email, otp) {
        // Find the user by email
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        if (!user.otp || user.otp !== otp) {
            throw new customError_1.default('Invalid OTP', 400);
        }
        if (user.otp_expires && user.otp_expires < new Date()) {
            throw new customError_1.default('OTP has expired', 400);
        }
        user.verified = true;
        // Do not clear OTP or otp_expires here
        await user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, {
            expiresIn: '360h',
        });
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        // await EmailService.sendVerificationSuccessEmail(email);
        console.log('OTP verified successfully');
        return { token, user: userObj };
    }
    /**
     * Changes the user's password.
     * @param email - The email address of the user.
     * @param new_password - The new password to set.
     * @param confirm_password - Confirmation of the new password.
     */
    static async newPassword(email, new_password, confirm_password, otp) {
        if (new_password !== confirm_password) {
            throw new customError_1.default('Passwords do not match', 400);
        }
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        if (!user.otp || user.otp !== otp) {
            throw new customError_1.default('Invalid OTP', 400);
        }
        if (user.otp_expires && user.otp_expires < new Date()) {
            throw new customError_1.default('OTP has expired', 400);
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(new_password, saltRounds);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otp_expires = undefined;
        await user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, {
            expiresIn: '360h',
        });
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        return { message: 'Your password has been changed successfully.', token, user: userObj };
    }
    /**
     * Changes the user's password after verifying the current password.
     * @param userId - The ID of the user.
     * @param currentPassword - The current password of the user.
     * @param newPassword - The new password to set.
     */
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            console.log('user by id after4');
            throw new customError_1.default('Current password is incorrect', 400);
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        await user.save();
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map