"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantService = void 0;
const restaurant_model_1 = __importDefault(require("./restaurant.model"));
const mongoose_1 = require("mongoose");
class RestaurantService {
    /**
     * Creates a new restaurant.
     * @param data - Partial data for the restaurant.
     * @returns The created restaurant.
     */
    async create(data) {
        const restaurant = new restaurant_model_1.default(data);
        return await restaurant.save();
    }
    /**
     * Retrieves restaurants based on the provided filter with pagination.
     * @param filter - Mongoose filter query.
     * @param options - Pagination options: offset and limit.
     * @returns An object containing restaurants, total count, offset and limit.
     */
    async get(filter = {}, options = {}) {
        const offset = Math.max(0, options.offset || 0);
        const limit = Math.max(1, options.limit || 10);
        const [restaurants, total] = await Promise.all([
            restaurant_model_1.default.find(filter)
                .populate("items", "name category description price image")
                .skip(offset)
                .limit(limit),
            restaurant_model_1.default.countDocuments(filter),
        ]);
        return { restaurants, total, offset, limit };
    }
    /**
     * Retrieves a restaurant by its ID.
     * @param id - The ID of the restaurant.
     * @returns The restaurant if found, otherwise null.
     */
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await restaurant_model_1.default.findById(id).populate("items", "name category description price image");
    }
    /**
     * Updates a restaurant by its ID.
     * @param id - The ID of the restaurant to update.
     * @param data - Partial data to update the restaurant with.
     * @returns The updated restaurant if found, otherwise null.
     */
    async update(id, data) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await restaurant_model_1.default.findByIdAndUpdate(id, data, {
            new: true,
        }).populate("items", "name category description price image");
    }
    /**
     * Deletes a restaurant by its ID.
     * @param id - The ID of the restaurant to delete.
     * @returns The deleted restaurant if found, otherwise null.
     */
    async delete(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await restaurant_model_1.default.findByIdAndDelete(id);
    }
    /**
     * Retrieves restaurants by mode (delivery, pickup, or both).
     * @param mode - The mode of service.
     * @param options - Pagination options.
     * @returns Filtered restaurants with pagination data.
     */
    async getByMode(mode, options = {}) {
        return this.get({ mode }, options);
    }
    /**
     * Retrieves restaurants by state.
     * @param state - The state name.
     * @param options - Pagination options.
     * @returns Filtered restaurants with pagination data.
     */
    async getByState(state, options = {}) {
        return this.get({ state }, options);
    }
    /**
     * Retrieves restaurants with active promotions.
     * @param options - Pagination options.
     * @returns Restaurants with active promos with pagination data.
     */
    async getWithPromos(options = {}) {
        return this.get({ "promo.freeDelivery": true }, options);
    }
    /**
     * Adds an item to a restaurant's items list.
     * @param restaurantId - The ID of the restaurant.
     * @param itemId - The ID of the food item to add.
     * @returns The updated restaurant if found, otherwise null.
     */
    async addItem(restaurantId, itemId) {
        if (!mongoose_1.Types.ObjectId.isValid(restaurantId) ||
            !mongoose_1.Types.ObjectId.isValid(itemId))
            return null;
        return await restaurant_model_1.default.findByIdAndUpdate(restaurantId, { $addToSet: { items: new mongoose_1.Types.ObjectId(itemId) } }, { new: true }).populate("items", "name category description price image");
    }
    /**
     * Removes an item from a restaurant's items list.
     * @param restaurantId - The ID of the restaurant.
     * @param itemId - The ID of the food item to remove.
     * @returns The updated restaurant if found, otherwise null.
     */
    async removeItem(restaurantId, itemId) {
        if (!mongoose_1.Types.ObjectId.isValid(restaurantId) ||
            !mongoose_1.Types.ObjectId.isValid(itemId))
            return null;
        return await restaurant_model_1.default.findByIdAndUpdate(restaurantId, { $pull: { items: new mongoose_1.Types.ObjectId(itemId) } }, { new: true }).populate("items", "name category description price image");
    }
    /**
     * Updates the rating of a restaurant.
     * @param id - The ID of the restaurant.
     * @param newRating - The new rating value (0-5).
     * @returns The updated restaurant if found, otherwise null.
     */
    async updateRating(id, newRating) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        if (newRating < 0 || newRating > 5)
            return null;
        return await restaurant_model_1.default.findByIdAndUpdate(id, { ratings: newRating }, { new: true }).populate("items", "name category description price image");
    }
}
exports.RestaurantService = RestaurantService;
exports.default = new RestaurantService();
//# sourceMappingURL=restaurant.service.js.map