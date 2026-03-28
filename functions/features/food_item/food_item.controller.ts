import { Request, Response } from "express";
import FoodItemService from "./food_item.service";
import asyncHandler from "../../utils/asyncHandler";

export class FoodItemController {
  private normalizeCategories(input: any): string[] | undefined {
    if (input === undefined || input === null) return undefined;
    const add = (acc: string[], val: string) => {
      const v = val.trim();
      if (v) acc.push(v);
      return acc;
    };
    let values: string[] = [];
    if (Array.isArray(input)) {
      for (const item of input) {
        if (typeof item === "string") {
          if (item.trim().startsWith("[") && item.trim().endsWith("]")) {
            try {
              const parsed = JSON.parse(item);
              if (Array.isArray(parsed)) values = values.concat(parsed.map(String));
            } catch {}
          } else if (item.includes(",")) {
            values = values.concat(item.split(",").reduce(add, []));
          } else {
            values.push(item);
          }
        }
      }
    } else if (typeof input === "string") {
      const str = input.trim();
      if (!str) return [];
      if (str.startsWith("[") && str.endsWith("]")) {
        try {
          const parsed = JSON.parse(str);
          if (Array.isArray(parsed)) values = values.concat(parsed.map(String));
        } catch {
          values.push(str);
        }
      } else if (str.includes(",")) {
        values = values.concat(str.split(",").reduce(add, []));
      } else {
        values.push(str);
      }
    }
    // trim and dedupe
    const trimmed = values.map(v => v.trim()).filter(Boolean);
    return Array.from(new Set(trimmed));
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;
    // Prevent tying Home Chef items to a vendor by stripping vendor field
    const payload: any = { ...req.body };
    if (payload.vendor) {
      delete payload.vendor;
    }

    const normalized = this.normalizeCategories(payload.category ?? payload.categories);
    if (normalized !== undefined) {
      payload.category = normalized;
    }

    const foodItem = file
      ? await FoodItemService.createWithImage(payload, file, userId)
      : await FoodItemService.create(payload);
      
    res.status(201).json({ success: true, data: foodItem });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10", search, category, categories } = req.query;

    // Parse query parameters
    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    // Initialize filter object
    const filter: any = {};

    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Add search condition if search is a valid, non-empty string
    if (typeof search === "string" && search.trim().length > 0) {
      const escapedSearch = escapeRegex(search.trim());
      filter.name = { $regex: escapedSearch, $options: "i" };
    }

    // Add category filter (supports category or categories query params)
    const normalizedCategories = this.normalizeCategories(category ?? categories);
    if (normalizedCategories && normalizedCategories.length > 0) {
      filter.category = {
        $in: normalizedCategories.map(
          value => new RegExp(`^${escapeRegex(value)}$`, "i")
        ),
      };
    }

    const { foodItems, total } = await FoodItemService.get(filter, {
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
      res.status(404).json({ success: false, message: "Food item not found" });
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
    // Also strip vendor on updates to avoid re-tying items to vendors
    const payload: any = { ...req.body };
    if (payload.vendor) {
      delete payload.vendor;
    }

    const normalized = this.normalizeCategories(payload.category ?? payload.categories);
    if (normalized !== undefined) {
      payload.category = normalized;
    }
    const foodItem = await FoodItemService.update(req.params.id, payload);
    if (!foodItem) {
      res.status(404).json({ success: false, message: "Food item not found" });
      return;
    }
    res.status(200).json({ success: true, data: foodItem });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const foodItem = await FoodItemService.deleteWithImage(req.params.id);
    if (!foodItem) {
      res.status(404).json({ success: false, message: "Food item not found" });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: "Food item deleted successfully" });
  });

  updateImage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const file = req.file;
    const userId = req.user?.id;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
      return;
    }

    const foodItem = await FoodItemService.updateImage(id, file, userId);
    if (!foodItem) {
      res.status(404).json({
        success: false,
        message: "Food item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: foodItem,
      message: "Food item image updated successfully",
    });
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
