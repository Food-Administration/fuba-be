import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  image?: string;
  street: string;
  state: string;
  isFavorite?: boolean;
  mode: "delivery" | "pickup" | "both";
  items: Schema.Types.ObjectId[];
  openTime: string; // Format: HH:mm (e.g., "09:00")
  closeTime: string; // Format: HH:mm (e.g., "22:00")
  ratings: number; // Average rating (0-5)
  promo: {
    freeDelivery: boolean;
    discountPercentage?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String },
    street: { type: String, required: true },
    state: { type: String, required: true },
    mode: {
      type: String,
      enum: ["delivery", "pickup", "both"],
      default: "both",
      required: true,
    },
    isFavorite: { type: Boolean, default: false },
    items: [{ type: Schema.Types.ObjectId, ref: "FoodItem" }],
    openTime: { type: String, required: true }, // HH:mm format
    closeTime: { type: String, required: true }, // HH:mm format
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    promo: {
      freeDelivery: { type: Boolean, default: false },
      discountPercentage: { type: Number, min: 0, max: 100 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRestaurant>(
  "Restaurant",
  RestaurantSchema
);
