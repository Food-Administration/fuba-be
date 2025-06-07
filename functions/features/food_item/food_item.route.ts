import { Router } from 'express';
import FoodItemController from './food_item.controller';

const router = Router();

// Create a food item
router.post('/', FoodItemController.create);

// Get all food items (with optional query)
router.get('/', FoodItemController.get);

// Get food items by vendor
router.get('/vendor/:vendorId', FoodItemController.getByVendor);

// Get a food item by ID
router.get('/:id', FoodItemController.getById);

// Update a food item by ID
router.put('/:id', FoodItemController.update);

// Toggle food item availability
// router.patch('/:id/availability', FoodItemController.toggleAvailability);

// Delete a food item by ID
router.delete('/:id', FoodItemController.delete);

export default router;