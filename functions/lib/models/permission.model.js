"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PermissionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
});
exports.default = (0, mongoose_1.model)('Permission', PermissionSchema);
//# sourceMappingURL=permission.model.js.map