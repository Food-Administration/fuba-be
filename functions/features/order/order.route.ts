import { Router } from 'express';
import OrderController from './order.controller';

const router = Router();

// Create an order
router.post('/', OrderController.create);

// Get all orders (with optional query)
router.get('/', OrderController.get);

// Get order by ID
router.get('/:id', OrderController.getById);

// Update order status
router.patch('/:id/status', OrderController.updateStatus);

// Get orders by consumer
router.get('/consumer/:consumerId', OrderController.getByConsumer);

// Get orders by vendor
router.get('/vendor/:vendorId', OrderController.getByVendor);

export default router;