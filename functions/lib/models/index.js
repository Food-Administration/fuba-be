"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Role = exports.Permission = void 0;
const permission_model_1 = __importDefault(require("./permission.model"));
exports.Permission = permission_model_1.default;
const role_model_1 = __importDefault(require("./role.model"));
exports.Role = role_model_1.default;
const user_model_1 = __importDefault(require("./user.model")); // Add other models as needed
exports.User = user_model_1.default;
//# sourceMappingURL=index.js.map