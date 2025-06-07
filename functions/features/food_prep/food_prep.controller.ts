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
}

export default new FoodPrepController();