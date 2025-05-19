"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RoleSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Permission' }],
});
exports.default = (0, mongoose_1.model)('Role', RoleSchema);
//# sourceMappingURL=role.model.js.map