import { Schema, model, Document, Types } from 'mongoose';

export interface Approval {
    userId: Types.ObjectId; // Reference to User
    dept: string;
    rank: number;
}

export interface RequestFlowDocument extends Document {
    workflowItem: string;
    displayName: string;
    // requiresMultipleApprovals: boolean;
    approvals: Approval[];
    createdAt: Date;
    updatedAt: Date;
}

const RequestFlowSchema = new Schema<RequestFlowDocument>(
    {
        workflowItem: { type: String, required: true, unique: true },
        displayName: { type: String, required: true },
        approvals: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                dept: { type: String},
                rank: { type: String, required: true },
            },
        ],
        // requiresMultipleApprovals: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default model<RequestFlowDocument>('RequestFlow', RequestFlowSchema);