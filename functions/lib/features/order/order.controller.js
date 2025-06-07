"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = __importDefault(require("./order.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class OrderController {
    constructor() {
        this.create = (0, asyncHandler_1.default)(async (req, res) => {
            const order = await order_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                data: order,
                message: 'Order created successfully'
            });
        });
        this.get = (0, asyncHandler_1.default)(async (req, res) => {
            const { orders, total, page, limit } = await order_service_1.default.get(req.query);
            res.status(200).json({
                success: true,
                data: orders,
                meta: { total, page, limit }
            });
        });
        this.getById = (0, asyncHandler_1.default)(async (req, res) => {
            const order = await order_service_1.default.getById(req.params.id);
            if (!order) {
                res.status(404).json({ success: false, error: 'Order not found' });
                return;
            }
            res.status(200).json({ success: true, data: order });
        });
        this.updateStatus = (0, asyncHandler_1.default)(async (req, res) => {
            const order = await order_service_1.default.updateStatus(req.params.id, req.body.status);
            if (!order) {
                res.status(404).json({ success: false, error: 'Order not found' });
                return;
            }
            res.status(200).json({
                success: true,
                data: order,
                message: `Order status updated to ${order.status}`
            });
        });
        this.getByConsumer = (0, asyncHandler_1.default)(async (req, res) => {
            const { orders, total, page, limit } = await order_service_1.default.getByConsumer(req.params.consumerId, req.query);
            res.status(200).json({
                success: true,
                data: orders,
                meta: { total, page, limit }
            });
        });
        this.getByVendor = (0, asyncHandler_1.default)(async (req, res) => {
            const { orders, total, page, limit } = await order_service_1.default.getByVendor(req.params.vendorId, req.query);
            res.status(200).json({
                success: true,
                data: orders,
                meta: { total, page, limit }
            });
        });
    }
}
exports.OrderController = OrderController;
exports.default = new OrderController();
//# sourceMappingURL=order.controller.js.map