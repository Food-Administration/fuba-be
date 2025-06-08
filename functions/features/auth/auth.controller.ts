import { Request, Response } from 'express';
import { UserDocument } from '../user/user.model';
import AuthService from './auth.service';
import asyncHandler from '../../utils/asyncHandler';
import {
  SignupRequest,
  LoginRequest,
  GoogleAuthRequest,
  OTPRequest,
  VerifyOTPRequest,
  NewPasswordRequest,
  ChangePasswordRequest,
  ResendVerificationEmailRequest
} from './auth.request';

import {
  SignupResponse,
  LoginResponse,
  GoogleAuthResponse,
  OTPResponse,
  MessageResponse
} from './auth.response';

class AuthController {
  static signup = asyncHandler(
    async (req: Request<{}, {}, SignupRequest>, res: Response<SignupResponse>) => {
      const { first_name, last_name, email, password, role } = req.body;
      try {
        const user = await AuthService.signup(first_name, last_name, email, password, role);

        const isVerified = user.verified || user.verified; // Adjust property name as per your user model

        res.status(isVerified ? 200 : 201).json({
          message: isVerified
            ? 'User already verified'
            : 'Verification code sent to your email',
          success: true,
          email: user.email,
          // otp: user.otp,
          // otpExpires: user.otp_expires
        });
      } catch (error: any) {
        // Handle known errors from the service
        res.status(error.statusCode || 400).json({
          message: error.message || 'Signup failed',
          success: false
        });
      }
    }
  );

  static login = asyncHandler(
    async (req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) => {
      const { email, password } = req.body;
      const { token, userId, user } = await AuthService.login(email, password);

      res.status(200).json({ token, userId, user });
    }
  );

  static googleSignIn = asyncHandler(
    async (req: Request<{}, {}, GoogleAuthRequest>, res: Response<GoogleAuthResponse>) => {
      const { idToken } = req.body;
      const { token, user } = await AuthService.googleSignIn(idToken);

      res.status(200).json({ token, user });
    }
  );

  static googleLogin = asyncHandler(
    async (req: Request<{}, {}, GoogleAuthRequest>, res: Response<GoogleAuthResponse>) => {
      const { idToken } = req.body;
      const { token, user } = await AuthService.googleLogin(idToken);

      res.status(200).json({ token, user });
    }
  );

  static requestOTP = asyncHandler(
    async (req: Request<{}, {}, OTPRequest>, res: Response<OTPResponse>) => {
      const { email } = req.body;
      const { otp, message } = await AuthService.requestOTP(email);

      res.status(200).json({ otp, message });
    }
  );

  static verifyOTP = asyncHandler(
    async (req: Request<{}, {}, VerifyOTPRequest>, res: Response<MessageResponse>) => {
      const { email, otp } = req.body;
      const {token, user} = await AuthService.verifyOTP(email, otp);

      res.status(200).json({ message: 'OTP verified successfully', success: true, token, user });
    }
  );

  static newPassword = asyncHandler(
    async (req: Request<{}, {}, NewPasswordRequest>, res: Response) => {
      const { email, new_password, confirm_password, otp } = req.body;
      const {token, user} = await AuthService.newPassword(email, new_password, confirm_password, otp);

      res.status(200).json({ message: 'New Password Changed Successfully', success: true, token, user });
    }
  );

  static changePassword = asyncHandler(
    async (req: Request<{}, {}, ChangePasswordRequest>, res: Response<MessageResponse>) => {
      const user = req.user as unknown as UserDocument;
      const userId = user._id.toString();
      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({ message: 'Password changed successfully' });
    }
  );

  static resendVerificationEmail = asyncHandler(
    async (req: Request<{}, {}, ResendVerificationEmailRequest>, res: Response<MessageResponse>) => {
      const { email } = req.body;
      await AuthService.resendVerificationEmail(email);

      res.status(200).json({ message: 'Verification email resent', success: true });
    }
  );
}

export default AuthController;
