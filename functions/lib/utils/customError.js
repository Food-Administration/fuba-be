"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    constructor(message, status, isEmailVerified) {
        super(message);
        this.status = status;
        this.isEmailVerified = isEmailVerified;
    }
}
exports.default = CustomError;
//# sourceMappingURL=customError.js.map