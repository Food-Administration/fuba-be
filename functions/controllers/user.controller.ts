import { Request, Response } from 'express';
import UserService from '../services/user.service';
import asyncHandler from '../utils/asyncHandler';
import { EmployeeDto } from '../models/Dtos/entities.dto';
import { bucket } from '../config/firebase'; // Ensure Firebase bucket is imported
// import csvParser from 'csv-parser'; // Import CSV parser for handling CSV files
// import { Readable } from 'stream'; // Import Readable for handling file streams
// import * as xlsx from 'xlsx'; // Import xlsx for handling Excel files

class UserController {
  static createUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // const userData: CreateUserDto = req.body;
      const userData: EmployeeDto = req.body;
      const user = await UserService.createUser(userData);
      res.status(201).json(user);
    }
  );

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

  // static getUsers = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const users = await UserService.getUsers('user');
  //     res.status(200).json(users);
  //   }
  // );

  static getUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const users = await UserService.getUsers();
      res.status(200).json(users);
    }
  );

  static updateUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const updateData = req.body;
      console.log('updateData: ', updateData);
      const user = await UserService.updateUser(req.params.userId, updateData);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(user);
    }
  );

  static deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = await UserService.deleteUser(req.params.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json({ message: 'User deleted successfully' });
    }
  );

  // static blockUser = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const { userId } = req.params;
  //     const { isBlocked } = req.body;
  //     const user = await UserService.blockUser(userId, isBlocked);
  //     if (!user) {
  //       res.status(404).json({ message: 'User not found' });
  //       return;
  //     }
  //     res.status(200).json(user);
  //   }
  // );

  static blockUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const { isBlocked } = req.body;

      // Validate input
      if (typeof isBlocked !== 'boolean') {
        res.status(400).json({ message: 'isBlocked must be a boolean' });
        return;
      }

      const user = await UserService.blockUser(userId, isBlocked);
      res.status(200).json({
        message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        user,
      });
    }
  );

  static assignRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId, roleName } = req.body;

      const user = await UserService.assignRole(userId, roleName);

      res.status(200).json({ message: 'Role assigned successfully', user });
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

  // Delete a user's profile
  // static deleteProfile = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const { userId } = req.params;
  //     const result = await UserService.deleteProfile(userId);
  //     res.status(200).json(result);
  //   }
  // );

  static deleteProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const result = await UserService.deleteProfile(userId);
      res.status(200).json(result);
    }
  );

  static restoreProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const result = await UserService.restoreProfile(userId);
      res.status(200).json(result);
    }
  );

  // static updateNotificationPreferences = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const { userId } = req.params;
  //     const { email, push, filters } = req.body;

  //     const user = await UserService.updateNotificationPreferences(
  //       userId,
  //       email,
  //       push,
  //       filters
  //     );

  //     res.json(user);
  //   }
  // );

  /**
   * Update user's activity status.
   */
  // static updateActivityStatus = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const { userId } = req.params;
  //     const { activityStatus } = req.body;

  //     const user = await UserService.updateActivityStatus(
  //       userId,
  //       activityStatus
  //     );

  //     res.json(user);
  //   }
  // );

  // static updateSettings = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const { userId } = req.params;
  //     const { currency, calendarIntegration, theme } = req.body;

  //     const user = await UserService.updateSettings(
  //       userId,
  //       currency,
  //       calendarIntegration,
  //       theme
  //     );

  //     res.json(user);
  //   }
  // );

  /**
   * Upload a document for a user
   */
  static uploadDocument = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      // Debugging: Log the file mimetype
      console.log('Uploaded file mimetype:', file.mimetype);

      // Validate file type
      // const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      // if (!allowedMimeTypes.includes(file.mimetype)) {
      //   res.status(400).json({ message: 'Invalid file type. Only PDF and Word files are allowed.' });
      //   return;
      // }

      try {
        // Generate a unique file name
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = `uploads/documents/${fileName}`;
        const fileRef = bucket.file(filePath);

        // Upload the file to Firebase Storage
        const stream = fileRef.createWriteStream({
          metadata: { contentType: file.mimetype },
        });

        stream.end(file.buffer);

        stream.on('finish', async () => {
          console.log(`File uploaded to Firebase Storage: ${filePath}`);

          // Save the file path in the database
          const result = await UserService.uploadDocument(userId, filePath);

          res.status(200).json({
            message: 'Document uploaded successfully',
            fileUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}`,
            user: result,
          });
        });

        stream.on('error', (err: any) => {
          console.error('Error uploading file to Firebase Storage:', err);
          res.status(500).json({ message: 'Failed to upload document to Firebase Storage', error: err.message });
        });
      } catch (error: any) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Failed to upload document', error: error.message });
      }
    }
  );

  static importUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      console.log('Debugging uploadDocument');
      console.log('Received JSON data:', req.body);

      // Validate Content-Type header
      if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid Content-Type. Expected application/json.' });
        return;
      }

      const parsedData = req.body;

      // Validate that the data is an array
      if (!Array.isArray(parsedData)) {
        res.status(400).json({ message: 'Invalid input. Expected an array of users.' });
        return;
      }

      // Validate each user object
      const requiredFields = ['email', 'department', 'designation', 'firstName', 'lastName'];
      const invalidEntries = parsedData.filter((item: any) => {
        return !requiredFields.every((field) => field in item && item[field]);
      });

      if (invalidEntries.length > 0) {
        res.status(400).json({
          message: 'Invalid input. Some user objects are missing required fields.',
          invalidEntries,
        });
        return;
      }

      try {
        // Validate and remove duplicates based on email
        const uniqueEmails = new Set();
        const filteredData = parsedData.filter((item: any) => {
          if (!item.email || uniqueEmails.has(item.email)) {
            return false; // Skip if email is missing or already exists
          }
          uniqueEmails.add(item.email);
          return true;
        });

        console.log('Filtered data (no duplicates):', filteredData);

        // Validate the filtered data
        if (filteredData.length === 0) {
          res.status(400).json({ message: 'Uploaded data is empty or contains only duplicates.' });
          return;
        }

        // Pass the filtered data to the importUsers service
        const result = await UserService.importUsers(filteredData);

        res.status(200).json({
          message: 'Users imported successfully',
          stats: {
            totalAttempted: filteredData.length,
            successfullyImported: result.successCount,
            duplicatesFound: result.duplicateEmails.length,
            errorsOccurred: result.errors.length,
          },
          duplicates: result.duplicateEmails,
          errors: result.errors,
        });
      } catch (error: any) {
        console.error('Error processing uploaded data:', error);
        res.status(500).json({ message: 'Failed to process uploaded data', error: error.message });
      }
    }
  );

  static getUserDocuments = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;

      try {
        // Fetch the user's document paths from the database
        const user = await UserService.getUserById(userId);
        if (!user || !user.fileDocuments) {
          res.status(404).json({ message: 'No documents found for this user' });
          return;
        }

        // Generate public URLs for each document
        const documents = user.fileDocuments.map((filePath: string) => ({
          fileName: filePath.split('/').pop(),
          fileUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`,
        }));

        res.status(200).json({ documents });
      } catch (error: any) {
        console.error('Error fetching user documents:', error);
        res.status(500).json({ message: 'Failed to fetch user documents', error: error.message });
      }
    }
  );

  static deleteDocument = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId, filename } = req.params;

      try {
        const filePath = `uploads/documents/${filename}`;
        const fileRef = bucket.file(filePath);

        await fileRef.delete();
        const result = await UserService.deleteDocument(userId, filePath);

        res.status(200).json({
          message: 'Document deleted successfully',
          user: result,
        });
      } catch (error: any) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document', error: error.message });
      }
    }
  );

}
export default UserController;