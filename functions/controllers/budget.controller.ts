import { Request, Response } from 'express';
import BudgetService from '../services/budget.service';
import asyncHandler from '../utils/asyncHandler';
import { Types } from 'mongoose';
import CustomError from '../utils/customError';

interface AuthenticatedRequest extends Request {
  user: Express.User & { companyName?: string; email?: string };
}

class BudgetController {
  private assertAuthenticated(req: Request): asserts req is AuthenticatedRequest {
    if (!req.user) {
      throw new Error('User is not authenticated');
    }
  }

  createBudget = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const budget = await BudgetService.createBudget({
      ...req.body,
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id,
    });
    res.status(201).json(budget);
  });

  getBudgets = asyncHandler(async (req: Request, res: Response) => {
    const budgets = await BudgetService.getBudgets();
    res.status(200).json(budgets);
  });

  getBudgetById = asyncHandler(async (req: Request, res: Response) => {
    const budget = await BudgetService.getBudgetById(req.params.id);
    res.status(200).json(budget);
  });

  updateBudget = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const budget = await BudgetService.updateBudget(req.params.id, {
      ...req.body,
      lastUpdatedBy: new Types.ObjectId(req.user.id),
    });
    res.status(200).json(budget);
  });

  deleteBudget = asyncHandler(async (req: Request, res: Response) => {
    await BudgetService.deleteBudget(req.params.id);
    res.status(200).json({ message: 'Budget deleted successfully' });
  });

  // Category operations
  addCategory = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const budget = await BudgetService.addCategory(
      req.params.id,
      req.body,
      new Types.ObjectId(req.user.id)
    );
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

  removeCategory = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const budget = await BudgetService.removeCategory(
      req.params.id,
      req.params.category_id,
      new Types.ObjectId(req.user.id)
    );
    res.status(200).json(budget);
  });

  // Budget Item operations
  addBudgetItem = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const budget = await BudgetService.addBudgetItem(
      req.params.id,
      req.params.category_id,
      req.body,
      new Types.ObjectId(req.user.id)
    );
    res.status(200).json(budget);
  });

  updateBudgetItem = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const budget = await BudgetService.updateBudgetItem(
      req.params.id,
      req.params.category_id,
      req.params.item_id,
      req.body,
      new Types.ObjectId(req.user.id)
    );
    res.status(200).json(budget);
  });

  removeBudgetItem = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const budget = await BudgetService.removeBudgetItem(
      req.params.id,
      req.params.category_id,
      req.params.item_id,
      new Types.ObjectId(req.user.id)
    );
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

  addAlignedAmount = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const { amount, budgetItemId, comment } = req.body; // Extract amount, budgetItemId, and comment
    if (!amount || !budgetItemId || !comment) {
      throw new CustomError('Amount, budgetItemId, and comment are required', 400);
    }
    const budget = await BudgetService.addAlignedAmount(
      req.params.id,
      req.params.category_id,
      {
        amount,
        budgetItemId: new Types.ObjectId(budgetItemId),
        comment,
        personnel: req.user.companyName || req.user.email || 'Unknown',
        date: new Date(),
      },
      new Types.ObjectId(req.user.id)
    );
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

  updateAlignedAmountStatus = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const { status, rejectionReason } = req.body;
  
    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      throw new CustomError('Invalid or missing status. Must be "approved" or "rejected"', 400);
    }
  
    // Validate rejectionReason for rejected status
    if (status === 'rejected' && !rejectionReason) {
      throw new CustomError('Rejection reason is required for rejected status', 400);
    }
  
    const budget = await BudgetService.updateAlignedAmountStatus(
      req.params.id,
      req.params.category_id,
      req.params.aligned_id,
      status,
      new Types.ObjectId(req.user.id),
      rejectionReason
    );
    res.status(200).json(budget);
  });

  removeAlignedAmount = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const budget = await BudgetService.removeAlignedAmount(
      req.params.id,
      req.params.category_id,
      req.params.aligned_id,
      new Types.ObjectId(req.user.id)
    );
    res.status(200).json(budget);
  });
}

export default new BudgetController();