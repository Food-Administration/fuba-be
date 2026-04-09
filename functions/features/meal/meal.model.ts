import mongoose, { Schema, Document, Types } from "mongoose";

export enum MealServiceType {
  Regular = "regular",
  Premium = "premium",
  Executive = "executive",
}

export enum MealCategory {
  Foreign = "foreign",
  Local = "local",
}

export interface IComboItem {
  name: string;
  quantity: number;
}

export interface IMeal extends Document {
  vendor: Types.ObjectId;
  serviceType: MealServiceType;
  category: MealCategory;
  name: string;
  description: string;
  image?: string;
  price: number;
  priceDescription?: string;
  combo: IComboItem[];
  isInStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ComboItemSchema = new Schema<IComboItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const MealSchema = new Schema<IMeal>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    serviceType: {
      type: String,
      enum: Object.values(MealServiceType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(MealCategory),
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    priceDescription: { type: String },
    combo: { type: [ComboItemSchema], default: [] },
    isInStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MealSchema.index({ vendor: 1, serviceType: 1 });
MealSchema.index({ category: 1 });
MealSchema.index({ name: "text" });

export default mongoose.model<IMeal>("Meal", MealSchema);
