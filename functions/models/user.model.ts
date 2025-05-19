import { Schema, model, Document, Types } from 'mongoose';
import RoleDocument from './role.model';

export interface CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    employmentDetails?: any;
    roles?: string[];
}

interface EmploymentDetails {
    department: string;
    designation: string;
    empDate: Date;
    empId?: string;
    empType: string;
    jobRole: string;
    supervisor: Schema.Types.ObjectId | null;
}

interface EmergencyContact {
    contactName: string;
    contactNumber: string;
    contactAddress: string;
    relationship: string; // Relationship with the emergency contact
}

interface VendorCompanyInfo {
    vendorLegalName: string;
    vendorId: string;
    tradingName: string;
    registrationNumber: string;
    averageRating?: number; // Average rating for vendors
    reviews?: Types.ObjectId[]; // Reference to Review
    taxId: string;
    startDate: Date;
    endDate: Date;
}

interface VendorBusinessDetails {
    businessType: string;
    category: string;
    description: string;
    vendorType: Schema.Types.ObjectId; // Reference to VendorType
}

interface ContactInfo {
    contactName: string;
    primaryContact: string;
    email: string;
    secondaryContact: string;
}

interface BusinessAddress {
    street: string;
    city: string;
    state: string;
    country: string;
}

interface BankingInfo {
    bankName: string;
    accountName: string;
    accountNumber: string;
}

interface PaymentDetails {
    date: Date;
    amount: number;
    method: string;
    status: 'paid' | 'pending' | 'overdue';
}

interface VendorComplianceInfo {
    cacDocument: string;
    validId: string;
}

export interface UserDocument extends Document {
    _id: Types.ObjectId; // Updated to use Types.ObjectId
    companyName: string;
    email: string;
    password: string;
    username?: string;
    phNo: string;
    firstName: string;
    lastName: string;
    fullName: string; // Virtual property
    employmentDetails?: EmploymentDetails;
    fileDocuments: string[];
    appointmentLetter: string;
    emergencyContact: EmergencyContact;
    profilePicture: string;
    roles: (Schema.Types.ObjectId | typeof RoleDocument)[];
    googleId: string | null;
    twoFactorSecret?: string;
    isBlocked: boolean;
    isDelete: boolean;
    verified: boolean;
    otp?: string;
    otpExpires?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    role: Schema.Types.ObjectId;
    status: string;
    vendorCompanyInfo: VendorCompanyInfo;
    contactInfo: ContactInfo;
    businessAddress: BusinessAddress;
    vendorBusinessDetails: VendorBusinessDetails;
    vendorComplianceInfo: VendorComplianceInfo;
    performance: number; // e.g., a score from 1 to 10
    paymentHistory: PaymentDetails[];
    bankingInfo: BankingInfo[];
    activityStatus: string;
    settings: string;
}

const UserSchema = new Schema<UserDocument>({
    _id: { type: Schema.Types.ObjectId, auto: true },
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
        supervisor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
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
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role', default: [] }],
    googleId: { type: String, default: null },
    twoFactorSecret: { type: String },
    isBlocked: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: Schema.Types.ObjectId, ref: 'Role' },
    status: { type: String, enum: ['active', 'block', 'inactive', 'suspended'], default: 'active' },
    vendorBusinessDetails: {
        businessType: { type: String },
        category: { type: String },
        description: { type: String },
        vendorId: { type: String },
        vendorType: { type: Schema.Types.ObjectId, ref: 'VendorType' },
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
        reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
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
},
{
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals are included in JSON output
    toObject: { virtuals: true }, // Ensure virtuals are included in object output
}
);

// Virtual property for fullName
UserSchema.virtual('fullName').get(function (this: UserDocument) {
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
        const userCount = await model('User').countDocuments();
        const roleName = userCount === 0 ? 'admin' : 'user';
        const role = await RoleDocument.findOne({ name: roleName });
        if (role) {
            console.log(`${roleName} role is in presave: `, role);
            this.roles.push(role._id as Schema.Types.ObjectId);
        }
    }
    next();
});

export default model<UserDocument>('User', UserSchema);