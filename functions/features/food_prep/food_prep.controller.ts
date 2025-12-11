import { Request, Response } from 'express';
import FoodPrepService from './food_prep.service';
import asyncHandler from '../../utils/asyncHandler';

export class FoodPrepController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const foodPrep = await FoodPrepService.create(req.body);
    res.status(201).json({
      success: true,
      data: foodPrep,
      message: 'Food preparation entry created successfully'
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { foodPreps, total, page, limit } = await FoodPrepService.get(req.query);
    res.status(200).json({
      success: true,
      data: foodPreps,
      meta: { total, page, limit }
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const foodPrep = await FoodPrepService.getById(req.params.id);
    if (!foodPrep) {
      res.status(404).json({ success: false, error: 'Food preparation entry not found' });
      return;
    }
    res.status(200).json({ success: true, data: foodPrep });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const foodPrep = await FoodPrepService.update(req.params.id, req.body);
    if (!foodPrep) {
      res.status(404).json({ success: false, error: 'Food preparation entry not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: foodPrep,
      message: 'Food preparation entry updated successfully'
    });
  });

  getByConsumer = asyncHandler(async (req: Request, res: Response) => {
    const { foodPreps, total, page, limit } = await FoodPrepService.getByConsumer(
      req.params.consumerId,
      req.query
    );
    res.status(200).json({
      success: true,
      data: foodPreps,
      meta: { total, page, limit }
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const foodPrep = await FoodPrepService.delete(req.params.id);
    if (!foodPrep) {
      res.status(404).json({ success: false, error: 'Food preparation entry not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Food preparation entry deleted successfully'
    });
  });

  getByStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.params;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    const { foodPreps, total, page, limit } = await FoodPrepService.getByStatus(
      status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
      req.query
    );
    res.status(200).json({
      success: true,
      data: foodPreps,
      meta: { total, page, limit }
    });
  });

  getByMode = asyncHandler(async (req: Request, res: Response) => {
    const { mode } = req.params;

    if (!['delivery', 'pickup'].includes(mode)) {
      res.status(400).json({
        success: false,
        error: 'Invalid mode. Must be either "delivery" or "pickup"'
      });
      return;
    }

    const { foodPreps, total, page, limit } = await FoodPrepService.getByMode(
      mode as 'delivery' | 'pickup',
      req.query
    );
    res.status(200).json({
      success: true,
      data: foodPreps,
      meta: { total, page, limit }
    });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Status is required and must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    const foodPrep = await FoodPrepService.updateStatus(req.params.id, status);
    if (!foodPrep) {
      res.status(404).json({ success: false, error: 'Food preparation entry not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: foodPrep,
      message: 'Food preparation status updated successfully'
    });
  });
}

export default new FoodPrepController();