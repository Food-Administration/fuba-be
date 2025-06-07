"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const cart_model_1 = __importDefault(require("./cart.model"));
const mongoose_1 = require("mongoose");
class CartService {
    /**
     * Creates a new cart or updates existing one
     * @param data - Cart data
     * @returns The created/updated cart
     */
    async createOrUpdate(data) {
        const cart = await cart_model_1.default.findOneAndUpdate({ consumer: data.consumer }, data, { upsert: true, new: true, setDefaultsOnInsert: true }).populate('items.foodItem', 'name price');
        return cart;
    }
    /**
     * Retrieves cart by consumer ID
     * @param consumerId - Consumer user ID
     * @returns The cart if found
     */
    async getByConsumer(consumerId) {
        if (!mongoose_1.Types.ObjectId.isValid(consumerId))
            return null;
        return await cart_model_1.default.findOne({ consumer: consumerId })
            .populate('consumer', 'name email')
            .populate('items.foodItem', 'name price image');
    }
    /**
     * Adds item to cart
     * @param consumerId - Consumer user ID
     * @param foodItemId - Food item ID to add
     * @param quantity - Quantity to add
     * @returns Updated cart
     */
    async addItem(consumerId, foodItemId, quantity = 1) {
        if (!mongoose_1.Types.ObjectId.isValid(consumerId))
            return null;
        if (!mongoose_1.Types.ObjectId.isValid(foodItemId))
            return null;
        return await cart_model_1.default.findOneAndUpdate({ consumer: consumerId }, {
            $push: {
                items: { foodItem: foodItemId, quantity }
            }
        }, { new: true, upsert: true }).populate('items.foodItem', 'name price');
    }
    /**
     * Updates item quantity in cart
     * @param consumerId - Consumer user ID
     * @param foodItemId - Food item ID to update
     * @param quantity - New quantity
     * @returns Updated cart
     */
    async updateItemQuantity(consumerId, foodItemId, quantity) {
        if (!mongoose_1.Types.ObjectId.isValid(consumerId))
            return null;
        if (!mongoose_1.Types.ObjectId.isValid(foodItemId))
            return null;
        return await cart_model_1.default.findOneAndUpdate({
            consumer: consumerId,
            'items.foodItem': foodItemId
        }, {
            $set: {
                'items.$.quantity': quantity
            }
        }, { new: true }).populate('items.foodItem', 'name price');
    }
    /**
     * Removes item from cart
     * @param consumerId - Consumer user ID
     * @param foodItemId - Food item ID to remove
     * @returns Updated cart
     */
    async removeItem(consumerId, foodItemId) {
        if (!mongoose_1.Types.ObjectId.isValid(consumerId))
            return null;
        if (!mongoose_1.Types.ObjectId.isValid(foodItemId))
            return null;
        return await cart_model_1.default.findOneAndUpdate({ consumer: consumerId }, {
            $pull: {
                items: { foodItem: foodItemId }
            }
        }, { new: true }).populate('items.foodItem', 'name price');
    }
    /**
     * Clears cart
     * @param consumerId - Consumer user ID
     * @returns Empty cart
     */
    async clearCart(consumerId) {
        if (!mongoose_1.Types.ObjectId.isValid(consumerId))
            return null;
        return await cart_model_1.default.findOneAndUpdate({ consumer: consumerId }, { items: [] }, { new: true });
    }
}
exports.CartService = CartService;
exports.default = new CartService();
//# sourceMappingURL=cart.service.js.map