import Review, { ReviewDocument } from '../models/review.model';
// import CustomError from '../utils/customError';

class ReviewService {
    static async createReview(
        vendor: string,
        user: string,
        rating: number,
        comment?: string
    ): Promise<ReviewDocument> {
        const review = new Review({ vendor, user, rating, comment });
        await review.save();
        return review;
    }

    static async getReviewsByVendor(vendorId: string): Promise<ReviewDocument[]> {
        return Review.find({ vendor: vendorId }).populate('user', 'firstName lastName');
    }

    /**
     * Calculates the average rating for a given vendor.
     *
     * @param vendorId - The ID of the vendor whose average rating is to be calculated.
     * @returns A promise that resolves to the average rating of the vendor. If there are no ratings, it returns 0.
     */
    static async getAverageRating(vendorId: string): Promise<number> {
        const result = await Review.aggregate([
            { $match: { vendor: vendorId } },
            { $group: { _id: null, averageRating: { $avg: '$rating' } } },
        ]);
        return result.length > 0 ? result[0].averageRating : 0;
    }
}

export default ReviewService;