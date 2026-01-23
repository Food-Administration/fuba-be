import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFile extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalName: string;
  url: string;
  publicId: string;
  mimetype: string;
  size: number;
  resourceType: "image" | "raw" | "video" | "auto";
  folder: string;
  uploadedBy?: Types.ObjectId;
  associatedModel?: string; // e.g., "Restaurant", "FoodItem", "User"
  associatedId?: Types.ObjectId; // ID of the associated document
  metadata?: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "raw", "video", "auto"],
      default: "auto",
    },
    folder: {
      type: String,
      default: "uploads",
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    associatedModel: {
      type: String,
    },
    associatedId: {
      type: Schema.Types.ObjectId,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
FileSchema.index({ uploadedBy: 1 });
FileSchema.index({ associatedModel: 1, associatedId: 1 });
FileSchema.index({ publicId: 1 });
FileSchema.index({ folder: 1 });

export default mongoose.model<IFile>("File", FileSchema);
