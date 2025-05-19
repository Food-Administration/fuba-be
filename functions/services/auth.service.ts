import speakeasy from 'speakeasy';
import User, { UserDocument } from '../models/user.model';
import EmailService from './email.service';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/customError';
import bcrypt from 'bcrypt';
import { auth } from '../config/firebase';
import crypto from 'crypto';
import { Role } from '../models/index';
import { Schema } from 'mongoose';
import settingsPreferencesModel from '../models/settingsPreferences.model';
import * as admin from 'firebase-admin';


class AuthService {
  static async signup(
    companyName: string,
    email: string,
    password: string
  ): Promise<UserDocument> {
    // assuming your user model returns a UserDocument type
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError('User already exists', 400);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate a verification code
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
      digits: 5,
    });

    // Set the expiration time (10 minutes from now)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Find the admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      throw new CustomError('Admin role not found', 500);
    }

    // Create the user
    const user = new User({
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
    const settingsPreferences = new settingsPreferencesModel({
      userId: user._id, // Link the settings preferences to the user
    });
    await settingsPreferences.save();

    // Send the verification code via email using EmailService
    await EmailService.sendVerificationEmail(email, otp);

    // Return the created user
    return user;
  }

  static async verifyEmail(
    email: string,
    otp: string
  ): Promise<{ token: string; roles: string[]; userId: string; companyName: string | null; fullName: string | null; vendorLegalName: string | null; settingsPreferences: any; }> {
    // Find the user
    const user = await User.findOne({ email }).populate('roles');
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    console.log('user otp, otp: ', user.otp, otp);

    // Check if the code is valid and not expired
    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      throw new CustomError('Invalid or expired verification code', 400);
    }

    // Mark the user as verified
    user.verified = true;
    user.otp = undefined; // Clear the verification code
    user.otpExpires = undefined; // Clear the expiration time
    await user.save();

    // Send a welcome email using EmailService
    await EmailService.sendWelcomeEmail(
      email,
      user.companyName, // Use companyName as the username
      'http://localhost:3000/login' // Example action URL
    );

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY!, {
      expiresIn: '360h',
    });

    const settingsPreferences = await settingsPreferencesModel.findOne({
      userId: user._id,
    }).exec();

    const roles = user.roles.map((role: any) => role.name);
    const userId = user._id.toString();
    const companyName = user.companyName;
    const vendorLegalName = user.vendorCompanyInfo?.vendorLegalName || null;
    const fullName = user.fullName;

    return { token, roles, userId, companyName, vendorLegalName, fullName, settingsPreferences: settingsPreferences || null };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    roles: string[];
    userId: string;
    fullName: string | null;
    companyName: string | null;
    vendorLegalName: string | null;
    verified: boolean;
    settingsPreferences: any; // Include settings preferences in the response
  }> {
    const user = await User.findOne({ email }).populate('roles');
    if (!user) {
      throw new CustomError('User Not Found!', 401);
    }

    // Check if user is deleted
  if (user.isDelete) {
    throw new CustomError('Your account has been deleted. Please contact support.', 403);
  }
  
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      throw new CustomError('Wrong Password', 401);
    }
  
    if (!user.verified) {
      throw new CustomError('Email not verified!', 401, false);
    }
  
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY!, {
      expiresIn: '360h',
    });
  
    // Fetch the user's settings preferences
    const settingsPreferences = await settingsPreferencesModel.findOne({
      userId: user._id,
    }).exec();
  
    // Prepare the response
    const roles = user.roles.map((role: any) => role.name);
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

  static async googleSignIn(
    idToken: string
  ): Promise<{ token: string; user: UserDocument; roles: Schema.Types.ObjectId[] }> {
    if (!idToken) {
      throw new Error('ID token is required');
    }
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { email, name, picture, email_verified, uid } = decodedToken; 
  
      // Check if the user already exists
      let user = await User.findOne({ email });
  
      if (user) {
        // Check if user is deleted
        if (user.isDelete) {
          throw new CustomError('Your account has been deleted. Please contact support.', 403);
        }
      } else {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
        const adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
          throw new CustomError('Admin role not found', 500);
        }
  
        user = new User({
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
      const roles = populatedUser.roles.map((role: any) => role.name);
  
      const token = jwt.sign({ id: user._id, roles: roles }, process.env.TOKEN_SECRET_KEY!, {
        expiresIn: '1h',
      });
  
      return { token, user, roles };
    } catch (error) {
      console.error("Error verifying ID token:", error);
      throw new Error("Invalid ID token");
    }
  }
  
  static async googleLogin(
    idToken: string
  ): Promise<{
    token: string;
    user: UserDocument;
    roles: Schema.Types.ObjectId[];
  }> {
    if (!idToken) {
      throw new Error('ID token is required');
    }
  
    const decodedToken = await auth.verifyIdToken(idToken);
    const { email, name, picture, email_verified, uid } = decodedToken;
    const profilePicture = picture ?? 'https://default-profile-picture.url';
    const [firstName, lastName] = name ? name.split(' ') : ['', ''];
  
    let user = await User.findOne({ email });
  
    if (user) {
      // Check if user is deleted
      if (user.isDelete) {
        throw new CustomError('Your account has been deleted. Please contact support.', 403);
      }
      
      // Update existing user
      user.googleId = uid;
      user.profilePicture = profilePicture;
      user.firstName = firstName;
      user.lastName = lastName;
    } else {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
      user = new User({
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
    const roles = populatedUser.roles.map((role: any) => role.name);
  
    const token = jwt.sign(
      { id: user._id, roles: roles },
      process.env.TOKEN_SECRET_KEY!,
      { expiresIn: '1h' }
    );
  
    return { token, user, roles };
  }

  static async requestPasswordReset(email: string): Promise<void> {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }
  
    // Generate a default password
    const defaultPassword = crypto.randomBytes(8).toString('hex'); // 8-character random password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
  
    // Send the default password via email
    const resetLink = `http://localhost:3001/login`; // Example login link
    await EmailService.sendPasswordResetEmail(
      email,
      `Your new default password is: ${defaultPassword}. Please use this password to log in and change it immediately.`,
      resetLink
    );
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    // Hash the token before searching in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user by the hashed token and check if the token is valid and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // Check if the token is not expired
    });

    if (!user) {
      throw new CustomError('Invalid or expired reset token', 400);
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find the user by ID
    console.log('user by id after1');
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    console.log('user by id after2');

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log('user by id after3');
    if (!isMatch) {
      console.log('user by id after4');
      throw new CustomError('Current password is incorrect', 400);
    }

    console.log('before salt rounds');

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds); 

    // Update the user's password
    user.password = hashedPassword;
    await user.save();
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Generate a new verification code
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
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
    await EmailService.sendVerificationEmail(email, otp);
  }
}

export default AuthService;
