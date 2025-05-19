"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const role_model_1 = __importDefault(require("./role.model"));
const UserSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, auto: true },
    companyName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    username: { type: String },
    phNo: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    employmentDetails: {
        department: { type: String },
        designation: { type: String },
        empDate: { type: Date },
        empId: { type: String },
        empType: { type: String },
        jobRole: { type: String },
        supervisor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    fileDocuments: [{ type: String }],
    appointmentLetter: { type: String },
    emergencyContact: {
        contactName: { type: String },
        contactNumber: { type: String },
        contactAddress: { type: String },
        relationship: { type: String }, // Relationship with the emergency contact
    },
    profilePicture: { type: String },
    roles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Role', default: [] }],
    googleId: { type: String, default: null },
    twoFactorSecret: { type: String },
    isBlocked: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' },
    status: { type: String, enum: ['active', 'block', 'inactive', 'suspended'], default: 'active' },
    vendorBusinessDetails: {
        businessType: { type: String },
        category: { type: String },
        description: { type: String },
        vendorId: { type: String },
        vendorType: { type: mongoose_1.Schema.Types.ObjectId, ref: 'VendorType' },
    },
    vendorComplianceInfo: {
        cacDocument: { type: String },
        validId: { type: String },
    },
    contactInfo: {
        contactName: { type: String },
        primaryContact: { type: String },
        email: { type: String },
        secondaryContact: { type: String },
    },
    businessAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
    },
    vendorCompanyInfo: {
        vendorLegalName: { type: String },
        tradingName: { type: String },
        registrationNumber: { type: String },
        averageRating: { type: Number, default: 0 },
        reviews: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Review' }],
        taxId: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
    },
    performance: { type: Number, default: 0 },
    paymentHistory: [
        {
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            method: { type: String, required: true },
            status: { type: String, enum: ['paid', 'pending', 'overdue'], required: true },
        },
    ],
    bankingInfo: [
        {
            bankName: { type: String },
            accountName: { type: String },
            accountNumber: { type: String },
        },
    ],
    activityStatus: { type: String, default: 'active' },
    settings: { type: String, default: null },
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals are included in JSON output
    toObject: { virtuals: true }, // Ensure virtuals are included in object output
});
// Virtual property for fullName
UserSchema.virtual('fullName').get(function () {
    if (!this.firstName && !this.lastName) {
        return 'N/A';
    }
    if (!this.firstName) {
        return this.lastName;
    }
    if (!this.lastName) {
        return this.firstName;
    }
    return `${this.firstName} ${this.lastName}`;
});
// Pre-save hook to assign the default "user" or "admin" role
UserSchema.pre('save', async function (next) {
    if (this.isNew && this.roles.length === 0) {
        const userCount = await (0, mongoose_1.model)('User').countDocuments();
        const roleName = userCount === 0 ? 'admin' : 'user';
        const role = await role_model_1.default.findOne({ name: roleName });
        if (role) {
            console.log(`${roleName} role is in presave: `, role);
            this.roles.push(role._id);
        }
    }
    next();
});
exports.default = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=user.model.js.map