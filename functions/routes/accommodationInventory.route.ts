import { Router } from 'express';
import jwtAuth from '../middleware/jwtAuth';
import AccommodationInventoryController from '../controllers/accommodationInventory.controller';

const router = Router();

router.post('/', jwtAuth, AccommodationInventoryController.createAccommodationInventory);
router.get('/', jwtAuth, AccommodationInventoryController.getAccommodationInventories);
router.get('/:id', jwtAuth, AccommodationInventoryController.getAccommodationInventoryById);
router.put('/:id', jwtAuth, AccommodationInventoryController.updateAccommodationInventory);
router.delete('/:id', jwtAuth, AccommodationInventoryController.deleteAccommodationInventory);

export default router;