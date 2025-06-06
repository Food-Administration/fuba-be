"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const blog_model_1 = __importDefault(require("./blog.model")); // Adjust path if needed
const mongoose_1 = require("mongoose");
class BlogService {
    /**
     * Creates a new blog.
     * @param data - Partial data for the blog.
     * @returns The created blog.
     */
    async create(data) {
        const blog = new blog_model_1.default(data);
        return await blog.save();
    }
    /**
     * Retrieves blogs based on the provided filter with pagination.
     * @param filter - Mongoose filter query.
     * @param options - Pagination options: page (1-based) and limit.
     * @returns An object containing blogs, total count, page and limit.
     */
    async get(filter = {}, options = {}) {
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, options.limit || 10);
        const skip = (page - 1) * limit;
        const [blogs, total] = await Promise.all([
            blog_model_1.default.find(filter).skip(skip).limit(limit),
            blog_model_1.default.countDocuments(filter)
        ]);
        return { blogs, total, page, limit };
    }
    /**
     * Retrieves a blog by its ID.
     * @param id - The ID of the blog.
     * @returns The blog if found, otherwise null.
     */
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await blog_model_1.default.findById(id);
    }
    /**
     * Updates a blog by its ID.
     * @param id - The ID of the blog to update.
     * @param data - Partial data to update the blog with.
     * @returns The updated blog if found, otherwise null.
     */
    async update(id, data) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await blog_model_1.default.findByIdAndUpdate(id, data, { new: true });
    }
    /**
     * Deletes a blog by its ID.
     * @param id - The ID of the blog to delete.
     * @returns The deleted blog if found, otherwise null.
     */
    async delete(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return await blog_model_1.default.findByIdAndDelete(id);
    }
}
exports.BlogService = BlogService;
exports.default = new BlogService();
//# sourceMappingURL=blog.service.js.map