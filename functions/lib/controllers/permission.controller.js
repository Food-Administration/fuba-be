"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permission_service_1 = __importDefault(require("../services/permission.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class PermissionController {
    constructor() {
        this.createPermission = (0, asyncHandler_1.default)(async (req, res) => {
            const permission = await permission_service_1.default.createPermission(req.body);
            res.status(201).json(permission);
        });
        this.getPermissions = (0, asyncHandler_1.default)(async (req, res) => {
            const permissions = await permission_service_1.default.getPermissions();
            res.status(200).json(permissions);
        });
        this.getPermissionById = (0, asyncHandler_1.default)(async (req, res) => {
            const permission = await permission_service_1.default.getPermissionById(req.params.id);
            res.status(200).json(permission);
        });
        this.updatePermission = (0, asyncHandler_1.default)(async (req, res) => {
            const permission = await permission_service_1.default.updatePermission(req.params.id, req.body);
            res.status(200).json(permission);
        });
        this.deletePermission = (0, asyncHandler_1.default)(async (req, res) => {
            await permission_service_1.default.deletePermission(req.params.id);
            res.status(200).json({ message: 'Permission deleted successfully' });
        });
    }
}
exports.default = new PermissionController();
//# sourceMappingURL=permission.controller.js.map