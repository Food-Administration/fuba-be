import { Request, Response } from 'express';
import UserService from './user.service';
import asyncHandler from '../../utils/asyncHandler';

class UserController {
  static getUserById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      console.log('userId: ', userId);
      const user = await UserService.getUserById(userId as string);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, data: user });
    }
  );

  // Get a user's profile
  static getProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const profile = await UserService.getProfile(userId);
      res.status(200).json({ success: true, data: profile });
    }
  );

  // Update a user's profile
  static updateProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const updateData = req.body;
      const updatedProfile = await UserService.updateProfile(
        userId,
        updateData
      );
      res.status(200).json({ success: true, data: updatedProfile, message: 'Profile updated successfully' });
    }
  );

  // Update a user's password
  static updatePassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const { oldPassword, newPassword } = req.body;
      await UserService.updatePassword(
        userId,
        oldPassword,
        newPassword
      );
      res
        .status(200)
        .json({ success: true, message: 'Password Changed Successfully' });
    }
  );

  // Update a user's profile picture
  static updateProfilePicture = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const file = req.file;
      
      // If file is uploaded, use the new upload method
      if (file) {
        const updatedProfile = await UserService.uploadProfilePicture(
          userId,
          file
        );
        const u: any = updatedProfile;
        const data = {
          id: u.id || u._id,
          email: u.email,
          full_name: u.full_name,
          profile_picture: u.profile_picture,
          first_name: u.first_name,
          last_name: u.last_name,
          role: u.role,
        };
        res.status(200).json({ success: true, data, message: 'Profile picture updated successfully' });
        return;
      }
      
      // Fallback to URL-based update
      const { imageUrl } = req.body;
      if (!imageUrl) {
        res.status(400).json({
          success: false,
          message: 'No image file or imageUrl provided'
        });
        return;
      }
      
      const updatedProfile = await UserService.updateProfilePicture(
        userId,
        imageUrl
      );
      const u: any = updatedProfile;
      const data = {
        id: u.id || u._id,
        email: u.email,
        full_name: u.full_name,
        profile_picture: u.profile_picture,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
      };
      res.status(200).json({ success: true, data, message: 'Profile picture updated successfully' });
    }
  );

  // Update user details and optionally profile picture (multipart or JSON)
  static updateDetails = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const updateData = req.body;
      // Support both single-file (req.file) and any/fields (req.files as array)
      let file = (req as any).file as Express.Multer.File | undefined;
      const filesAny = (req as any).files as Express.Multer.File[] | undefined;
      if (!file && Array.isArray(filesAny) && filesAny.length > 0) {
        file = filesAny.find((f) => f?.mimetype?.startsWith('image/')) || filesAny[0];
      }

      const updated = await UserService.updateProfileWithPicture(
        userId,
        updateData,
        file
      );

      res.status(200).json({
        success: true,
        data: {
          id: (updated as any).id || (updated as any)._id,
          email: (updated as any).email,
          full_name: (updated as any).full_name,
          profile_picture: (updated as any).profile_picture,
          first_name: (updated as any).first_name,
          last_name: (updated as any).last_name,
          role: (updated as any).role,
        },
        message: 'User details updated successfully'
      });
    }
  );

}
export default UserController;