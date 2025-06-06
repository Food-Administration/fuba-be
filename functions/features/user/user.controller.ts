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
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(user);
    }
  );

  // Get a user's profile
  static getProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const profile = await UserService.getProfile(userId);
      res.status(200).json(profile);
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
      res.status(200).json(updatedProfile);
    }
  );

  // Update a user's password
  static updatePassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const { oldPassword, newPassword } = req.body;
      const result = await UserService.updatePassword(
        userId,
        oldPassword,
        newPassword
      );
      res
        .status(200)
        .json({ result, message: 'Password Changed Successfully' });
    }
  );

  // Update a user's profile picture
  static updateProfilePicture = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const { imageUrl } = req.body;
      const updatedProfile = await UserService.updateProfilePicture(
        userId,
        imageUrl
      );
      res.status(200).json(updatedProfile);
    }
  );

}
export default UserController;