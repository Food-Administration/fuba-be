"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const review_service_1 = __importDefault(require("../services/review.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class ReviewController {
}
_a = ReviewController;
ReviewController.createReview = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendor, rating, comment } = req.body;
    if (!req.user) {
        res.status(400).json({ message: 'User not authenticated' });
        return;
    }
    const user = req.user.id; // Assuming user ID is available in the request
    const review = await review_service_1.default.createReview(vendor, user, rating, comment);
    res.status(201).json(review);
});
ReviewController.getReviewsByVendor = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendorId } = req.params;
    const reviews = await review_service_1.default.getReviewsByVendor(vendorId);
    res.status(200).json(reviews);
});
ReviewController.getAverageRating = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendorId } = req.params;
    const averageRating = await review_service_1.default.getAverageRating(vendorId);
    res.status(200).json({ averageRating });
});
exports.default = ReviewController;
//# sourceMappingURL=review.controller.js.map