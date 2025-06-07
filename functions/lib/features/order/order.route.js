"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = __importDefault(require("./order.controller"));
const router = (0, express_1.Router)();
// Create an order
router.post('/', order_controller_1.default.create);
// Get all orders (with optional query)
router.get('/', order_controller_1.default.get);
// Get order by ID
router.get('/:id', order_controller_1.default.getById);
// Update order status
router.patch('/:id/status', order_controller_1.default.updateStatus);
// Get orders by consumer
router.get('/consumer/:consumerId', order_controller_1.default.getByConsumer);
// Get orders by vendor
router.get('/vendor/:vendorId', order_controller_1.default.getByVendor);
exports.default = router;
//# sourceMappingURL=order.route.js.map