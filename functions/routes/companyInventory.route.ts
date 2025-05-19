import CompanyInventory from '../controllers/companyInventory.controller';
import express from 'express';
import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();


router.post('/', jwtAuth, CompanyInventory.createCompanyInventory);
router.get('/', jwtAuth, CompanyInventory.getCompanyInventories);
router.put('/:inventoryId', jwtAuth, CompanyInventory.updateCompanyInventory);
router.delete('/:inventoryId', jwtAuth, CompanyInventory.deleteCompanyInventory);

export default router;