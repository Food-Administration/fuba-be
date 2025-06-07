import { Router } from 'express';
import CartController from './cart.controller';

const router = Router();

// Get cart by consumer ID
router.get('/:consumerId', CartController.getCart);

// Add item to cart
router.post('/:consumerId/items', CartController.addItem);

// Update item quantity in cart
router.put('/:consumerId/items/:foodItemId', CartController.updateItem);

// Remove item from cart
router.delete('/:consumerId/items/:foodItemId', CartController.removeItem);

// Clear cart
router.delete('/:consumerId/clear', CartController.clearCart);

export default router;