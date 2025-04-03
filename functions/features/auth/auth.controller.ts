import { Request, Response } from 'express';
// import { UserDocument } from '../user/user.model';
import AuthService from './auth.service';
import asyncHandler from '../../utils/asyncHandler';

class AuthController {
  static signup = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      // Receive the created user from the service
      let user = await AuthService.signup( email, password);
  
      res.status(201).json({
        message: 'Verification code sent to your email', 
        success: true,
        userId: user._id,
        email: user.email,
        verified: user.verified,
      });
    }
  );

  // static verifyEmail = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     console.log('Request params:', req.params); // Debug log
  //     if (!req.params.email || !req.params.otp) { 
  //       throw new Error('Missing email or OTP in request parameters');
  //     }

  //     const { email, otp } = req.params;

  //     const { token, userId } = await AuthService.verifyEmail(email, otp);

  //     res.json({ token, userId, message: 'Email verified successfully', success: true, emailVerified: true });
  //   }
  // );

  static verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, otp } = req.body;
      if (!email || !otp) {
        throw new Error('Missing email or OTP in request body');
      }
  
      const { token, userId } = await AuthService.verifyEmail(email, otp);
  
      res.json({ token, userId, message: 'Email verified successfully', success: true, emailVerified: true });
    }
  );

  static login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;
  
      // Call the AuthService.login method
      const { token, userId, verified, fullName } =
        await AuthService.login(email, password);
  
      // Send the response with settings preferences
      res.status(200).json({
        token,
        userId,
        fullName,
        verified,
      });
    }
  );

  static requestPasswordReset = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      await AuthService.requestPasswordReset(email);

      res.json({ message: 'Password reset email sent' });
    }
  );

  static resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { token, newPassword } = req.body;

      await AuthService.resetPassword(token, newPassword);

      res.json({ message: 'Password reset successfully' });
    }
  );

  // static changePassword = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const user = req.user as unknown as UserDocument;
  //     console.log('user data: ', user);
  //     const userId = user._id.toString(); // Ensure user ID is retrieved from the authenticated user
  //     console.log('userId data: ', userId);
  //     const { currentPassword, newPassword } = req.body;
  //     await AuthService.changePassword(userId, currentPassword, newPassword);
  //     res.status(200).json({ message: 'Password changed successfully' });
  //   }
  // );

  static resendVerificationEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      await AuthService.resendVerificationEmail(email);

      res.status(200).json({ message: 'Verification email resent' , success:true});
    }
  );
}

export default AuthController;
