import { Router } from 'express';
import FoodItemController from './food_item.controller';
import { uploadImage } from '../../middleware/upload';
import jwtAuth from '../../middleware/jwtAuth';

const router = Router();

// Create a food item (with optional image)
router.post('/', jwtAuth, uploadImage.single('image'), FoodItemController.create);

// Get all food items (with optional query)
router.get('/', FoodItemController.get);

// Get food items by vendor
router.get('/vendor/:vendorId', FoodItemController.getByVendor);

// Get a food item by ID
router.get('/:id', FoodItemController.getById);

// Update a food item by ID
router.put('/:id', jwtAuth, FoodItemController.update);

// Update food item image
router.patch('/:id/image', jwtAuth, uploadImage.single('image'), FoodItemController.updateImage);

// Toggle food item availability
// router.patch('/:id/availability', FoodItemController.toggleAvailability);

// Delete a food item by ID
router.delete('/:id', jwtAuth, FoodItemController.delete);

export default router;