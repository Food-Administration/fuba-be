"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodPrepService = void 0;
const food_prep_model_1 = __importDefault(require("./food_prep.model"));
const mongoose_1 = require("mongoose");
class FoodPrepService {
    /**
     * Creates a new food preparation entry
     * @param data - Partial food prep data
     * @returns The created food prep entry
     */
    async create(data) {
        const foodPrep = new food_prep_model_1.default(data);
        return await foodPrep.save();
    }
    /**
     * Retrieves food prep entries with pagination
     * @param filter - Mongoose filter query
     * @param options - Pagination options
     * @returns Food prep entries with pagination data
     */
    async get(filter = {}, options = {}) {
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, options.limit || 10);
        const skip = (page - 1) * limit;
        const [foodPreps, total] = await Promise.all([
            food_prep_model_1.default.find(filter)
                .populate('consumer', 'name email')
                .populate('chefChoice', 'name email')
                .populate('meals.choiceOfMeal', 'name category description price image')
                .skip(skip)
                .limit(limit),
            food_prep_model_1.default.countDocuments(filter)
        ]);
        return { foodPreps, total, page, limit };
    }
    /**
     * Gets food prep entry by ID
     * @param id - Food prep ID
     * @returns The food prep entry if found
     */
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await food_prep_model_1.default.findById(id)
            .populate('consumer', 'name email')
            .populate('chefChoice', 'name email')
            .populate('meals.choiceOfMeal', 'name category description price image');
    }
    /**
     * Updates food prep entry
     * @param id - Food prep ID
     * @param data - Update data
     * @returns Updated food prep entry
     */
    async update(id, data) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await food_prep_model_1.default.findByIdAndUpdate(id, data, { new: true }).populate('consumer', 'name email').populate('chefChoice', 'name email').populate('meals.choiceOfMeal', 'name category description price image');
    }
    /**
     * Gets food prep entries by consumer ID
     * @param consumerId - Consumer user ID
     * @param options - Pagination options
     * @returns Consumer's food prep entries
     */
    async getByConsumer(consumerId, options = {}) {
        if (!mongoose_1.Types.ObjectId.isValid(consumerId)) {
            return { foodPreps: [], total: 0, page: 1, limit: options.limit || 10 };
        }
        return this.get({ consumer: new mongoose_1.Types.ObjectId(consumerId) }, options);
    }
    /**
     * Gets food prep entries by status
     * @param status - Food prep status
     * @param options - Pagination options
     * @returns Food prep entries with given status
     */
    async getByStatus(status, options = {}) {
        return this.get({ status }, options);
    }
    /**
     * Gets food prep entries by mode
     * @param mode - Delivery mode (delivery or pickup)
     * @param options - Pagination options
     * @returns Food prep entries with given mode
     */
    async getByMode(mode, options = {}) {
        return this.get({ mode }, options);
    }
    /**
     * Updates food prep status
     * @param id - Food prep ID
     * @param status - New status
     * @returns Updated food prep entry
     */
    async updateStatus(id, status) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await food_prep_model_1.default.findByIdAndUpdate(id, { status }, { new: true }).populate('consumer', 'name email').populate('chefChoice', 'name email').populate('meals.choiceOfMeal', 'name category description price image');
    }
    /**
     * Deletes a food prep entry
     * @param id - Food prep ID
     * @returns Deleted food prep entry
     */
    async delete(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await food_prep_model_1.default.findByIdAndDelete(id);
    }
}
exports.FoodPrepService = FoodPrepService;
exports.default = new FoodPrepService();
//# sourceMappingURL=food_prep.service.js.map