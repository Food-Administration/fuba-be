"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const multer_1 = __importDefault(require("../config/multer")); // Ensure multer is configured
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const router = express.Router();
router.use(jwtAuth_1.default);
router.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});
router.post('/', user_controller_1.default.createUser);
router.get('/:userId', user_controller_1.default.getUserById);
router.get('/', user_controller_1.default.getUsers);
router.put('/:userId', user_controller_1.default.updateUser);
// router.delete('/:userId', UserController.deleteUser);
router.patch('/:userId/block-status', user_controller_1.default.blockUser);
router.post('/assign-role', user_controller_1.default.assignRole);
// Profile routes
router.get('/profile/:userId', user_controller_1.default.getProfile);
router.put('/profile/:userId', user_controller_1.default.updateProfile);
router.patch('/profile/:userId', user_controller_1.default.updatePassword);
router.patch('/profile/:userId/profile-picture', user_controller_1.default.updateProfilePicture);
router.patch('/profile/delete/:userId', user_controller_1.default.deleteProfile);
router.patch('/profile/restore/:userId', user_controller_1.default.restoreProfile);
// router.patch(
//   '/notification-preferences',
//   UserController.updateNotificationPreferences
// );
// // Update activity status
// router.patch('/activity-status', UserController.updateActivityStatus);
// router.patch('/settings', UserController.updateSettings);
router.post('/importUsers/file/upload-file', multer_1.default.single('file'), user_controller_1.default.importUsers);
router.post('/:userId/documents/document/upload-file', multer_1.default.single('document'), user_controller_1.default.uploadDocument);
router.get('/:userId/documents', user_controller_1.default.getUserDocuments);
// Ensure this route is placed after other routes to avoid conflicts
router.delete('/:userId/documents/:filename', user_controller_1.default.deleteDocument);
exports.default = router;
//# sourceMappingURL=user.route.js.map