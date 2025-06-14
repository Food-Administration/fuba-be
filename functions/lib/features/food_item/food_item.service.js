"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodItemService = void 0;
const food_item_model_1 = __importDefault(require("./food_item.model")); // Adjust path if needed
const mongoose_1 = require("mongoose");
class FoodItemService {
    /**
     * Creates a new food item.
     * @param data - Partial data for the food item.
     * @returns The created food item.
     */
    async create(data) {
        const foodItem = new food_item_model_1.default(data);
        return await foodItem.save();
    }
    /**
     * Retrieves food items based on the provided filter and optional search, with pagination.
     * @param filter - Mongoose filter query.
     * @param options - Pagination options: page (1-based), limit, and search string.
     * @returns An object containing food items, total count, page and limit.
     */
    async get(filter = {}, options = {}) {
        const offset = Math.max(0, options.offset || 0);
        const limit = Math.max(1, options.limit || 10);
        const [foodItems, total] = await Promise.all([
            food_item_model_1.default.find(filter).skip(offset).limit(limit),
            food_item_model_1.default.countDocuments(filter),
        ]);
        return { foodItems, total, offset, limit };
    }
    /**
     * Retrieves a food item by its ID.
     * @param id - The ID of the food item.
     * @returns The food item if found, otherwise null.
     */
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await food_item_model_1.default.findById(id);
    }
    /**
     * Updates a food item by its ID.
     * @param id - The ID of the food item to update.
     * @param data - Partial data to update the food item with.
     * @returns The updated food item if found, otherwise null.
     */
    async update(id, data) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await food_item_model_1.default.findByIdAndUpdate(id, data, { new: true });
    }
    /**
     * Deletes a food item by its ID.
     * @param id - The ID of the food item to delete.
     * @returns The deleted food item if found, otherwise null.
     */
    async delete(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await food_item_model_1.default.findByIdAndDelete(id);
    }
    /**
     * Retrieves food items by vendor ID with pagination.
     * @param vendorId - The ID of the vendor.
     * @param options - Pagination options.
     * @returns Filtered food items with pagination data.
     */
    async getByVendor(vendorId, options = {}) {
        if (!mongoose_1.Types.ObjectId.isValid(vendorId)) {
            return { foodItems: [], total: 0, offset: 1, limit: options.limit || 10 };
        }
        return this.get({ vendor: new mongoose_1.Types.ObjectId(vendorId) }, options);
    }
}
exports.FoodItemService = FoodItemService;
exports.default = new FoodItemService();
//# sourceMappingURL=food_item.service.js.map