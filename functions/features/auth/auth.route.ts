import * as express from 'express';
import customerAuthRoutes from './customer.auth.route';
import vendorAuthRoutes from './vendor.auth.route';
import restaurantAuthRoutes from './restaurant.auth.route';

const router = express.Router();

router.use('/customer', customerAuthRoutes);
router.use('/vendor', vendorAuthRoutes);
router.use('/restaurant', restaurantAuthRoutes);

export default router;