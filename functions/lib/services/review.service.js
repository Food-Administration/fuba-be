"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const review_model_1 = __importDefault(require("../models/review.model"));
// import CustomError from '../utils/customError';
class ReviewService {
    static async createReview(vendor, user, rating, comment) {
        const review = new review_model_1.default({ vendor, user, rating, comment });
        await review.save();
        return review;
    }
    static async getReviewsByVendor(vendorId) {
        return review_model_1.default.find({ vendor: vendorId }).populate('user', 'firstName lastName');
    }
    /**
     * Calculates the average rating for a given vendor.
     *
     * @param vendorId - The ID of the vendor whose average rating is to be calculated.
     * @returns A promise that resolves to the average rating of the vendor. If there are no ratings, it returns 0.
     */
    static async getAverageRating(vendorId) {
        const result = await review_model_1.default.aggregate([
            { $match: { vendor: vendorId } },
            { $group: { _id: null, averageRating: { $avg: '$rating' } } },
        ]);
        return result.length > 0 ? result[0].averageRating : 0;
    }
}
exports.default = ReviewService;
//# sourceMappingURL=review.service.js.map