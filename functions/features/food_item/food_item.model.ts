import mongoose, { Schema, Document } from "mongoose";

export interface IFoodItem extends Document {
  name: string;
  description: string;
  price: {
    premium: number;
    executive: number;
    regular: number;
  };
  vendor: Schema.Types.ObjectId;
  image?: string;
  category: string[]; // list of categories
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FoodItemSchema = new Schema<IFoodItem>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    premium: { type: Number, required: true },
    executive: { type: Number, required: true },
    regular: { type: Number, required: true },
  },
  // Vendor is optional to support Home Chef items not tied to a specific vendor
  vendor: { type: Schema.Types.ObjectId, ref: "User", required: false },
  image: { type: String },
  category: { type: [String], default: [] },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFoodItem>("FoodItem", FoodItemSchema);
