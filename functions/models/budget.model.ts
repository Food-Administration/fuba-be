import { Schema, model, Document, Types } from 'mongoose';

export interface AlignedAmount {
    date: Date;
    amount: number;
    personnel: string;
    comment: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    approvals: { userId: Types.ObjectId; fullName: string; date: Date }[];
    budgetItemId: Types.ObjectId;
}

export interface BudgetItem {
    _id?: Types.ObjectId;
    itemName: string;
    amount: number;
    budgetedItemAmount: number;
}

export interface BudgetCategory {
    title: string;
    amount: number;
    budgetedAmount: number;
    alignedAmounts: AlignedAmount[];
    budgetItems: BudgetItem[];
}

export interface Approval {
    userId: Types.ObjectId;
    fullName: string;
    date: Date;
}

export interface BudgetDocument extends Document {
    title: string;
    startPeriod: Date;
    endPeriod: Date;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    approvals: Approval[];
    flowId: Types.ObjectId;
    rejectionReason?: string;
    categories: BudgetCategory[];
    createdBy: Types.ObjectId;
    lastUpdatedBy: Types.ObjectId;
    approvedById?: Types.ObjectId;
}

const BudgetSchema = new Schema<BudgetDocument>({
    title: { 
        type: String, 
        required: true,
        trim: true 
    },
    startPeriod: { 
        type: Date, 
        required: true 
    },
    endPeriod: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(this: BudgetDocument, value: Date) {
                return value > this.startPeriod;
            },
            message: 'End period must be after start period'
        }
    },
    approvals: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: { type: String, required: true, trim: true },
        date: { type: Date, required: true, default: Date.now }
    }],
    flowId: { 
        type: Schema.Types.ObjectId, 
        ref: 'RequestFlow', 
        required: true 
    },
    status: { 
        type: String, 
        required: true,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected', 'completed'],
        trim: true
    },
    rejectionReason: { 
        type: String, 
        trim: true,
        default: ""
    },
    categories: [{
        title: { 
            type: String, 
            required: true,
            trim: true 
        },
        amount: { 
            type: Number,
            required: true,
            min: 0 
        },
        budgetedAmount: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        alignedAmounts: [{
            date: { 
                type: Date, 
                required: true,
                default: Date.now 
            },
            amount: { 
                type: Number, 
                required: true,
                min: 0 
            },
            personnel: { 
                type: String, 
                required: true,
                trim: true 
            },
            comment: { 
                type: String, 
                trim: true 
            },
            status: {
                type: String,
                required: true,
                enum: ['pending', 'approved', 'rejected', 'completed'],
                default: 'pending',
            },
            approvals: [
                {
                    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                    fullName: { type: String, required: true, trim: true },
                    date: { type: Date, required: true, default: Date.now },
                },
            ],
            budgetItemId: { 
                type: Schema.Types.ObjectId, 
                required: true
            }
        }],
        budgetItems: [{
            _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
            itemName: { 
                type: String, 
                required: true,
                trim: true 
            },
            budgetedItemAmount: { 
                type: Number,
                // required: true,
                min: 0 
            },
            amount: { 
                type: Number,
                required: true,
                min: 0 
            }
        }],
    }],
    createdBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    lastUpdatedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    approvedById: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, {
    timestamps: { 
        createdAt: 'dateCreated', 
        updatedAt: 'lastUpdated' 
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save hook to calculate category amounts
BudgetSchema.pre('save', function (next) {
    this.categories.forEach((category) => {
        category.amount = category.budgetItems.reduce((sum, item) => sum + item.amount, 0);
        category.budgetedAmount = category.budgetItems.reduce((sum, item) => sum + item.budgetedItemAmount, 0);
    });
    next();
});

// Validation for budgetItems.amount
BudgetSchema.path('categories.budgetItems.amount').validate(function (value: number) {
    return value >= 0;
}, 'Budget item amount cannot be negative');

// // Validation for alignedAmounts.budgetItemId
// BudgetSchema.path('categories.alignedAmounts.budgetItemId').validate(async function (value: Types.ObjectId) {
//     const category = this.$parent();
//     return ((category as unknown) as BudgetCategory).budgetItems.some((item: BudgetItem) => item._id?.equals(value));
// }, 'Invalid budgetItemId in alignedAmounts');

BudgetSchema.methods.reduceBudgetItemAmount = function (categoryIndex: number, budgetItemId: Types.ObjectId, expense: number) {
    const category = this.categories[categoryIndex];
    const budgetItem = category.budgetItems.find((item: BudgetItem) => item._id?.equals(budgetItemId));
    if (budgetItem) {
        budgetItem.amount = Math.max(0, budgetItem.amount - expense); // Prevent negative amounts
        category.amount = category.budgetItems.reduce((sum: number, item: BudgetItem) => sum + item.amount, 0);
        this.markModified('categories');
    }
};

// Method to update budgeted item amount
BudgetSchema.methods.updateBudgetedItemAmount = function (categoryIndex: number, budgetItemId: Types.ObjectId, alignedAmount: number) {
    const category = this.categories[categoryIndex];
    const budgetItem = category.budgetItems.find((item: BudgetItem) => item._id?.equals(budgetItemId));
    if (budgetItem) {
        budgetItem.budgetedItemAmount += alignedAmount;
        category.budgetedAmount = category.budgetItems.reduce((sum: number, item: BudgetItem) => sum + item.budgetedItemAmount, 0);
        this.markModified('categories'); // Ensure Mongoose detects the change
    }
};

BudgetSchema.virtual('totalValue').get(function(this: BudgetDocument) {
    if (!Array.isArray(this.categories)) {
        return 0;
    }
    return this.categories.reduce((total, category) => total + category.budgetedAmount, 0);
});

// Post-update hook to recalculate category amount after direct updates
BudgetSchema.post('findOneAndUpdate', async function (doc: BudgetDocument) {
    if (doc) {
        doc.categories.forEach((category) => {
            category.amount = category.budgetItems.reduce((sum, item) => sum + item.amount, 0);
        });
        await doc.save(); // Save the updated document
    }
});

export default model<BudgetDocument>('Budget', BudgetSchema);