import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  image: string;
  property_name: string;
  description: string;
  location: string;
  youtube_link: string;
  property_type: string;
  apartment_type: string;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  payment_type: string;
  price: number;
  deposit: number;
  requirements: string[];
  minimum_stay: number;
  maximum_stay: number;
  availability: boolean;
  viewing_days: string[];
  square_footage: number;
  key_features: string[];
  amenities: string[];
  apartment_plan: string;
  date_posted: Date;
  userId: mongoose.Types.ObjectId;
}

const PropertySchema: Schema = new Schema({
  image: { type: String, required: true },
  property_name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  youtube_link: { type: String },
  property_type: { type: String, required: true },
  apartment_type: { type: String, required: true },
  number_of_bedrooms: { type: Number, required: true },
  number_of_bathrooms: { type: Number, required: true },
  payment_type: { type: String, required: true },
  price: { type: Number, required: true },
  deposit: { type: Number, required: true },
  requirements: { type: [String], default: [] },
  minimum_stay: { type: Number, required: true },
  maximum_stay: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  viewing_days: { type: [String], default: [] },
  square_footage: { type: Number, required: true },
  key_features: { type: [String], default: [] },
  amenities: { type: [String], default: [] },
  apartment_plan: { type: String },
  date_posted: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model<IProperty>('Property', PropertySchema);