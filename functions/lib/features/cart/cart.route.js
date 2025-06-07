"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = __importDefault(require("./cart.controller"));
const router = (0, express_1.Router)();
// Get cart by consumer ID
router.get('/:consumerId', cart_controller_1.default.getCart);
// Add item to cart
router.post('/:consumerId/items', cart_controller_1.default.addItem);
// Update item quantity in cart
router.put('/:consumerId/items/:foodItemId', cart_controller_1.default.updateItem);
// Remove item from cart
router.delete('/:consumerId/items/:foodItemId', cart_controller_1.default.removeItem);
// Clear cart
router.delete('/:consumerId/clear', cart_controller_1.default.clearCart);
exports.default = router;
//# sourceMappingURL=cart.route.js.map