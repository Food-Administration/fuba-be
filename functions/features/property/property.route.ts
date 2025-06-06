import { Router } from 'express';
import PropertyController from './property.controller'; // This file itself exports the controller

const router = Router();

// Create a property
router.post('/', PropertyController.create);

// Get all properties (with optional query)
router.get('/', PropertyController.get);

// Get a property by ID
router.get('/:id', PropertyController.getById);

// Update a property by ID
router.put('/:id', PropertyController.update);

// Delete a property by ID
router.delete('/:id', PropertyController.delete);

export default router;