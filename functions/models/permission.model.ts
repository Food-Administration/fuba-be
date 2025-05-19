import { Schema, model, Document } from 'mongoose';

export interface PermissionDocument extends Document {
    name: string;
    description: string;
}

const PermissionSchema = new Schema<PermissionDocument>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
});

export default model<PermissionDocument>('Permission', PermissionSchema);