import { Schema, model, Document, Types } from 'mongoose';

// Approval interface (unchanged)
export interface Approval {
  userId: Types.ObjectId;
  fullName: string;
  date: Date;
}

// Interface for an item in the procurement request
export interface ProcurementItem {
  toObject(): unknown;
  itemName: string;
  quantity: number;
  quantityToShip: number;
  unitPrice: number;
  actualAmount: number;
  amount: number;
  vendorInventoryId?: Types.ObjectId;
  vendor: Types.ObjectId;
  budgetItem: Types.ObjectId;
  addedToInventory: boolean;
  status: 'pending' | 'accepted' | 'rejected';
}

// Interface for the procurement document
export interface ProcurementDocument extends Document {
  procurementTitle: string;
  category: string;
  items: ProcurementItem[];
  totalCost: number; // Sum of all item amounts
  actualTotalCost: number;
  purposeOfRequest: string;
  rejectionReason?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'in-progress' | 'partially-completed' | 'completed';
  budgetId: Types.ObjectId;
  flowId: Types.ObjectId;
  approvals: Approval[];
  createdBy: Types.ObjectId;
  lastUpdatedBy: Types.ObjectId;
}

const ProcurementSchema = new Schema<ProcurementDocument>(
  {
    procurementTitle: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    items: [
      {
        itemName: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        quantityToShip: {
          type: Number,
          min: 0, // Changed to allow 0 for cases where no items are shipped yet
          default: 0,
        },
        unitPrice: {
          type: Number,
          min: 0,
          default: 0,
        },
        actualAmount: {
          type: Number,
          min: 0,
          default: 0,
        },
        amount: {
          type: Number,
          min: 0,
          default: 0,
        },
        vendorInventoryId: {
          type: Schema.Types.ObjectId,
          ref: 'VendorInventory',
        },
        vendor: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        budgetItem: {
          type: Schema.Types.ObjectId,
          // ref: 'BudgetItem', // Uncomment if budgetItem references a model
        },
        addedToInventory: { type: Boolean, default: false }, // Add this field
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    totalCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    actualTotalCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    purposeOfRequest: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['high', 'medium', 'low'],
      default: 'low',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'processed', 'completed', 'closed'],
      default: 'pending',
    },
    flowId: {
      type: Schema.Types.ObjectId,
      ref: 'RequestFlow',
      required: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    budgetId: {
      type: Schema.Types.ObjectId,
      ref: 'Budget',
    },
    approvals: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: { type: String, required: true, trim: true },
        date: { type: Date, required: true, default: Date.now },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'dateCreated', updatedAt: 'lastUpdated' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default model<ProcurementDocument>('Procurement', ProcurementSchema);