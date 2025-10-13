import { Request, Response } from 'express';
import { Role, UserDocument } from '../user/user.model';
import AuthService from './auth.service';
import asyncHandler from '../../utils/asyncHandler';
import {
  // SignupRequest,
  LoginRequest,
  GoogleAuthRequest,
  OTPRequest,
  VerifyOTPRequest,
  NewPasswordRequest,
  ChangePasswordRequest,
  ResendVerificationEmailRequest
} from './auth.request';

import {
  // SignupResponse,
  LoginResponse,
  GoogleAuthResponse,
  OTPResponse,
  MessageResponse
} from './auth.response';

interface InitiateVerificationRequest {
  email: string;
}

interface VerifyEmailRequest {
  email: string;
  otp: string;
}

interface CompleteRegistrationRequest {
  verification_token: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  role: Role;
}

class AuthController {
  static initiateEmailVerification = asyncHandler(
    async (req: Request<{}, {}, InitiateVerificationRequest>, res: Response) => {
      const { email } = req.body;
      const { message } = await AuthService.initiateEmailVerification(email);

      res.status(200).json({
        message,
        success: true
      });
    }
  );

  static verifyEmail = asyncHandler(
    async (req: Request<{}, {}, VerifyEmailRequest>, res: Response) => {
      const { email, otp } = req.body;
      const { verification_token, message } = await AuthService.verifyEmail(email, otp);

      res.status(200).json({
        message,
        success: true,
        verification_token
      });
    }
  );

  static completeRegistration = asyncHandler(
    async (req: Request<{}, {}, CompleteRegistrationRequest>, res: Response) => {
      const {
        verification_token,
        first_name,
        last_name,
        phone_number,
        password,
        role
      } = req.body;

      const { user, token } = await AuthService.completeRegistration(
        verification_token,
        first_name,
        last_name,
        phone_number,
        password,
        role
      );

      res.status(201).json({
        message: 'Registration completed successfully',
        success: true,
        token,
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
          verified: user.verified
        }
      });
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
