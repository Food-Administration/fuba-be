import User from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';
// import User from '../models/user.model';

// Define UserDocument type if not already defined
type UserDocument = Document & {
  _id: string;
  email: string;
  password: string;
  roles: string[];
  [key: string]: any; // Add other fields as necessary
};
import { EmployeeDto } from '../models/Dtos/entities.dto';
import { Role } from '../models/index';
import * as crypto from 'crypto';
import CustomError from '../utils/customError';
import emailService from './email.service';
// import * as fs from 'fs';
// import path from 'path';

class UserService {

  async createUser(userData: EmployeeDto): Promise<UserDocument> {
    const { ...rest } = userData;

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new CustomError('User with this email already exists', 409); 
    }

    const password = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("designation role: ", userData.employmentDetails?.designation);

    let roleName = 'user';
    const designation = userData.employmentDetails?.designation?.toLowerCase();
    if (designation === 'supervisor') {
      roleName = 'supervisor';
    } else if (designation === 'manager') {
      roleName = 'manager';
    } else if (designation === 'employee') {
      roleName = 'user';
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new CustomError(`${roleName} role not found`, 404);
    }

    const user = new User({
      ...rest,
      password: hashedPassword,
      roles: [role._id],
    });
    await user.save();
    await emailService.sendUserPasswordEmail(
      user.email,
      user.firstName,
      user.email,
      password
    );
    return { ...user.toObject(), _id: user._id.toString() } as unknown as UserDocument;
  }

  async getUsers(): Promise<UserDocument[]> {
    const allowedRoles = await Role.find({ 
      name: { $in: ['user', 'supervisor', 'admin', "manager"] } 
    });
  
    if (!allowedRoles.length) {
      throw new CustomError('No valid roles found', 404);
    }

    const allowedRoleIds = allowedRoles.map(r => r._id);
    const users = await User.find({
      roles: { $in: allowedRoleIds },
      // $nor: [{ roles: { $in: restrictedRoleIds } }]  // Must NOT have admin or vendor
    }).populate('roles');

    return users.map(user => ({ ...user.toObject(), _id: user._id.toString() })) as unknown as UserDocument[];
  }

  async getUserById(id: string) {
    return await User.findById(id).populate('roles');
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

  async blockUser(id: string, isBlocked: boolean): Promise<UserDocument> {
    const user = await User.findByIdAndUpdate(
      id,
      { 
        isBlocked,
        status: isBlocked ? 'blocked' : 'active'
      },
      { new: true }
    ).populate('roles');
    
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    
    return user as unknown as UserDocument;
  }

  async assignRole(userId: string, roleName: string): Promise<UserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new CustomError('User role not found', 404);
    }

    user.roles.push(role._id);
    await user.save();
    return { ...user.toObject(), _id: user._id.toString() } as unknown as UserDocument;
  }

  async importUsers(users: any[]): Promise<{
    successCount: number;
    duplicateEmails: string[];
    errors: Array<{ email: string; error: string }>;
  }> {
    const results = {
      successCount: 0,
      duplicateEmails: [] as string[],
      errors: [] as Array<{ email: string; error: string }>,
    };

    for (const user of users) {
      try {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
          results.duplicateEmails.push(user.email);
          continue;
        }

        if (!user.password) {
          console.warn(`Password missing for user: ${user.email}. Generating a random password.`);
          user.password = crypto.randomBytes(8).toString('hex');
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const newUser = new User({
          ...user,
          password: hashedPassword,
          roles: Array.isArray(user.roles) ? user.roles : [],
        });

        await newUser.save();
        results.successCount++;
      } catch (error) {
        results.errors.push({
          email: user.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    return results;
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
    }).populate('roles');

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
    ).populate('roles');

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return { ...user.toObject(), _id: user._id.toString() } as unknown as UserDocument;
  }

  /**
   * Delete a user's profile.
   * @param userId - The ID of the user.
   * @returns A success message.
   */
  async deleteProfile(userId: string): Promise<{ message: string }> {
    const user = await User.findByIdAndUpdate(userId, { isDelete: true, status: "suspended" }, { new: true });
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return { message: 'Profile marked as deleted successfully' };
  }

  async restoreProfile(userId: string): Promise<{ message: string }> {
    const user = await User.findByIdAndUpdate(
      userId, 
      { isDelete: false, status: "active" },
      { new: true }
    );

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return { message: 'Profile restored successfully' };
  }

// /**
//  * Remove a document from a user's fileDocuments array
//  * @param userId - The ID of the user
//  * @param filePath - The path of the file to remove
//  * @returns The updated user document
//  */
// async removeDocument(userId: string, filePath: string): Promise<UserDocument> {
//   const user = await User.findByIdAndUpdate(
//     userId,
//     { $pull: { fileDocuments: filePath } },
//     { new: true }
//   ).populate('roles');

//   if (!user) {
//     throw new CustomError('User not found', 404);
//   }

//   const fullPath = path.join(__dirname, '../../', filePath);

//   try {
//     if (fs.existsSync(fullPath)) {
//       fs.unlinkSync(fullPath);
//       console.log(`Deleted file: ${fullPath}`);
//     } else {
//       console.warn(`File not found: ${fullPath}`);
//     }
//   } catch (err) {
//     console.error('Failed to delete file:', err);
//     throw new CustomError('File deletion failed', 500);
//   }

//   return user;
// }

/**
 * Get all documents for a user
 * @param userId - The ID of the user
 * @returns The user's fileDocuments array
 */
async getDocuments(userId: string): Promise<string[]> {
  const user = await User.findById(userId).select('fileDocuments');
  
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  return user.fileDocuments;
}

  // async updateNotificationPreferences(
  //   userId: string,
  //   email: boolean,
  //   push: boolean,
  //   filters: any
  // ): Promise<UserDocument> {
  //   const user = await User.findByIdAndUpdate(
  //     userId,
  //     { notificationPreferences: { email, push, filters } },
  //     { new: true }
  //   ).select('-password');

  //   if (!user) {
  //     throw new CustomError('User not found', 404);
  //   }

  //   return user;
  // }

  /**
   * Update user's activity status.
   * @param userId - The ID of the user.
   * @param activityStatus - The new activity status.
   * @returns The updated user document.
   */
  // async updateActivityStatus(
  //   userId: string,
  //   activityStatus: string
  // ): Promise<UserDocument> {
  //   const user = await User.findByIdAndUpdate(
  //     userId,
  //     { activityStatus },
  //     { new: true }
  //   ).select('-password');

  //   if (!user) {
  //     throw new CustomError('User not found', 404);
  //   }

  //   return user;
  // }

  // async updateSettings(
  //   userId: string,
  //   currency: string,
  //   calendarIntegration: boolean,
  //   theme: string
  // ): Promise<UserDocument> {
  //   const user = await User.findByIdAndUpdate(
  //     userId,
  //     { settings: { currency, calendarIntegration, theme } },
  //     { new: true }
  //   ).select('-password');

  //   if (!user) {
  //     throw new CustomError('User not found', 404);
  //   }

  //   return user;
  // }

  async uploadDocument(userId: string, filePath: string): Promise<UserDocument> {
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Add the file path to the user's fileDocuments array
    user.fileDocuments.push(filePath);

    await user.save();
    return { ...user.toObject(), _id: user._id.toString() } as unknown as UserDocument;
  }

  async deleteDocument(userId: string, filePath: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
  
    user.fileDocuments = user.fileDocuments.filter((doc: string) => doc !== filePath);
    await user.save();
  
    return user;
  }
}

export default new UserService();