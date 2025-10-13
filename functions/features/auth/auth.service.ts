import speakeasy from 'speakeasy';
import User, { Role, UserDocument } from '../user/user.model';
import EmailService from '../mail/email.service';
import jwt from 'jsonwebtoken';
import CustomError from '../../utils/customError';
import bcrypt from 'bcrypt';
import { auth } from '../../config/firebase';
import crypto from 'crypto';

class AuthService {
  /**
   * Initiates email verification for new users
   */
  static async initiateEmailVerification(email: string): Promise<{ message: string }> {
    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified) {
      throw new CustomError('User already exists with this email', 400);
    }

    // Generate OTP
    const otp_secret = speakeasy.generateSecret().base32;
    const otp = speakeasy.totp({
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
    } else {
      // Create a temporary user record for verification
      const tempUser = new User({
        email,
        otp,
        otp_secret,
        otp_expires,
        verified: false,
        role: Role.Consumer, // Default role, can be changed during registration
        // Set temporary placeholder values
        first_name: 'Pending',
        last_name: 'Verification',
        phone_number: 'pending',
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Temporary password
      });
      await tempUser.save();
    }

    // Send OTP via email
    await EmailService.sendVerificationEmail(email, otp);

    return {
      message: 'Verification code sent to your email. Please verify to continue registration.'
    };
  }

  /**
   * Verifies email OTP
   */
  static async verifyEmail(
    email: string, 
    otp: string
  ): Promise<{ verification_token: string; message: string }> {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new CustomError('No verification session found. Please start verification again.', 400);
    }

    if (user.verified) {
      throw new CustomError('Email is already verified', 400);
    }

    if (!user.otp || !user.otp_expires) {
      throw new CustomError('No OTP found. Please request a new one.', 400);
    }

    if (user.otp_expires < new Date()) {
      throw new CustomError('OTP has expired. Please request a new one.', 400);
    }

    if (user.otp !== otp) {
      throw new CustomError('Invalid OTP', 400);
    }

    // Generate verification token (short-lived)
    const verification_token = jwt.sign(
      { 
        email, 
        verified: true,
        purpose: 'email_verification',
        userId: user._id.toString()
      }, 
      process.env.TOKEN_SECRET_KEY!, 
      { expiresIn: '30m' } // 30 minutes to complete registration
    );

    return {
      verification_token,
      message: 'Email verified successfully. You can now complete your registration.'
    };
  }

  /**
   * Completes user registration after email verification
   */
  static async completeRegistration(
    verification_token: string,
    first_name: string,
    last_name: string,
    phone_number: string,
    password: string,
    role: Role
  ): Promise<{ user: UserDocument; token: string }> {
    let decoded: any;
    
    try {
      decoded = jwt.verify(verification_token, process.env.TOKEN_SECRET_KEY!);
    } catch (error) {
      throw new CustomError('Invalid or expired verification token', 400);
    }

    if (!decoded.verified || !decoded.email || decoded.purpose !== 'email_verification') {
      throw new CustomError('Invalid verification token', 400);
    }

    const { email, userId } = decoded;

    // Find and verify the user
    const user = await User.findOne({ 
      _id: userId,
      email,
      verified: false // Ensure user is not already verified
    });

    if (!user) {
      throw new CustomError('User not found or already verified. Please start verification again.', 400);
    }

    if (!role) {
      throw new CustomError('User role is required.', 400);
    }

    if (role === Role.Admin) {
      throw new CustomError('Admin users cannot sign up through this method.', 403);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY!, {
      expiresIn: '360h',
    });

    return { user, token };
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new CustomError('No user found with this email. Please start verification first.', 404);
    }

    if (user.verified) {
      throw new CustomError('Email is already verified', 400);
    }

    // Generate new OTP
    const otp_secret = user.otp_secret || speakeasy.generateSecret().base32;
    const otp = speakeasy.totp({
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
    await EmailService.sendVerificationEmail(email, otp);

    return {
      message: 'Verification code resent to your email.'
    };
  }

  /**
   * Clean up expired verification records (optional cron job)
   */
  static async cleanupExpiredVerifications(): Promise<{ deletedCount: number }> {
    const result = await User.deleteMany({
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
  static async login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    userId: string;
    full_name: string | null;
    user: Omit<UserDocument, 'password' | 'otp'>;
  }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User Not Found!', 401);
    }

    if (!user.verified) {
      throw new CustomError('User is not verified. Please verify your email before logging in.', 401);
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      throw new CustomError('Wrong Password', 401);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY!, {
      expiresIn: '360h',
    });

    // Prepare the response
    const userId = user._id.toString();
    const full_name = user.full_name;

    // Remove password and otp from user object before returning
    const userObj = user.toObject() as any; 
    delete userObj.password;
    delete userObj.otp;

    return {
      token,
      userId,
      full_name,
      user: userObj as Omit<UserDocument, 'password' | 'otp'>
    };
  }

  /**
   * Signs in a user using Google authentication.
   * @param idToken - The ID token received from Google.
   * @returns A promise that resolves to an object containing the JWT token and user document.
   */
  static async googleSignIn(
    idToken: string
  ): Promise<{ token: string; user: UserDocument; }> {
    if (!idToken) {
      throw new Error('ID token is required');
    }
  
    const decodedToken = await auth.verifyIdToken(idToken);
    const { email, name, picture, email_verified, uid } = decodedToken;
    const profilePicture = picture ?? 'https://default-profile-picture.url';
    const [firstName, lastName] = name ? name.split(' ') : ['', ''];
  
    let user = await User.findOne({ email });
  
    if (user) {
      user.googleId = uid;
      user.profile_picture = profilePicture;
      user.first_name = firstName;
      user.last_name = lastName;
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
  
    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY!,
      { expiresIn: '1h' }
    );
  
    return { token, user };
  }
  
  /**
   * Logs in a user using Google authentication.
   * @param idToken - The ID token received from Google.
   * @returns A promise that resolves to an object containing the JWT token and user document.
   */
  static async googleLogin(
    idToken: string
  ): Promise<{
    token: string;
    user: UserDocument;
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
      user.googleId = uid;
      user.profile_picture = profilePicture;
      user.first_name = firstName;
      user.last_name = lastName;
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
  
    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY!,
      { expiresIn: '1h' }
    );
  
    return { token, user };
  }

  /**
   * Requests a One-Time Password (OTP) for the user identified by the provided email.
   * @param email - The email address of the user.
   */
  static async requestOTP(email: string): Promise<{ otp: string; message: string }> {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Generate a new OTP
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
      digits: 4,
    });

    // Set OTP expiration (10 minutes from now)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with OTP and expiration
    user.otp = otp;
    user.otp_expires = otpExpires;
    await user.save();

    // Optionally, send the OTP via email
    await EmailService.sendVerificationEmail(email, otp);

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
  static async verifyOTP(email: string, otp: string): Promise<{ token: string, user: Omit<UserDocument, 'password' | 'otp'> }> {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (!user.otp || user.otp !== otp) {
      throw new CustomError('Invalid OTP', 400);
    }

    if (user.otp_expires && user.otp_expires < new Date()) {
      throw new CustomError('OTP has expired', 400);
    }

    user.verified = true;
    // Do not clear OTP or otp_expires here

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY!, {
      expiresIn: '360h',
    });

    const userObj = user.toObject() as any;
    delete userObj.password;
    delete userObj.otp;

    // await EmailService.sendVerificationSuccessEmail(email);
    console.log('OTP verified successfully');
    return { token, user: userObj as Omit<UserDocument, 'password' | 'otp'> };
  }

  /**
   * Changes the user's password.
   * @param email - The email address of the user.
   * @param new_password - The new password to set.
   * @param confirm_password - Confirmation of the new password.
   */
  static async newPassword(
    email: string,
    new_password: string,
    confirm_password: string,
    otp: string
  ): Promise<{ message: string; token: string, user: Omit<UserDocument, 'password' | 'otp'> }> {
    if (new_password !== confirm_password) {
      throw new CustomError('Passwords do not match', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (!user.otp || user.otp !== otp) {
      throw new CustomError('Invalid OTP', 400);
    }

    if (user.otp_expires && user.otp_expires < new Date()) {
      throw new CustomError('OTP has expired', 400);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otp_expires = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY!, {
      expiresIn: '360h',
    });

    const userObj = user.toObject() as any;
    delete userObj.password;
    delete userObj.otp;

    return { message: 'Your password has been changed successfully.', token, user: userObj as Omit<UserDocument, 'password' | 'otp'> };
  }

  /**
   * Changes the user's password after verifying the current password.
   * @param userId - The ID of the user.
   * @param currentPassword - The current password of the user.
   * @param newPassword - The new password to set.
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('user by id after4');
      throw new CustomError('Current password is incorrect', 400);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds); 

    user.password = hashedPassword;
    await user.save();
  }
}

export default AuthService;
