"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const firebase_1 = require("../config/firebase"); // Ensure Firebase bucket is imported
// import csvParser from 'csv-parser'; // Import CSV parser for handling CSV files
// import { Readable } from 'stream'; // Import Readable for handling file streams
// import * as xlsx from 'xlsx'; // Import xlsx for handling Excel files
class UserController {
}
_a = UserController;
UserController.createUser = (0, asyncHandler_1.default)(async (req, res) => {
    // const userData: CreateUserDto = req.body;
    const userData = req.body;
    const user = await user_service_1.default.createUser(userData);
    res.status(201).json(user);
});
UserController.getUserById = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    console.log('userId: ', userId);
    const user = await user_service_1.default.getUserById(userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.status(200).json(user);
});
// static getUsers = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const users = await UserService.getUsers('user');
//     res.status(200).json(users);
//   }
// );
UserController.getUsers = (0, asyncHandler_1.default)(async (req, res) => {
    const users = await user_service_1.default.getUsers();
    res.status(200).json(users);
});
UserController.updateUser = (0, asyncHandler_1.default)(async (req, res) => {
    const updateData = req.body;
    console.log('updateData: ', updateData);
    const user = await user_service_1.default.updateUser(req.params.userId, updateData);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.status(200).json(user);
});
UserController.deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
    const user = await user_service_1.default.deleteUser(req.params.userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.json({ message: 'User deleted successfully' });
});
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
UserController.blockUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { isBlocked } = req.body;
    // Validate input
    if (typeof isBlocked !== 'boolean') {
        res.status(400).json({ message: 'isBlocked must be a boolean' });
        return;
    }
    const user = await user_service_1.default.blockUser(userId, isBlocked);
    res.status(200).json({
        message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        user,
    });
});
UserController.assignRole = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId, roleName } = req.body;
    const user = await user_service_1.default.assignRole(userId, roleName);
    res.status(200).json({ message: 'Role assigned successfully', user });
});
// Get a user's profile
UserController.getProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const profile = await user_service_1.default.getProfile(userId);
    res.status(200).json(profile);
});
// Update a user's profile
UserController.updateProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;
    const updatedProfile = await user_service_1.default.updateProfile(userId, updateData);
    res.status(200).json(updatedProfile);
});
// Update a user's password
UserController.updatePassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
    const result = await user_service_1.default.updatePassword(userId, oldPassword, newPassword);
    res
        .status(200)
        .json({ result, message: 'Password Changed Successfully' });
});
// Update a user's profile picture
UserController.updateProfilePicture = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { imageUrl } = req.body;
    const updatedProfile = await user_service_1.default.updateProfilePicture(userId, imageUrl);
    res.status(200).json(updatedProfile);
});
// Delete a user's profile
// static deleteProfile = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const { userId } = req.params;
//     const result = await UserService.deleteProfile(userId);
//     res.status(200).json(result);
//   }
// );
UserController.deleteProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await user_service_1.default.deleteProfile(userId);
    res.status(200).json(result);
});
UserController.restoreProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await user_service_1.default.restoreProfile(userId);
    res.status(200).json(result);
});
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
UserController.uploadDocument = (0, asyncHandler_1.default)(async (req, res) => {
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
        const fileRef = firebase_1.bucket.file(filePath);
        // Upload the file to Firebase Storage
        const stream = fileRef.createWriteStream({
            metadata: { contentType: file.mimetype },
        });
        stream.end(file.buffer);
        stream.on('finish', async () => {
            console.log(`File uploaded to Firebase Storage: ${filePath}`);
            // Save the file path in the database
            const result = await user_service_1.default.uploadDocument(userId, filePath);
            res.status(200).json({
                message: 'Document uploaded successfully',
                fileUrl: `https://firebasestorage.googleapis.com/v0/b/${firebase_1.bucket.name}/o/${encodeURIComponent(filePath)}`,
                user: result,
            });
        });
        stream.on('error', (err) => {
            console.error('Error uploading file to Firebase Storage:', err);
            res.status(500).json({ message: 'Failed to upload document to Firebase Storage', error: err.message });
        });
    }
    catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Failed to upload document', error: error.message });
    }
});
UserController.importUsers = (0, asyncHandler_1.default)(async (req, res) => {
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
    const invalidEntries = parsedData.filter((item) => {
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
        const filteredData = parsedData.filter((item) => {
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
        const result = await user_service_1.default.importUsers(filteredData);
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
    }
    catch (error) {
        console.error('Error processing uploaded data:', error);
        res.status(500).json({ message: 'Failed to process uploaded data', error: error.message });
    }
});
UserController.getUserDocuments = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId } = req.params;
    try {
        // Fetch the user's document paths from the database
        const user = await user_service_1.default.getUserById(userId);
        if (!user || !user.fileDocuments) {
            res.status(404).json({ message: 'No documents found for this user' });
            return;
        }
        // Generate public URLs for each document
        const documents = user.fileDocuments.map((filePath) => ({
            fileName: filePath.split('/').pop(),
            fileUrl: `https://firebasestorage.googleapis.com/v0/b/${firebase_1.bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`,
        }));
        res.status(200).json({ documents });
    }
    catch (error) {
        console.error('Error fetching user documents:', error);
        res.status(500).json({ message: 'Failed to fetch user documents', error: error.message });
    }
});
UserController.deleteDocument = (0, asyncHandler_1.default)(async (req, res) => {
    const { userId, filename } = req.params;
    try {
        const filePath = `uploads/documents/${filename}`;
        const fileRef = firebase_1.bucket.file(filePath);
        await fileRef.delete();
        const result = await user_service_1.default.deleteDocument(userId, filePath);
        res.status(200).json({
            message: 'Document deleted successfully',
            user: result,
        });
    }
    catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document', error: error.message });
    }
});
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map