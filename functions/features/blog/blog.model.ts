import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBlog extends Document {
    topic: string;
    written_by: Types.ObjectId; // Reference to User
    date_created: Date;
    banner: string;
    category: string;
    description: string;
}

const BlogSchema = new Schema<IBlog>({
    topic: { type: String, required: true },
    written_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date_created: { type: Date, default: Date.now },
    banner: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
});

export default mongoose.model<IBlog>('Blog', BlogSchema);