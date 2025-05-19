import * as express from 'express';

// Extend Express Request type to include user with roles
declare global {
  namespace Express {
    interface User {
      id: string;
      roles: (ObjectId | Model<RoleDocument>)[]; 
    }
    interface Request {
      user?: User;
    }
  }
}

import UserController from '../controllers/user.controller';
import upload from '../config/multer'; // Ensure multer is configured
import { Model, ObjectId } from 'mongoose';
import { RoleDocument } from '../models/role.model';
import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

router.use(jwtAuth)

router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/', UserController.createUser);
router.get('/:userId', UserController.getUserById);
router.get('/', UserController.getUsers);
router.put('/:userId', UserController.updateUser);
// router.delete('/:userId', UserController.deleteUser);
router.patch('/:userId/block-status', UserController.blockUser);
router.post('/assign-role', UserController.assignRole);

// Profile routes
router.get('/profile/:userId', UserController.getProfile);
router.put('/profile/:userId', UserController.updateProfile);
router.patch('/profile/:userId', UserController.updatePassword);
router.patch(
  '/profile/:userId/profile-picture',
  UserController.updateProfilePicture
);
router.patch('/profile/delete/:userId', UserController.deleteProfile);
router.patch('/profile/restore/:userId', UserController.restoreProfile);

// router.patch(
//   '/notification-preferences',
//   UserController.updateNotificationPreferences
// );

// // Update activity status
// router.patch('/activity-status', UserController.updateActivityStatus);
// router.patch('/settings', UserController.updateSettings);
router.post(
  '/importUsers/file/upload-file',
  upload.single('file'),
  UserController.importUsers
);
router.post('/:userId/documents/document/upload-file', upload.single('document'), UserController.uploadDocument);
router.get('/:userId/documents', UserController.getUserDocuments);

// Ensure this route is placed after other routes to avoid conflicts
router.delete('/:userId/documents/:filename', UserController.deleteDocument);

export default router;
