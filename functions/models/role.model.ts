import { Schema, model, Document } from 'mongoose';

export interface RoleDocument extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    permissions: Schema.Types.ObjectId[];
}

const RoleSchema = new Schema<RoleDocument>({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
});

export default model<RoleDocument>('Role', RoleSchema);