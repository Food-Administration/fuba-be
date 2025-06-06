import User from './user.model';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';

type UserDocument = Document & {
  _id: string;
  email: string;
  password: string;
  [key: string]: any;
};
import CustomError from '../../utils/customError';

class UserService {
  async getUserById(id: string) {
    return await User.findById(id);
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId).select('fileDocuments'); // Ensure fileDocuments are included
    return user;
  }

  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async updateUser(id: string, updateData: any) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await User.findById(userId).populate('roles');
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return { ...user.toObject(), _id: user._id.toString() } as unknown as UserDocument;
  }

  async updateProfile(userId: string, updateData: any): Promise<UserDocument> {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return { ...user.toObject(), _id: user._id.toString() } as unknown as UserDocument;
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404); 
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid old password', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  /**
   * Upload or update a user's profile picture.
   * @param userId - The ID of the user.
   * @param imageUrl - The URL of the profile picture.
   * @returns The updated user profile.
   */
  async updateProfilePicture(
    userId: string,
    imageUrl: string
  ): Promise<UserDocument> {
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return { ...user.toObject(), _id: user._id.toString() } as unknown as UserDocument;
  }
}

export default new UserService();