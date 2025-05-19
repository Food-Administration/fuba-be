import { Schema, model, Document, Types } from 'mongoose';

export interface ReviewDocument extends Document {
    vendor: Types.ObjectId; // Reference to Vendor (User)
    user: Types.ObjectId; // Reference to User (reviewer)
    rating: number; // 1-5 stars
    comment?: string; // Optional comment
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
    {
        vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Vendor is a User
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reviewer is a User
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
    },
    { timestamps: true }
);

export default model<ReviewDocument>('Review', ReviewSchema);