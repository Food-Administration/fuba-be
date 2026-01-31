import mongoose, { Schema, Document } from "mongoose";

export enum PromoType {
  FreeDelivery = "freeDelivery",
  Discount = "discount",
  Bogo = "bogo",
  Cashback = "cashback",
  Other = "other",
}

export interface IPromo extends Document {
  image: string; // URL to the promo image
  category: string; // Arbitrary grouping/category label
  restaurant: Schema.Types.ObjectId; // Restaurant offering the promo
  type: PromoType; // Type of promo
  createdAt: Date;
  updatedAt: Date;
}

const PromoSchema = new Schema<IPromo>({
  image: { type: String, required: true },
  category: { type: String, required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  type: { type: String, enum: Object.values(PromoType), required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Helpful indexes for querying promos by restaurant and type
PromoSchema.index({ restaurant: 1 });
PromoSchema.index({ type: 1 });

export default mongoose.model<IPromo>("Promo", PromoSchema);
