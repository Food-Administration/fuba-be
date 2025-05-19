import { Request, Response } from 'express';
import ReviewService from '../services/review.service';
import asyncHandler from '../utils/asyncHandler';

class ReviewController {
    static createReview = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendor, rating, comment } = req.body;
            if (!req.user) {
                res.status(400).json({ message: 'User not authenticated' });
                return;
            }
            const user = (req.user as { id: string }).id; // Assuming user ID is available in the request
            const review = await ReviewService.createReview(vendor, user, rating, comment);
            res.status(201).json(review);
        }
    );

    static getReviewsByVendor = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendorId } = req.params;
            const reviews = await ReviewService.getReviewsByVendor(vendorId);
            res.status(200).json(reviews);
        }
    );

    static getAverageRating = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendorId } = req.params;
            const averageRating = await ReviewService.getAverageRating(vendorId);
            res.status(200).json({ averageRating });
        }
    );
}

export default ReviewController;