import { Router } from 'express';
import jwtAuth from '../middleware/jwtAuth';
import TransportInventoryController from '../controllers/transportInventory.controller';

const router = Router();

router.post('/', jwtAuth, TransportInventoryController.createTransportInventory);
router.get('/', jwtAuth, TransportInventoryController.getTransportInventories);
router.get('/:id', jwtAuth, TransportInventoryController.getTransportInventoryById);
router.put('/:id', jwtAuth, TransportInventoryController.updateTransportInventory);
router.delete('/:id', jwtAuth, TransportInventoryController.deleteTransportInventory);

export default router;