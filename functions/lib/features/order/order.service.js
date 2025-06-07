"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const order_model_1 = __importDefault(require("./order.model"));
const mongoose_1 = require("mongoose");
class OrderService {
    /**
     * Creates a new order
     * @param data - Partial order data
     * @returns The created order
     */
    async create(data) {
        const order = new order_model_1.default(data);
        return await order.save();
    }
    /**
     * Retrieves orders with pagination
     * @param filter - Mongoose filter query
     * @param options - Pagination options
     * @returns Orders with pagination data
     */
    async get(filter = {}, options = {}) {
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, options.limit || 10);
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            order_model_1.default.find(filter)
                .populate('consumer', 'name email')
                .populate('vendor', 'name email')
                .populate('items.foodItem', 'name price')
                .skip(skip)
                .limit(limit),
            order_model_1.default.countDocuments(filter)
        ]);
        return { orders, total, page, limit };
    }
    /**
     * Gets order by ID
     * @param id - Order ID
     * @returns The order if found
     */
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await order_model_1.default.findById(id)
            .populate('consumer', 'name email')
            .populate('vendor', 'name email')
            .populate('items.foodItem', 'name price');
    }
    /**
     * Updates order status
     * @param id - Order ID
     * @param status - New status
     * @returns Updated order
     */
    async updateStatus(id, status) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await order_model_1.default.findByIdAndUpdate(id, { status }, { new: true }).populate('consumer vendor items.foodItem');
    }
    /**
     * Gets orders by consumer ID
     * @param consumerId - Consumer user ID
     * @param options - Pagination options
     * @returns Consumer's orders
     */
    async getByConsumer(consumerId, options = {}) {
        if (!mongoose_1.Types.ObjectId.isValid(consumerId)) {
            return { orders: [], total: 0, page: 1, limit: options.limit || 10 };
        }
        return this.get({ consumer: new mongoose_1.Types.ObjectId(consumerId) }, options);
    }
    /**
     * Gets orders by vendor ID
     * @param vendorId - Vendor user ID
     * @param options - Pagination options
     * @returns Vendor's orders
     */
    async getByVendor(vendorId, options = {}) {
        if (!mongoose_1.Types.ObjectId.isValid(vendorId)) {
            return { orders: [], total: 0, page: 1, limit: options.limit || 10 };
        }
        return this.get({ vendor: new mongoose_1.Types.ObjectId(vendorId) }, options);
    }
}
exports.OrderService = OrderService;
exports.default = new OrderService();
//# sourceMappingURL=order.service.js.map