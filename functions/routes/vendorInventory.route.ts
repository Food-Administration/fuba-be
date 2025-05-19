import VendorInventory from '../controllers/vendorInventory.controller';
import express from 'express';
import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();


router.post('/', jwtAuth, VendorInventory.createVendorInventory);
router.get('/', jwtAuth, VendorInventory.getVendorInventories);
router.get('/:inventoryId', jwtAuth, VendorInventory.getVendorInventoryById);
router.get('/vendor/:vendorId', jwtAuth, VendorInventory.getVendorInventoryByVendor);
router.put('/:inventoryId', jwtAuth, VendorInventory.updateVendorInventory);
router.delete('/:inventoryId', jwtAuth, VendorInventory.deleteVendorInventory);

export default router;