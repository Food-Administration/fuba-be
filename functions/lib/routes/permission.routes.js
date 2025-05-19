"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_controller_1 = __importDefault(require("../controllers/permission.controller"));
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const router = (0, express_1.Router)();
router.use(jwtAuth_1.default);
router.post('/', permission_controller_1.default.createPermission);
router.get('/', permission_controller_1.default.getPermissions);
router.get('/permissions/:id', permission_controller_1.default.getPermissionById);
router.put('/:id', permission_controller_1.default.updatePermission);
router.delete('/:id', permission_controller_1.default.deletePermission);
exports.default = router;
//# sourceMappingURL=permission.routes.js.map