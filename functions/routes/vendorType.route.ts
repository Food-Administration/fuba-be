import * as express from 'express';
import VendorTypeController from '../controllers/vendorType.controller';
import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

router.use(jwtAuth);

// Create a new vendor type
router.post('/', VendorTypeController.createVendorType);

// Get all vendor types
router.get('/', VendorTypeController.getVendorTypes);

// Get a vendor type by ID
router.get('/:vendorTypeId', VendorTypeController.getVendorTypeById);

// Update a vendor type
router.put('/:vendorTypeId', VendorTypeController.updateVendorType);

// Delete a vendor type
router.delete('/:vendorTypeId', VendorTypeController.deleteVendorType);

export default router;