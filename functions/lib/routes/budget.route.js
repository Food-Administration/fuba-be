"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budget_controller_1 = __importDefault(require("../controllers/budget.controller"));
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const router = (0, express_1.Router)();
// All routes now require authentication
router.use(jwtAuth_1.default);
router.post('/', budget_controller_1.default.createBudget);
router.get('/', budget_controller_1.default.getBudgets);
router.get('/:id', budget_controller_1.default.getBudgetById);
router.put('/:id', budget_controller_1.default.updateBudget);
router.delete('/:id', budget_controller_1.default.deleteBudget);
// Additional budget-specific routes
router.post('/:id/categories', budget_controller_1.default.addCategory);
// router.put('/:id/categories/:category_id', BudgetController.updateCategory);
router.delete('/:id/categories/:category_id', budget_controller_1.default.removeCategory);
router.post('/:id/categories/:category_id/items', budget_controller_1.default.addBudgetItem);
router.put('/:id/categories/:category_id/items/:item_id', budget_controller_1.default.updateBudgetItem);
router.delete('/:id/categories/:category_id/items/:item_id', budget_controller_1.default.removeBudgetItem);
router.post('/:id/categories/:category_id/aligned', budget_controller_1.default.addAlignedAmount);
router.put('/:id/categories/:category_id/aligned/:aligned_id', budget_controller_1.default.updateAlignedAmountStatus);
router.delete('/:id/categories/:category_id/aligned/:aligned_id', budget_controller_1.default.removeAlignedAmount);
// router.put('/:id/categories/:categoryId', BudgetController.updateCategory);
// router.delete('/:id/categories/:category_id', BudgetController.removeCategory);
// router.post('/:id/categories/:category_id/items', BudgetController.addBudgetItem);
// router.put('/:id/categories/:category_id/items/:item_id', BudgetController.updateBudgetItem);
// router.delete('/:id/categories/:category_id/items/:item_id', BudgetController.removeBudgetItem);
// router.post('/:id/categories/:category_id/aligned', BudgetController.addAlignedAmount);
// router.put('/:id/categories/:category_id/aligned/:aligned_id', BudgetController.updateAlignedAmountStatus);
router.delete('/:id/categories/:category_id/aligned/:aligned_id', budget_controller_1.default.removeAlignedAmount);
exports.default = router;
//# sourceMappingURL=budget.route.js.map