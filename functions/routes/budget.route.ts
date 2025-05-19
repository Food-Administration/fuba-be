import { Router } from 'express';
import BudgetController from '../controllers/budget.controller';
import jwtAuth from '../middleware/jwtAuth';

const router = Router();

// All routes now require authentication
router.use(jwtAuth);

router.post('/', BudgetController.createBudget);
router.get('/', BudgetController.getBudgets);
router.get('/:id', BudgetController.getBudgetById);
router.put('/:id', BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

// Additional budget-specific routes
router.post('/:id/categories', BudgetController.addCategory);
// router.put('/:id/categories/:category_id', BudgetController.updateCategory);
router.delete('/:id/categories/:category_id', BudgetController.removeCategory);
router.post('/:id/categories/:category_id/items', BudgetController.addBudgetItem);
router.put('/:id/categories/:category_id/items/:item_id', BudgetController.updateBudgetItem);
router.delete('/:id/categories/:category_id/items/:item_id', BudgetController.removeBudgetItem);
router.post('/:id/categories/:category_id/aligned', BudgetController.addAlignedAmount);
router.put('/:id/categories/:category_id/aligned/:aligned_id', BudgetController.updateAlignedAmountStatus);



router.delete('/:id/categories/:category_id/aligned/:aligned_id', BudgetController.removeAlignedAmount);
// router.put('/:id/categories/:categoryId', BudgetController.updateCategory);
// router.delete('/:id/categories/:category_id', BudgetController.removeCategory);
// router.post('/:id/categories/:category_id/items', BudgetController.addBudgetItem);
// router.put('/:id/categories/:category_id/items/:item_id', BudgetController.updateBudgetItem);
// router.delete('/:id/categories/:category_id/items/:item_id', BudgetController.removeBudgetItem);
// router.post('/:id/categories/:category_id/aligned', BudgetController.addAlignedAmount);
// router.put('/:id/categories/:category_id/aligned/:aligned_id', BudgetController.updateAlignedAmountStatus);
router.delete('/:id/categories/:category_id/aligned/:aligned_id', BudgetController.removeAlignedAmount);

export default router;