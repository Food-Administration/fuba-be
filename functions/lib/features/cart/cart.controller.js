"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const cart_service_1 = __importDefault(require("./cart.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class CartController {
    constructor() {
        this.getCart = (0, asyncHandler_1.default)(async (req, res) => {
            const cart = await cart_service_1.default.getByConsumer(req.params.consumerId);
            if (!cart) {
                res.status(200).json({
                    success: true,
                    data: { items: [] },
                    message: 'Cart is empty'
                });
                return;
            }
            res.status(200).json({ success: true, data: cart });
        });
        this.addItem = (0, asyncHandler_1.default)(async (req, res) => {
            const { foodItemId, quantity } = req.body;
            const cart = await cart_service_1.default.addItem(req.params.consumerId, foodItemId, quantity);
            res.status(200).json({
                success: true,
                data: cart,
                message: 'Item added to cart'
            });
        });
        this.updateItem = (0, asyncHandler_1.default)(async (req, res) => {
            const { quantity } = req.body;
            const cart = await cart_service_1.default.updateItemQuantity(req.params.consumerId, req.params.foodItemId, quantity);
            if (!cart) {
                res.status(404).json({
                    success: false,
                    error: 'Item not found in cart'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: cart,
                message: 'Cart item updated'
            });
        });
        this.removeItem = (0, asyncHandler_1.default)(async (req, res) => {
            const cart = await cart_service_1.default.removeItem(req.params.consumerId, req.params.foodItemId);
            res.status(200).json({
                success: true,
                data: cart,
                message: 'Item removed from cart'
            });
        });
        this.clearCart = (0, asyncHandler_1.default)(async (req, res) => {
            const cart = await cart_service_1.default.clearCart(req.params.consumerId);
            res.status(200).json({
                success: true,
                data: cart,
                message: 'Cart cleared'
            });
        });
    }
}
exports.CartController = CartController;
exports.default = new CartController();
//# sourceMappingURL=cart.controller.js.map