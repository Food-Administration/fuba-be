"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var Role;
(function (Role) {
    Role["Consumer"] = "consumer";
    Role["Vendor"] = "vendor";
    Role["Admin"] = "admin";
})(Role || (Role = {}));
const UserSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, auto: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    username: { type: String },
    phone_number: { type: String },
    role: { type: String, enum: Object.values(Role), required: true },
    first_name: { type: String },
    last_name: { type: String },
    profile_picture: { type: String },
    googleId: { type: String, default: null },
    twoFactorSecret: { type: String },
    otp_expires: { type: Date },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    reset_password_token: { type: String },
    reset_password_expires: { type: Date },
    settings: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual property for fullName
UserSchema.virtual('full_name').get(function () {
    if (!this.first_name && !this.last_name) {
        return 'N/A';
    }
    if (!this.first_name) {
        return this.last_name;
    }
    if (!this.last_name) {
        return this.first_name;
    }
    return `${this.first_name} ${this.last_name}`;
});
exports.default = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=user.model.js.map