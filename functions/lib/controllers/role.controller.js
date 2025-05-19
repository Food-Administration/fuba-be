"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const role_service_1 = __importDefault(require("../services/role.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class RoleController {
}
_a = RoleController;
RoleController.createRole = (0, asyncHandler_1.default)(async (req, res) => {
    const { name, permissions } = req.body;
    const role = await role_service_1.default.createRole(name, permissions);
    res.status(201).json(role);
});
RoleController.getRoles = (0, asyncHandler_1.default)(async (req, res) => {
    const roles = await role_service_1.default.getRoles();
    res.status(200).json(roles);
});
RoleController.getRoleById = (0, asyncHandler_1.default)(async (req, res) => {
    const { roleId } = req.params;
    const role = await role_service_1.default.getRoleById(roleId);
    if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
    }
    res.status(200).json(role);
});
RoleController.updateRole = (0, asyncHandler_1.default)(async (req, res) => {
    const { roleId } = req.params;
    const { name, permissions } = req.body;
    const role = await role_service_1.default.updateRole(roleId, name, permissions);
    if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
    }
    res.status(200).json(role);
});
RoleController.deleteRole = (0, asyncHandler_1.default)(async (req, res) => {
    const { roleId } = req.params;
    await role_service_1.default.deleteRole(roleId);
    res.status(204).json({ message: 'Role deleted successfully' });
});
exports.default = RoleController;
//# sourceMappingURL=role.controller.js.map