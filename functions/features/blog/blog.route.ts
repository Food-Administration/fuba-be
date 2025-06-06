import { Router } from 'express';
import BlogController from './blog.controller'; // This file itself exports the controller

const router = Router();

// Create a blog
router.post('/', BlogController.create);

// Get all blogs (with optional query)
router.get('/', BlogController.get);

// Get a blog by ID
router.get('/:id', BlogController.getById);

// Update a blog by ID
router.put('/:id', BlogController.update);

// Delete a blog by ID
router.delete('/:id', BlogController.delete);

export default router;