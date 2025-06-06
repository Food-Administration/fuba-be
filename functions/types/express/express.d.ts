// types/express/index.d.ts (or wherever your existing file is located)
import { Types } from 'mongoose';
import { UserDocument } from '../../features/user/user.model'; // Adjust the import path as necessary
import { UploadedFile } from 'express-fileupload';

declare global { 
  namespace Express {
    interface User extends Partial<UserDocument> {} // Make all properties optional
    interface Request {
      user?: UserDocument
      files?: { 
        [fieldname: string]: UploadedFile | UploadedFile[];
      };
    }
  } 
}

