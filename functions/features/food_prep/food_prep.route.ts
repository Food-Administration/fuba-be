import { Router } from 'express';
import FoodPrepController from './food_prep.controller';

const router = Router();

// Create a food prep entry
router.post('/', FoodPrepController.create);

// Get all food prep entries (with optional query)
router.get('/', FoodPrepController.get);

// Get food prep entry by ID
router.get('/:id', FoodPrepController.getById);

// Update food prep entry
router.put('/:id', FoodPrepController.update);

// Get food prep entries by consumer
router.get('/consumer/:consumerId', FoodPrepController.getByConsumer);

// Delete food prep entry
router.delete('/:id', FoodPrepController.delete);

export default router;