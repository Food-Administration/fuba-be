import { Schema, model, Document, Types } from 'mongoose';

export interface TransportationDetails {
  _id: Types.ObjectId;
  budgetItemId: Types.ObjectId;
  transportName: string;
  transportType: string;
  locationFrom: string;
  locationTo: string;
  departureTime: Date;
  arrivalTime?: Date;
  vendorId: Types.ObjectId;
  price: number;
  description?: string;
  status: string;
}

export interface AccomodationDetails {
  _id: Types.ObjectId;
  budgetItemId: Types.ObjectId;
  hotelName: string;
  roomType: string;
  location: string;
  checkInTime: Date;
  checkOutTime: Date;
  nights: Number,
  pricePerNight: Number,
  vendorId: Types.ObjectId;
  price: number;
  status: string;
}

export interface AdditionalExpenses {
  _id: Types.ObjectId;
  budgetItemId: Types.ObjectId;
  expenseName: string;
  amount: number;
  status: string;
}

export interface AlignedBudgetAmount {
  date: Date;
  amount: number;
  personnel: string;
  comment: string;
}

// Interface for the logistics document
export interface LogisticsDocument extends Document {
  travelPurpose: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  status: string;
  createdBy: Types.ObjectId;
  traveler: Types.ObjectId;
  category: string;
  budgetId: Types.ObjectId;
  flowId: Types.ObjectId;
  approvals: Approval[];
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  transportationDetails: TransportationDetails[];
  accommodationDetails: AccomodationDetails[];
  additionalExpenses: AdditionalExpenses[];
  alignedAmount: AlignedBudgetAmount[];
  accommodationTotal: number;
  transportationTotal: number;
  expensesTotal: number;
  grandTotal: number;
  budgetAmount: number;
}

// Approval interface
export interface Approval {
  userId: Types.ObjectId;
  fullName: string;
  date: Date;
}

const LogisticsSchema = new Schema<LogisticsDocument>(
  {
    travelPurpose: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'processed', 'rejected', 'completed'],
      default: 'pending',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    traveler: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    budgetId: {
      type: Schema.Types.ObjectId,
      ref: 'Budget',
    },
    flowId: {
      type: Schema.Types.ObjectId,
      ref: 'RequestFlow',
      required: true,
    },
    approvals: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: { type: String, required: true, trim: true },
        date: { type: Date, required: true, default: Date.now },
      },
    ],
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    transportationDetails: [
      {
        id: { type: String },
        budgetItemId: { type: Schema.Types.ObjectId },
        transportName: { type: String, trim: true },
        transportType: { type: String, trim: true },
        locationFrom: { type: String, trim: true },
        locationTo: { type: String, trim: true },
        departureTime: { type: Date },
        arrivalTime: { type: Date },
        vendorId: { type: Schema.Types.ObjectId, ref: 'User' },
        price: { type: Number },
        description: { type: String, trim: true },
        status: {
          type: String,
          enum: [
            'scheduled',
            'booked',
            'boarded',
            'in-transit',
            'completed',
            'delayed',
            'cancelled',
          ],
          default: 'scheduled',
        },
        statusHistory: [
          {
            status: { type: String, trim: true },
            date: { type: Date, default: Date.now },
          },
        ], // Added statusHistory to track status changes
      },
    ],
    accommodationDetails: [
      {
        id: { type: String },
        budgetItemId: { type: Schema.Types.ObjectId },
        hotelName: { type: String, required: true, trim: true },
        roomType: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        checkInTime: { type: Date, required: true },
        checkOutTime: { type: Date, required: true },
        nights: { type: Number, required: true },
        pricePerNight: { type: Number, required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        price: { type: Number, required: true },
        status: {
          type: String,
          enum: [
            'pending',
            'confirmed',
            'checked-in',
            'checked-out',
            'cancelled',
          ],
          default: 'pending',
        },
        statusHistory: [
          {
            status: { type: String, trim: true },
            date: { type: Date, default: Date.now },
          },
        ], // Added statusHistory to track status changes
      },
    ],
    additionalExpenses: [
      {
        id: { type: String },
        budgetItemId: { type: Schema.Types.ObjectId },
        expenseName: { type: String, required: true, trim: true },
        amount: { type: Number, required: true },
        status: {
          type: String,
          enum: ['pending', 'paid', 'cancelled'],
          default: 'pending',
        },
        statusHistory: [
          {
            status: { type: String, trim: true },
            date: { type: Date, default: Date.now },
          },
        ], // Added statusHistory to track status changes
      },
    ],
    alignedAmount: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        personnel: { type: String, required: true, trim: true },
        comment: { type: String, trim: true },
      },
    ],
    accommodationTotal: { type: Number, default: 0 },
    transportationTotal: { type: Number, default: 0 },
    expensesTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    budgetAmount: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default model<LogisticsDocument>('Logistics', LogisticsSchema);
