import speakeasy from 'speakeasy';
import User, { UserDocument } from '../user/user.model';
import EmailService from '../mail/email.service';
import jwt from 'jsonwebtoken';
import CustomError from '../../utils/customError';
import bcrypt from 'bcrypt';
import { auth } from '../../config/firebase';
import crypto from 'crypto';

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
  static async signup(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role: String
  ): Promise<UserDocument> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError('User already exists', 400);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user = new User({
      first_name,
      last_name,
      email,
      role,
      password: hashedPassword,
    });
    await user.save();
    
    return user;
  }

  /**
   * Logs in a user with the provided email and password.
   * @param email - The email address of the user.
   * @param password - The password for the user account.
   * @returns A promise that resolves to an object containing the JWT token, user ID, and full name.
   */
  static async login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    userId: string;
    full_name: string | null;
  }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User Not Found!', 401);
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
  
    return {
      token,
      userId,
      full_name,
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
  static async verifyOTP(email: string, otp: string): Promise<void> {
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
    user.otp = undefined; // Clear OTP after verification
    user.otp_expires = undefined; // Clear OTP expiration after verification

    await user.save();
    // await EmailService.sendVerificationSuccessEmail(email);
    console.log('OTP verified successfully');
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
    confirm_password: string
  ): Promise<{ message: string }> {
    if (new_password !== confirm_password) {
      throw new CustomError('Passwords do not match', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    user.password = hashedPassword;
    await user.save();

    return { message: 'Your password has been changed successfully.' };
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

  /**
   * Resends the verification email to the user identified by the provided email.
   * @param email - The email address of the user.
   */
  static async resendVerificationEmail(email: string): Promise<void> {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Generate a new verification code
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
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
    await EmailService.sendVerificationEmail(email, otp);
  }
}

export default AuthService;
