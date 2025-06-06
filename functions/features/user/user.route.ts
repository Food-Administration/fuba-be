import * as express from 'express';

// Extend Express Request type to include user with roles
declare global {
  namespace Express {
    interface User {
      id: string;
    }
    interface Request {
      user?: User;
    }
  }
}

import UserController from './user.controller';
import jwtAuth from '../../middleware/jwtAuth';

const router = express.Router();

router.use(jwtAuth)

router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/:userId', UserController.getUserById);
router.get('/profile/:userId', UserController.getProfile);
router.put('/profile/:userId', UserController.updateProfile);
router.patch('/profile/:userId', UserController.updatePassword);
router.patch(
  '/profile/:userId/profile-picture',
  UserController.updateProfilePicture
);

export default router;
