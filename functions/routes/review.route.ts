import * as express from 'express';
import ReviewController from '../controllers/review.controller';
// import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

// Create a review
router.post('/', ReviewController.createReview);

// Get reviews by vendor
router.get('/:vendorId', ReviewController.getReviewsByVendor);

// Get average rating for a vendor
router.get('/:vendorId/average-rating', ReviewController.getAverageRating);

export default router;