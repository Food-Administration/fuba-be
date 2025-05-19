"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProcurementSchema = new mongoose_1.Schema({
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
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'VendorInventory',
            },
            vendor: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            },
            budgetItem: {
                type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'RequestFlow',
        required: true,
    },
    rejectionReason: {
        type: String,
        trim: true,
        default: '',
    },
    budgetId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Budget',
    },
    approvals: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            fullName: { type: String, required: true, trim: true },
            date: { type: Date, required: true, default: Date.now },
        },
    ],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lastUpdatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: { createdAt: 'dateCreated', updatedAt: 'lastUpdated' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.default = (0, mongoose_1.model)('Procurement', ProcurementSchema);
//# sourceMappingURL=procurement.model.js.map