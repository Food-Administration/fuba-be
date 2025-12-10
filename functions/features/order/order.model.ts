import mongoose, { Schema, Document } from 'mongoose';

export enum OrderStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Preparing = 'preparing',
  Ready = 'ready',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export interface IOrder extends Document {
  consumer: Schema.Types.ObjectId; // Reference to User (consumer)
  vendor: Schema.Types.ObjectId; // Reference to User (vendor)
  items: Array<{
    foodItem: Schema.Types.ObjectId; // Reference to FoodItem
    quantity: number;
  }>;
  totalPrice: number;
  status: OrderStatus;
  mode: 'delivery' | 'pickup';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  consumer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      foodItem: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.Pending,
    required: true // Optional but recommended
  },
  mode: { type: String, enum: ['delivery', 'pickup'], required: true },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrder>('Order', OrderSchema);