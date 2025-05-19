import * as express from 'express';
import VendorController from '../controllers/vendor.controller';
import jwtAuth from '../middleware/jwtAuth';
import upload from '../config/multer';

const router = express.Router();

router.use(jwtAuth)

// router.post('/', isAdmin, VendorController.createVendor);
// router.post('/importVendors', isAdmin,  VendorController.importVendors);
// router.get('/:vendorId', jwtAuth, VendorController.getVendorById);
// router.get('/', isAdmin, VendorController.getVendors);
// router.put('/:vendorId', jwtAuth, VendorController.updateVendor);
// router.delete('/:vendorId', isAdmin, VendorController.deleteVendor);

router.post('/', VendorController.createVendor);
router.post(
    '/importVendors/file/upload-file',
    upload.single('file'),
    VendorController.importVendors
  );
router.get('/:vendorId', VendorController.getVendorById);
router.get('/', VendorController.getVendors);
router.put('/:vendorId', VendorController.updateVendor);
router.delete('/:vendorId', VendorController.deleteVendor);

export default router;