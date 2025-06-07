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
      const user = await AuthService.signup(first_name, last_name, email, password, role);

      res.status(201).json({
        message: 'Verification code sent to your email',
        success: true,
        userId: user._id.toString(),
        email: user.email,
      });
    }
  );

  static login = asyncHandler(
    async (req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) => {
      const { email, password } = req.body;
      const { token, userId } = await AuthService.login(email, password);

      res.status(200).json({ token, userId });
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
      await AuthService.verifyOTP(email, otp);

      res.status(200).json({ message: 'OTP verified successfully' });
    }
  );

  static newPassword = asyncHandler(
    async (req: Request<{}, {}, NewPasswordRequest>, res: Response) => {
      const { email, new_password, confirm_password } = req.body;
      const result = await AuthService.newPassword(email, new_password, confirm_password);

      res.status(200).json(result);
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
