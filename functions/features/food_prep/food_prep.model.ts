import mongoose, { Schema, Document } from 'mongoose';

export interface IMealItem {
  choiceOfMeal: Schema.Types.ObjectId; // Reference to FoodItem
  description: string;
  note?: string; // Optional
  quantity: number;
  measurement: 'litre' | 'service';
  amount: number; // Amount to be charged
}

export interface IFoodPrep extends Document {
  consumer: Schema.Types.ObjectId; // Reference to User (consumer)
  chefChoice: Schema.Types.ObjectId; // Reference to Chef (User)
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  mode: 'delivery' | 'pickup';
  deliveryDate: Date;
  address: string;
  phoneNumber: string;
  meals: IMealItem[]; // List of meal items
  createdAt: Date;
  updatedAt: Date;
}

const MealItemSchema = new Schema<IMealItem>(
  {
    choiceOfMeal: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    description: { type: String, required: true },
    note: { type: String },
    quantity: { type: Number, required: true },
    measurement: {
      type: String,
      enum: ['litre', 'service'],
      required: true,
    },
    amount: { type: Number, required: true },
  },
  { _id: true }
);

const FoodPrepSchema = new Schema<IFoodPrep>(
  {
    consumer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chefChoice: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
      required: true,
    },
    mode: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
    },
    deliveryDate: { type: Date, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    meals: [MealItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IFoodPrep>('FoodPrep', FoodPrepSchema);