"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const role_model_1 = __importDefault(require("../models/role.model"));
const customError_1 = __importDefault(require("../utils/customError"));
const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user;
        const user = await user_model_1.default.findById(userId._id).populate('roles');
        console.log("user: ", user);
        if (!user) {
            return next(new customError_1.default('User not found', 404));
        }
        const role = await role_model_1.default.findById(user.role);
        if (!role || role.name !== 'admin') {
            return next(new customError_1.default('Forbidden: Admins only', 403));
        }
        next();
    }
    catch (error) {
        next(new customError_1.default('Unauthorized', 401));
    }
};
exports.default = isAdmin;
//# sourceMappingURL=isAdmin.js.map