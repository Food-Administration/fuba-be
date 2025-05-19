import { Request, Response } from 'express';
import ProcurementService from '../services/procurement.service';
import BudgetService from '../services/budget.service';
import asyncHandler from '../utils/asyncHandler';
import { Types } from 'mongoose';
import CustomError from '../utils/customError';

interface AuthenticatedRequest extends Request {
  user: Express.User & { id: string; companyName?: string; email?: string };
}

class ProcurementController {
  private assertAuthenticated(req: Request): asserts req is AuthenticatedRequest {
    if (!req.user) {
      throw new Error('User is not authenticated');
    }
  }

  createProcurement = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const procurement = await ProcurementService.createProcurement({
      ...req.body,
      createdBy: new Types.ObjectId(req.user.id),
      lastUpdatedBy: new Types.ObjectId(req.user.id),
    });
    res.status(201).json(procurement);
  });

  processRequest = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const { id } = req.params;
    const { items } = req.body;

    // Validate inputs
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new Error('Invalid procurement ID');
    }
    if (!items || !Array.isArray(items)) {
      throw new Error('Items array is required');
    }
    for (const item of items) {
      if (!item.budgetItem || !Types.ObjectId.isValid(item.budgetItem)) {
        throw new Error(`Invalid budgetItem ID for item: ${JSON.stringify(item)}`);
      }
    }

    const procurement = await ProcurementService.processRequest(id, { items });
    res.status(200).json({ data: procurement });
  });

  receiveItem = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const { procurementId, itemId } = req.params;

    if (!procurementId || !itemId) {
      throw new CustomError('Procurement ID and Item ID are required', 400);
    }

    if (!req.user.id) {
      throw new CustomError('User ID is required', 401);
    }

    const result = await ProcurementService.receiveItem(
      procurementId, 
      itemId, 
      req.user.id // No need to convert to ObjectId here - let the service handle it
    );
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.procurement,
    });
});

rejectItem = asyncHandler(async (req: Request, res: Response) => {
  this.assertAuthenticated(req);
  const { procurementId, itemId } = req.params;

  if (!procurementId || !itemId) {
    throw new CustomError('Procurement ID and Item ID are required', 400);
  }

  if (!req.user.id) {
    throw new CustomError('User ID is required', 401);
  }

  const result = await ProcurementService.rejectItem(procurementId, itemId, req.user.id);
  res.status(200).json({
    success: true,
    message: result.message,
    data: result.procurement,
  });
});

addItemToInventory = asyncHandler(async (req: Request, res: Response) => {
  this.assertAuthenticated(req);
  const { itemName, quantity, procurementId, procurementItemId } = req.body;

  if (!itemName || !quantity || !procurementId || !procurementItemId) {
    throw new CustomError('itemName, quantity, procurementId, and procurementItemId are required', 400);
  }

  const result = await ProcurementService.addItemToInventory({
    itemName,
    quantity,
    // unitPrice,
    procurementId,
    procurementItemId,
    addedBy: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      inventoryItem: result.inventoryItem,
      procurement: result.procurement,
    },
  });
});

updateInventory = asyncHandler(async (req: Request, res: Response) => {
  this.assertAuthenticated(req);
  const { itemName, quantity, procurementId, procurementItemId } = req.body;

  if (!itemName || !quantity || !procurementId || !procurementItemId) {
    throw new CustomError('itemName, quantity, procurementId, and procurementItemId are required', 400);
  }

  const result = await ProcurementService.updateInventory({
    itemName,
    quantity,
    procurementId,
    procurementItemId,
    addedBy: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      inventoryItem: result.inventoryItem,
      procurement: result.procurement,
    },
  });
});


  createRealignment = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const { category, amount, budgetId, comment } = req.body;
    const budget = await BudgetService.addAlignedAmount(
      budgetId,
      category,
      {
        amount,
        personnel: req.user.id,
        comment,
      },
      new Types.ObjectId(req.user.id)
    );
    res.status(201).json(budget);
  });

  updateRealignmentStatus = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const { budgetId, categoryId, alignedId, status, rejectionReason } = req.body;
    const budget = await BudgetService.updateAlignedAmountStatus(
      budgetId,
      categoryId,
      alignedId,
      status,
      new Types.ObjectId(req.user.id),
      rejectionReason
    );
    res.status(200).json(budget);
  });

  getProcurements = asyncHandler(async (req: Request, res: Response) => {
    const procurements = await ProcurementService.getProcurements();
    res.status(200).json(procurements);
  });

  getProcurementById = asyncHandler(async (req: Request, res: Response) => {
    const procurement = await ProcurementService.getProcurementById(req.params.id);
    res.status(200).json(procurement);
  });

  updateProcurement = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const procurement = await ProcurementService.updateProcurement(req.params.id, {
      ...req.body,
      lastUpdatedBy: new Types.ObjectId(req.user.id),
    });
    res.status(200).json(procurement);
  });

  deleteProcurement = asyncHandler(async (req: Request, res: Response) => {
    await ProcurementService.deleteProcurement(req.params.id);
    res.status(200).json({ message: 'Procurement deleted successfully' });
  });
}

export default new ProcurementController();