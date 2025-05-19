"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BudgetSchema = new mongoose_1.Schema({
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
            validator: function (value) {
                return value > this.startPeriod;
            },
            message: 'End period must be after start period'
        }
    },
    approvals: [{
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            fullName: { type: String, required: true, trim: true },
            date: { type: Date, required: true, default: Date.now }
        }],
    flowId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
                            fullName: { type: String, required: true, trim: true },
                            date: { type: Date, required: true, default: Date.now },
                        },
                    ],
                    budgetItemId: {
                        type: mongoose_1.Schema.Types.ObjectId,
                        required: true
                    }
                }],
            budgetItems: [{
                    _id: { type: mongoose_1.Schema.Types.ObjectId, default: () => new mongoose_1.Types.ObjectId() },
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedById: {
        type: mongoose_1.Schema.Types.ObjectId,
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
BudgetSchema.path('categories.budgetItems.amount').validate(function (value) {
    return value >= 0;
}, 'Budget item amount cannot be negative');
// // Validation for alignedAmounts.budgetItemId
// BudgetSchema.path('categories.alignedAmounts.budgetItemId').validate(async function (value: Types.ObjectId) {
//     const category = this.$parent();
//     return ((category as unknown) as BudgetCategory).budgetItems.some((item: BudgetItem) => item._id?.equals(value));
// }, 'Invalid budgetItemId in alignedAmounts');
BudgetSchema.methods.reduceBudgetItemAmount = function (categoryIndex, budgetItemId, expense) {
    const category = this.categories[categoryIndex];
    const budgetItem = category.budgetItems.find((item) => item._id?.equals(budgetItemId));
    if (budgetItem) {
        budgetItem.amount = Math.max(0, budgetItem.amount - expense); // Prevent negative amounts
        category.amount = category.budgetItems.reduce((sum, item) => sum + item.amount, 0);
        this.markModified('categories');
    }
};
// Method to update budgeted item amount
BudgetSchema.methods.updateBudgetedItemAmount = function (categoryIndex, budgetItemId, alignedAmount) {
    const category = this.categories[categoryIndex];
    const budgetItem = category.budgetItems.find((item) => item._id?.equals(budgetItemId));
    if (budgetItem) {
        budgetItem.budgetedItemAmount += alignedAmount;
        category.budgetedAmount = category.budgetItems.reduce((sum, item) => sum + item.budgetedItemAmount, 0);
        this.markModified('categories'); // Ensure Mongoose detects the change
    }
};
BudgetSchema.virtual('totalValue').get(function () {
    if (!Array.isArray(this.categories)) {
        return 0;
    }
    return this.categories.reduce((total, category) => total + category.budgetedAmount, 0);
});
// Post-update hook to recalculate category amount after direct updates
BudgetSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
        doc.categories.forEach((category) => {
            category.amount = category.budgetItems.reduce((sum, item) => sum + item.amount, 0);
        });
        await doc.save(); // Save the updated document
    }
});
exports.default = (0, mongoose_1.model)('Budget', BudgetSchema);
//# sourceMappingURL=budget.model.js.map