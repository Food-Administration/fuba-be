"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', // XLS files
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX files
    ];
    if (allowedTypes.includes(file.mimetype)) {
        console.log('File type is allowed:', file.mimetype);
        cb(null, true);
    }
    else {
        // console.log('File type is not allowed:', file.mimetype);
        // cb(new Error('Invalid file type. Only XLS and XLSX files are allowed for import.'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
exports.default = upload;
//# sourceMappingURL=multer.js.map