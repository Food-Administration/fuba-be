import multer from 'multer';
import { Request } from 'express';

// Use memory storage to keep the file in memory
const storage = multer.memoryStorage();
// console.log('Storage:', storage);
// const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', // XLS files
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX files
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log('File type is allowed:', file.mimetype);
    cb(null, true);
  } else {
    // console.log('File type is not allowed:', file.mimetype);
    // cb(new Error('Invalid file type. Only XLS and XLSX files are allowed for import.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;