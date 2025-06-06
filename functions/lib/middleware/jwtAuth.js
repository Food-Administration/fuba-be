"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../features/user/user.model"));
const customError_1 = __importDefault(require("../utils/customError"));
const jwtAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new customError_1.default('Unauthorized', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET_KEY);
        const user = await user_model_1.default.findById(decoded.id);
        if (!user) {
            return next(new customError_1.default('User not found', 404));
        }
        // Type assertion here
        req.user = user;
        next();
    }
    catch (error) {
        next(new customError_1.default('Unauthorized', 401));
    }
};
exports.default = jwtAuth;
//# sourceMappingURL=jwtAuth.js.map