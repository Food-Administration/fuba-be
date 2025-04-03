import { Schema, model, Document, Types } from 'mongoose';
// import RoleDocument from './role.model';

export interface CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    employmentDetails?: any;
    // roles?: string[];
}

export interface UserDocument extends Document {
    _id: Types.ObjectId;
    email: string;
    password: string;
    // username?: string;
    phNo: string;
    firstName: string;
    lastName: string;
    fullName: string; // Virtual property
    fileDocuments: string[];
    profilePicture: string;
    // roles: (Schema.Types.ObjectId | typeof RoleDocument)[];
    googleId: string | null;
    twoFactorSecret?: string;
    isBlocked: boolean;
    isDelete: boolean;
    verified: boolean;
    otp?: string;
    otpExpires?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    // role: Schema.Types.ObjectId;
    status: string;
    settings: string;
}

const UserSchema = new Schema<UserDocument>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    // username: { type: String },
    phNo: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    fileDocuments: [{ type: String }],
    profilePicture: { type: String },
    // roles: [{ type: Schema.Types.ObjectId, ref: 'Role', default: [] }],
    googleId: { type: String, default: null },
    twoFactorSecret: { type: String },
    isBlocked: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // role: { type: Schema.Types.ObjectId, ref: 'Role' },
    status: { type: String, enum: ['active', 'block', 'inactive', 'suspended'], default: 'active' },
    settings: { type: String, default: null },
},
{
    timestamps: true,
    // toJSON: { virtuals: true }, // Ensure virtuals are included in JSON output
    toObject: { virtuals: true }, // Ensure virtuals are included in object output
}
);

// Virtual property for fullName
UserSchema.virtual('fullName').get(function (this: UserDocument) { 
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook to assign the default "user" or "admin" role
// UserSchema.pre('save', async function (next) {
//     if (this.isNew && this.roles.length === 0) {
//         const userCount = await model('User').countDocuments();
//         const roleName = userCount === 0 ? 'admin' : 'user';
//         const role = await RoleDocument.findOne({ name: roleName });
//         if (role) {
//             console.log(`${roleName} role is in presave: `, role);
//             this.roles.push(role._id as Schema.Types.ObjectId);
//         }
//     }
//     next();
// });

export default model<UserDocument>('User', UserSchema);