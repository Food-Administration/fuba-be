"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_model_1 = __importDefault(require("../models/role.model"));
const customError_1 = __importDefault(require("../utils/customError"));
const mongoose_1 = require("mongoose");
class RoleService {
    static async createRole(name, permissions) {
        const existingRole = await role_model_1.default.findOne({ name });
        if (existingRole) {
            throw new customError_1.default('Role already exists', 400);
        }
        const role = new role_model_1.default({ name, permissions });
        await role.save();
        return role;
    }
    static async getRoles() {
        return role_model_1.default.find().populate('permissions');
    }
    static async getRoleById(roleId) {
        return role_model_1.default.findById(roleId).populate('permissions');
    }
    static async getRoleIdsByNames(names) {
        const roles = await role_model_1.default.find({ name: { $in: names } });
        return roles.map(role => role._id.toString());
    }
    static async updateRole(roleId, name, permissions) {
        // Ensure permissions are valid ObjectId strings
        const permissionsObjectIds = permissions.map((perm) => {
            if (typeof perm === 'object' && perm._id) {
                perm = perm._id;
            }
            if (!mongoose_1.Types.ObjectId.isValid(perm)) {
                throw new customError_1.default(`Invalid permission ID: ${perm}`, 400);
            }
            return new mongoose_1.Types.ObjectId(perm);
        });
        const role = await role_model_1.default.findByIdAndUpdate(roleId, { name, permissions: permissionsObjectIds }, { new: true, runValidators: true });
        return role;
    }
    static async deleteRole(roleId) {
        const role = await role_model_1.default.findById(roleId);
        if (!role) {
            throw new customError_1.default('Role not found', 404);
        }
        await role.deleteOne();
    }
}
exports.default = RoleService;
//# sourceMappingURL=role.service.js.map