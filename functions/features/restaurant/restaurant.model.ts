import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name?: string;
  image?: string;
  coverImage?: string;
  street?: string;
  state?: string;
  isFavorite?: boolean;
  mode: "delivery" | "pickup" | "both";
  items: Schema.Types.ObjectId[];
  openTime?: string; // Format: HH:mm (e.g., "09:00")
  closeTime?: string; // Format: HH:mm (e.g., "22:00")
  ratings: number; // Average rating (0-5)
  mapLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  promo: {
    freeDelivery: boolean;
    discountPercentage?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String },
    image: { type: String },
    coverImage: { type: String },
    street: { type: String },
    state: { type: String },
    mode: {
      type: String,
      enum: ["delivery", "pickup", "both"],
      default: "both",
      required: true,
    },
    isFavorite: { type: Boolean, default: false },
    items: [{ type: Schema.Types.ObjectId, ref: "FoodItem" }],
    openTime: { type: String }, // HH:mm format
    closeTime: { type: String }, // HH:mm format
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    promo: {
      freeDelivery: { type: Boolean, default: false },
      discountPercentage: { type: Number, min: 0, max: 100 },
    },
    mapLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries
RestaurantSchema.index({ mapLocation: "2dsphere" });

// Ensure restaurant names are unique only when provided
RestaurantSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { name: { $type: "string" } } }
);

export default mongoose.model<IRestaurant>(
  "Restaurant",
  RestaurantSchema
);
