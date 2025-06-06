import { Schema, model, Document, Types } from 'mongoose';

export interface CreateUserDto {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface UserDocument extends Document {
    _id: Types.ObjectId; // Updated to use Types.ObjectId
    email: string;
    password: string;
    username?: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    otp_expires?: Date;
    otp?: string;
    verified: boolean;
    profile_picture: string;
    googleId: string | null;
    twoFactorSecret?: string;
    reset_password_token?: string;
    reset_password_expires?: Date;
    settings: string;
}

const UserSchema = new Schema<UserDocument>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    username: { type: String },
    phone_number: { type: String },
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
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

// Virtual property for fullName
UserSchema.virtual('full_name').get(function (this: UserDocument) {
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

export default model<UserDocument>('User', UserSchema);