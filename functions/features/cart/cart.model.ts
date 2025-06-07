import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  consumer: Schema.Types.ObjectId; // Reference to User (consumer)
  items: Array<{
    foodItem: Schema.Types.ObjectId; // Reference to FoodItem
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  consumer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      foodItem: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICart>('Cart', CartSchema);