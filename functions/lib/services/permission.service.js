"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permission_model_1 = __importDefault(require("../models/permission.model"));
const customError_1 = __importDefault(require("../utils/customError"));
class PermissionService {
    async createPermission(data) {
        const permission = new permission_model_1.default(data);
        return await permission.save();
    }
    async getPermissions() {
        return await permission_model_1.default.find();
    }
    async getPermissionById(id) {
        const permission = await permission_model_1.default.findById(id);
        if (!permission) {
            throw new customError_1.default('Permission not found', 404);
        }
        return permission;
    }
    async updatePermission(id, data) {
        const permission = await permission_model_1.default.findByIdAndUpdate(id, data, {
            new: true,
        });
        if (!permission) {
            throw new customError_1.default('Permission not found', 404);
        }
        return permission;
    }
    async deletePermission(id) {
        const permission = await permission_model_1.default.findByIdAndDelete(id);
        if (!permission) {
            throw new customError_1.default('Permission not found', 404);
        }
        return { message: 'Permission deleted successfully' };
    }
}
exports.default = new PermissionService();
//# sourceMappingURL=permission.service.js.map