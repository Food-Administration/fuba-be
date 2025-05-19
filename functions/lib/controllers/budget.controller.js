"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const budget_service_1 = __importDefault(require("../services/budget.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const mongoose_1 = require("mongoose");
const customError_1 = __importDefault(require("../utils/customError"));
class BudgetController {
    constructor() {
        this.createBudget = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const budget = await budget_service_1.default.createBudget({
                ...req.body,
                createdBy: req.user.id,
                lastUpdatedBy: req.user.id,
            });
            res.status(201).json(budget);
        });
        this.getBudgets = (0, asyncHandler_1.default)(async (req, res) => {
            const budgets = await budget_service_1.default.getBudgets();
            res.status(200).json(budgets);
        });
        this.getBudgetById = (0, asyncHandler_1.default)(async (req, res) => {
            const budget = await budget_service_1.default.getBudgetById(req.params.id);
            res.status(200).json(budget);
        });
        this.updateBudget = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const budget = await budget_service_1.default.updateBudget(req.params.id, {
                ...req.body,
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            });
            res.status(200).json(budget);
        });
        this.deleteBudget = (0, asyncHandler_1.default)(async (req, res) => {
            await budget_service_1.default.deleteBudget(req.params.id);
            res.status(200).json({ message: 'Budget deleted successfully' });
        });
        // Category operations
        this.addCategory = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const budget = await budget_service_1.default.addCategory(req.params.id, req.body, new mongoose_1.Types.ObjectId(req.user.id));
            res.status(200).json(budget);
        });
        //   updateCategory = asyncHandler(async (req: Request, res: Response) => {
        //     this.assertAuthenticated(req);
        //     const budget = await BudgetService.updateCategory(
        //       req.params.id,
        //       req.params.categoryId,
        //       req.body,
        //       new Types.ObjectId(req.user.id)
        //     );
        //     res.status(200).json(budget);
        //   });
        this.removeCategory = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const budget = await budget_service_1.default.removeCategory(req.params.id, req.params.category_id, new mongoose_1.Types.ObjectId(req.user.id));
            res.status(200).json(budget);
        });
        // Budget Item operations
        this.addBudgetItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const budget = await budget_service_1.default.addBudgetItem(req.params.id, req.params.category_id, req.body, new mongoose_1.Types.ObjectId(req.user.id));
            res.status(200).json(budget);
        });
        this.updateBudgetItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const budget = await budget_service_1.default.updateBudgetItem(req.params.id, req.params.category_id, req.params.item_id, req.body, new mongoose_1.Types.ObjectId(req.user.id));
            res.status(200).json(budget);
        });
        this.removeBudgetItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const budget = await budget_service_1.default.removeBudgetItem(req.params.id, req.params.category_id, req.params.item_id, new mongoose_1.Types.ObjectId(req.user.id));
            res.status(200).json(budget);
        });
        // Aligned Amount operations
        // addAlignedAmount = asyncHandler(async (req: Request, res: Response) => {
        //   this.assertAuthenticated(req);
        //   const budget = await BudgetService.addAlignedAmount(
        //     req.params.id,
        //     req.params.category_id,
        //     {
        //       ...req.body,
        //       personnel: req.user.companyName || req.user.email,
        //       date: new Date(),
        //     },
        //     new Types.ObjectId(req.user.id)
        //   );
        //   res.status(200).json(budget);
        // });
        this.addAlignedAmount = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { amount, budgetItemId, comment } = req.body; // Extract amount, budgetItemId, and comment
            if (!amount || !budgetItemId || !comment) {
                throw new customError_1.default('Amount, budgetItemId, and comment are required', 400);
            }
            const budget = await budget_service_1.default.addAlignedAmount(req.params.id, req.params.category_id, {
                amount,
                budgetItemId: new mongoose_1.Types.ObjectId(budgetItemId),
                comment,
                personnel: req.user.companyName || req.user.email || 'Unknown',
                date: new Date(),
            }, new mongoose_1.Types.ObjectId(req.user.id));
            res.status(200).json(budget);
        });
        // updateAlignedAmountStatus = asyncHandler(async (req: Request, res: Response) => {
        //   this.assertAuthenticated(req);
        //   // console.log("Updating commencing.....")
        //   const budget = await BudgetService.updateAlignedAmountStatus(
        //     req.params.id,
        //     req.params.category_id,
        //     req.params.aligned_id,
        //     req.body,
        //     new Types.ObjectId(req.user.id)
        //   );
        //   res.status(200).json(budget);
        // });
        this.updateAlignedAmountStatus = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { status, rejectionReason } = req.body;
            // Validate status
            if (!status || !['approved', 'rejected'].includes(status)) {
                throw new customError_1.default('Invalid or missing status. Must be "approved" or "rejected"', 400);
            }
            // Validate rejectionReason for rejected status
            if (status === 'rejected' && !rejectionReason) {
                throw new customError_1.default('Rejection reason is required for rejected status', 400);
            }
            const budget = await budget_service_1.default.updateAlignedAmountStatus(req.params.id, req.params.category_id, req.params.aligned_id, status, new mongoose_1.Types.ObjectId(req.user.id), rejectionReason);
            res.status(200).json(budget);
        });
        this.removeAlignedAmount = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const budget = await budget_service_1.default.removeAlignedAmount(req.params.id, req.params.category_id, req.params.aligned_id, new mongoose_1.Types.ObjectId(req.user.id));
            res.status(200).json(budget);
        });
    }
    assertAuthenticated(req) {
        if (!req.user) {
            throw new Error('User is not authenticated');
        }
    }
}
exports.default = new BudgetController();
//# sourceMappingURL=budget.controller.js.map