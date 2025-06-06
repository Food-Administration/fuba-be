"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const property_model_1 = __importDefault(require("./property.model")); // Adjust path if needed
const mongoose_1 = require("mongoose");
class PropertyService {
    /**
     * Creates a new property.
     * @param data - Partial data for the property.
     * @returns The created property.
     */
    async create(data) {
        const property = new property_model_1.default(data);
        return await property.save();
    }
    /**
     * Retrieves properties based on the provided filter with pagination.
     * @param filter - Mongoose filter query.
     * @param options - Pagination options: page (1-based) and limit.
     * @returns An object containing properties, total count, page, and limit.
     */
    async get(filter = {}, options = {}) {
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, options.limit || 10);
        const skip = (page - 1) * limit;
        const [properties, total] = await Promise.all([
            property_model_1.default.find(filter).skip(skip).limit(limit),
            property_model_1.default.countDocuments(filter)
        ]);
        return { properties, total, page, limit };
    }
    /**
     * Retrieves a property by its ID.
     * @param id - The ID of the property.
     * @returns The property if found, otherwise null.
     */
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await property_model_1.default.findById(id);
    }
    /**
     * Updates a property by its ID.
     * @param id - The ID of the property to update.
     * @param data - Partial data to update the property with.
     * @returns The updated property if found, otherwise null.
     */
    async update(id, data) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await property_model_1.default.findByIdAndUpdate(id, data, { new: true });
    }
    /**
     * Deletes a property by its ID.
     * @param id - The ID of the property to delete.
     * @returns The deleted property if found, otherwise null.
     */
    async delete(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await property_model_1.default.findByIdAndDelete(id);
    }
}
exports.PropertyService = PropertyService;
exports.default = new PropertyService();
//# sourceMappingURL=property.service.js.map