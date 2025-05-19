import { Request, Response } from 'express';
import { UserDocument } from '../models/user.model';
import AuthService from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';
import settingsPreferencesModel from '../models/settingsPreferences.model';

class AuthController {
  static signup = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { companyName, email, password } = req.body;

      // Receive the created user from the service
      let user = await AuthService.signup(companyName, email, password);

      await user.populate('roles', 'name');

      // Fetch the associated settings preferences
    const settingsPreferences = await settingsPreferencesModel.findOne({
      userId: user._id,
    }).exec();
  
      res.status(201).json({
        message: 'Verification code sent to your email',
        success: true,
        userId: user._id,
        email: user.email,
        verified: user.verified,
        roles: user.roles.map((role) => ('name' in role ? role.name : role)),
        companyName: user.companyName,
        settingsPreferences: settingsPreferences || null,
      });
    }
  );

  static verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      console.log('Request params:', req.params);
      const { email, otp } = req.params;

      const { token, roles, userId, companyName, vendorLegalName, fullName, settingsPreferences } = await AuthService.verifyEmail(email, otp);

      res.json({ token, roles, userId, companyName, vendorLegalName, fullName, settingsPreferences, message: 'Email verified successfully', success: true, emailVerified: true });
    }
  );

  static login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;
  
      // Call the AuthService.login method
      const { token, roles, userId, companyName, vendorLegalName, verified, fullName, settingsPreferences } =
        await AuthService.login(email, password);
  
      // Send the response with settings preferences
      res.status(200).json({
        token,
        roles,
        userId,
        companyName,
        vendorLegalName,
        fullName,
        verified,
        settingsPreferences, // Include settings preferences in the response
      });
    }
  );

  static googleSignIn = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { idToken } = req.body;

      const { token, user, roles } = await AuthService.googleSignIn(idToken);

      res.json({ token, user, roles });
    }
  );

  static googleLogin = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { idToken } = req.body;

      const { token, user, roles  } = await AuthService.googleLogin(idToken);

      res.json({ token, user, roles });
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

  static changePassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user as unknown as UserDocument;
      console.log('user data: ', user);
      const userId = user._id.toString(); // Ensure user ID is retrieved from the authenticated user
      console.log('userId data: ', userId);
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Password changed successfully' });
    }
  );

  static resendVerificationEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      await AuthService.resendVerificationEmail(email);

      res.status(200).json({ message: 'Verification email resent' , success:true});
    }
  );
}

export default AuthController;
