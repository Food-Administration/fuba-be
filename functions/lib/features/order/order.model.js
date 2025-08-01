"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Pending"] = "pending";
    OrderStatus["Accepted"] = "accepted";
    OrderStatus["Preparing"] = "preparing";
    OrderStatus["Ready"] = "ready";
    OrderStatus["Delivered"] = "delivered";
    OrderStatus["Cancelled"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
const OrderSchema = new mongoose_1.Schema({
    consumer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            foodItem: { type: mongoose_1.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
            quantity: { type: Number, required: true },
        },
    ],
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Pending,
        required: true // Optional but recommended
    },
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=order.model.js.map