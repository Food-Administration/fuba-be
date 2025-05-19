import { Router } from 'express';
import LogisticsController from '../controllers/logistics.controller';
import jwtAuth from '../middleware/jwtAuth';


const router = Router();

router.post('/', jwtAuth, LogisticsController.createLogistics);
router.get('/', jwtAuth, LogisticsController.getLogistics);
router.get('/:id', jwtAuth, LogisticsController.getLogisticsById);
router.put('/:id', jwtAuth, LogisticsController.updateLogistics);
router.put('/:id/aligned-amount', jwtAuth, LogisticsController.updateAlignedAmount);
router.delete('/:id', jwtAuth, LogisticsController.deleteLogistics);


router.delete('/:id/transportation/:itemId', jwtAuth, LogisticsController.deleteTransportationItem);
router.delete('/:id/accommodation/:itemId', jwtAuth, LogisticsController.deleteAccommodationItem);
router.delete('/:id/expense/:itemId', jwtAuth, LogisticsController.deleteExpenseItem);


// New partial update routes
router.patch('/:id/transportation/:itemId', jwtAuth, LogisticsController.updateTransportationItem);
router.patch('/:id/accommodation/:itemId', jwtAuth, LogisticsController.updateAccommodationItem);
router.patch('/:id/expense/:itemId', jwtAuth, LogisticsController.updateExpenseItem);

export default router;