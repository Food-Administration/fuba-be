import express from 'express';
import ProcurementController from '../controllers/procurement.controller';
import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

router.get('/', jwtAuth, ProcurementController.getProcurements);
router.get('/:id', jwtAuth, ProcurementController.getProcurementById);
router.post('/', jwtAuth, ProcurementController.createProcurement);
router.patch('/:id/process', jwtAuth, ProcurementController.processRequest);
router.put('/update-inventory', jwtAuth, ProcurementController.updateInventory);
router.put('/:id', jwtAuth, ProcurementController.updateProcurement);
// router.put('/:id/status', jwtAuth, ProcurementController.updateProcurementStatus);
router.delete('/:id', jwtAuth, ProcurementController.deleteProcurement);

router.patch('/:procurementId/items/:itemId/receive', jwtAuth, ProcurementController.receiveItem);
router.patch('/:procurementId/items/:itemId/reject', jwtAuth, ProcurementController.rejectItem);
router.post('/add', jwtAuth, ProcurementController.addItemToInventory);
router.put('/update-inventory', jwtAuth, ProcurementController.updateInventory);

export default router;