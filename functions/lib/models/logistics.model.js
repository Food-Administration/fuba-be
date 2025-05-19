"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LogisticsSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    traveler: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    budgetId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Budget',
    },
    flowId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'RequestFlow',
        required: true,
    },
    approvals: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
            budgetItemId: { type: mongoose_1.Schema.Types.ObjectId },
            transportName: { type: String, trim: true },
            transportType: { type: String, trim: true },
            locationFrom: { type: String, trim: true },
            locationTo: { type: String, trim: true },
            departureTime: { type: Date },
            arrivalTime: { type: Date },
            vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
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
            budgetItemId: { type: mongoose_1.Schema.Types.ObjectId },
            hotelName: { type: String, required: true, trim: true },
            roomType: { type: String, required: true, trim: true },
            location: { type: String, required: true, trim: true },
            checkInTime: { type: Date, required: true },
            checkOutTime: { type: Date, required: true },
            nights: { type: Number, required: true },
            pricePerNight: { type: Number, required: true },
            vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
            budgetItemId: { type: mongoose_1.Schema.Types.ObjectId },
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
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.default = (0, mongoose_1.model)('Logistics', LogisticsSchema);
//# sourceMappingURL=logistics.model.js.map