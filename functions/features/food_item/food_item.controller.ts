import { Request, Response } from "express";
import FoodItemService from "./food_item.service";
import asyncHandler from "../../utils/asyncHandler";

export class FoodItemController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const foodItem = await FoodItemService.create(req.body);
    res.status(201).json(foodItem);
  });

  get = asyncHandler(async (req: Request, res: Response) => {
  const { offset = '0', limit = '10', search } = req.query;

  // Parse query parameters
  const numericOffset = parseInt(offset as string, 10) || 0;
  const numericLimit = parseInt(limit as string, 10) || 10;

  // Initialize filter object
  const filter: any = {};

  // Add search condition if search is a valid, non-empty string
  if (typeof search === 'string' && search.trim().length > 0) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.name = { $regex: escapedSearch, $options: 'i' };
  }

  const {
    foodItems,
    total,
  } = await FoodItemService.get(filter, {
    offset: numericOffset,
    limit: numericLimit,
  });

  res.status(200).json({
    success: true,
    data: foodItems,
    meta: { total, offset: numericOffset, limit: numericLimit },
  });
});

  getById = asyncHandler(async (req: Request, res: Response) => {
    const foodItem = await FoodItemService.getById(req.params.id);
    if (!foodItem) {
      res.status(404).json({ success: false, error: "Food item not found" });
      return;
    }
    res.status(200).json({ success: true, data: foodItem });
  });

  getByVendor = asyncHandler(async (req: Request, res: Response) => {
    const { foodItems, total, offset, limit } = await FoodItemService.getByVendor(
      req.params.vendorId,
      req.query
    );
    res.status(200).json({
      success: true,
      data: foodItems,
      meta: { total, offset, limit },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const foodItem = await FoodItemService.update(req.params.id, req.body);
    if (!foodItem) {
      res.status(404).json({ success: false, error: "Food item not found" });
      return;
    }
    res.status(200).json({ success: true, data: foodItem });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const foodItem = await FoodItemService.delete(req.params.id);
    if (!foodItem) {
      res.status(404).json({ success: false, error: "Food item not found" });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: "Food item deleted successfully" });
  });

  // toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  //   const foodItem = await FoodItemService.toggleAvailability(req.params.id);
  //   if (!foodItem) {
  //     res.status(404).json({ success: false, error: 'Food item not found' });
  //     return;
  //   }
  //   res.status(200).json({
  //     success: true,
  //     data: foodItem,
  //     message: `Food item marked as ${foodItem.available ? 'available' : 'unavailable'}`
  //   });
  // });
}

export default new FoodItemController();
