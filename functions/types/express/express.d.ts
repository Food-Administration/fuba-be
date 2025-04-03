// types/express/index.d.ts (or wherever your existing file is located)
import { UserDocument } from '../../features/user/user.model'; // Adjust the import path as necessary

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument; // Your existing user property
      
    }
  }
}