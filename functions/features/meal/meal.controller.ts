import { Request, Response } from "express";
import MealService from "./meal.service";
import { MealServiceType, MealCategory } from "./meal.model";
import asyncHandler from "../../utils/asyncHandler";

const VALID_SERVICE_TYPES = Object.values(MealServiceType);
const VALID_CATEGORIES = Object.values(MealCategory);

class MealController {
  private parseCombo(input: any): { name: string; quantity: number }[] | undefined {
    if (input === undefined || input === null) return undefined;
    try {
      const parsed = typeof input === "string" ? JSON.parse(input) : input;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item: any) => item && typeof item.name === "string" && item.name.trim())
        .map((item: any) => ({
          name: item.name.trim(),
          quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        }));
    } catch {
      return [];
    }
  }

  private validateRequired(body: any): string | null {
    const required = ["name", "description", "price", "serviceType", "category"];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) return `${field} is required`;
    }
    if (!VALID_SERVICE_TYPES.includes(body.serviceType)) {
      return `serviceType must be one of: ${VALID_SERVICE_TYPES.join(", ")}`;
    }
    if (!VALID_CATEGORIES.includes(body.category)) {
      return `category must be one of: ${VALID_CATEGORIES.join(", ")}`;
    }
    if (isNaN(Number(body.price)) || Number(body.price) < 0) {
      return "price must be a non-negative number";
    }
    return null;
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;
    const payload: any = { ...req.body };

    const error = this.validateRequired(payload);
    if (error) {
      res.status(400).json({ success: false, message: error });
      return;
    }

    payload.vendor = userId;
    payload.price = Number(payload.price);
    const combo = this.parseCombo(payload.combo);
    if (combo !== undefined) payload.combo = combo;

    const meal = file
      ? await MealService.createWithImage(payload, file, userId)
      : await MealService.create(payload);

    res.status(201).json({ success: true, data: meal });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10", search, serviceType, category } = req.query;
    const filter: any = {};

    if (typeof search === "string" && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escaped, $options: "i" };
    }
    if (serviceType && VALID_SERVICE_TYPES.includes(serviceType as MealServiceType)) {
      filter.serviceType = serviceType;
    }
    if (category && VALID_CATEGORIES.includes(category as MealCategory)) {
      filter.category = category;
    }

    const result = await MealService.get(filter, {
      offset: parseInt(offset as string, 10) || 0,
      limit: parseInt(limit as string, 10) || 10,
    });

    res.status(200).json({
      success: true,
      data: result.meals,
      meta: { total: result.total, offset: result.offset, limit: result.limit },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const meal = await MealService.getById(req.params.id);
    if (!meal) {
      res.status(404).json({ success: false, message: "Meal not found" });
      return;
    }
    res.status(200).json({ success: true, data: meal });
  });

  getByVendor = asyncHandler(async (req: Request, res: Response) => {
    const result = await MealService.getByVendor(req.params.vendorId, req.query);
    res.status(200).json({
      success: true,
      data: result.meals,
      meta: { total: result.total, offset: result.offset, limit: result.limit },
    });
  });

  getMyMeals = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id ?? "";
    const result = await MealService.getByVendor(userId, req.query);
    res.status(200).json({
      success: true,
      data: result.meals,
      meta: { total: result.total, offset: result.offset, limit: result.limit },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;
    const payload: any = { ...req.body };

    // Prevent changing vendor ownership
    delete payload.vendor;

    if (payload.serviceType && !VALID_SERVICE_TYPES.includes(payload.serviceType)) {
      res.status(400).json({
        success: false,
        message: `serviceType must be one of: ${VALID_SERVICE_TYPES.join(", ")}`,
      });
      return;
    }
    if (payload.category && !VALID_CATEGORIES.includes(payload.category)) {
      res.status(400).json({
        success: false,
        message: `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
      return;
    }
    if (payload.price !== undefined) {
      if (isNaN(Number(payload.price)) || Number(payload.price) < 0) {
        res.status(400).json({ success: false, message: "price must be a non-negative number" });
        return;
      }
      payload.price = Number(payload.price);
    }

    const combo = this.parseCombo(payload.combo);
    if (combo !== undefined) payload.combo = combo;

    // Verify the meal belongs to the vendor
    const existing = await MealService.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: "Meal not found" });
      return;
    }
    if (existing.vendor._id?.toString() !== userId && existing.vendor.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized to update this meal" });
      return;
    }

    const meal = await MealService.updateWithImage(req.params.id, payload, file, userId);
    res.status(200).json({ success: true, data: meal });
  });

  updateImage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: "No image file uploaded" });
      return;
    }

    const existing = await MealService.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: "Meal not found" });
      return;
    }
    if (existing.vendor._id?.toString() !== userId && existing.vendor.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized to update this meal" });
      return;
    }

    const meal = await MealService.updateImage(req.params.id, file, userId);
    res.status(200).json({ success: true, data: meal, message: "Meal image updated successfully" });
  });

  toggleStock = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const existing = await MealService.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: "Meal not found" });
      return;
    }
    if (existing.vendor._id?.toString() !== userId && existing.vendor.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized to update this meal" });
      return;
    }

    const meal = await MealService.toggleStock(req.params.id);
    res.status(200).json({
      success: true,
      data: meal,
      message: `Meal marked as ${meal?.isInStock ? "in stock" : "out of stock"}`,
    });
  });

  deleteMeal = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const existing = await MealService.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: "Meal not found" });
      return;
    }
    if (existing.vendor._id?.toString() !== userId && existing.vendor.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized to delete this meal" });
      return;
    }

    await MealService.deleteWithImage(req.params.id);
    res.status(200).json({ success: true, message: "Meal deleted successfully" });
  });
}

export default new MealController();
