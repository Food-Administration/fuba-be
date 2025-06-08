"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speakeasy_1 = __importDefault(require("speakeasy"));
const user_model_1 = __importDefault(require("../user/user.model"));
const email_service_1 = __importDefault(require("../mail/email.service"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customError_1 = __importDefault(require("../../utils/customError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const firebase_1 = require("../../config/firebase");
const crypto_1 = __importDefault(require("crypto"));
class AuthService {
    /**
     * Registers a new user with the provided details.
     * @param first_name - The first name of the user.
     * @param last_name - The last name of the user.
     * @param email - The email address of the user.
     * @param password - The password for the user account.
     * @param role - The role for the user account.
     * @returns A promise that resolves to the created UserDocument.
     */
    static async signup(first_name, last_name, email, password, role) {
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            if (!existingUser.verified) {
                throw new customError_1.default('User exists but is not verified. Please verify your email before signing up.', 400);
            }
            throw new customError_1.default('User already exists', 400);
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Generate OTP for email verification
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret().base32,
            digits: 4,
        });
        // const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // If role is admin, do not sign up the user
        if (role.toLowerCase() === 'admin') {
            throw new customError_1.default('Admin users cannot sign up through this method.', 403);
        }
        // Create the user
        const user = new user_model_1.default({
            first_name,
            last_name,
            email,
            role,
            password: hashedPassword,
            // otp_expires: otp_expires,
            verified: false,
        });
        await user.save();
        // Send OTP via email
        await email_service_1.default.sendVerificationEmail(email, otp);
        return user;
    }
    /**
     * Logs in a user with the provided email and password.
     * @param email - The email address of the user.
     * @param password - The password for the user account.
     * @returns A promise that resolves to an object containing the JWT token, user ID, and full name.
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
    /**
     * Resends the verification email to the user identified by the provided email.
     * @param email - The email address of the user.
     */
    static async resendVerificationEmail(email) {
        // Find the user
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new customError_1.default('User not found', 404);
        }
        // Generate a new verification code
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret().base32,
            digits: 4,
        });
        // const otp = "12345";
        // Set the expiration time (10 minutes from now)
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Update the user's verification code and expiration time
        user.otp = otp;
        user.otp_expires = otpExpires;
        await user.save();
        // Send the verification code via email using EmailService
        await email_service_1.default.sendVerificationEmail(email, otp);
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map