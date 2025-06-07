import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodItem extends Document {
    name: string;
    description: String;
    price: number;
    vendor: Schema.Types.ObjectId;
    image?: string;
    category: string;
    available: Boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FoodItemSchema = new Schema<IFoodItem>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String },
  category: { type: String },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);