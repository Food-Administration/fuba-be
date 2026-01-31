import { Request, Response } from "express";
import PromoService from "./promo.service";
import asyncHandler from "../../utils/asyncHandler";
import CustomError from "../../utils/customError";
import { Types } from "mongoose";

export class PromoController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;

    const payload: any = { ...req.body };

    // Coerce restaurant to ObjectId if string provided
    if (payload.restaurant && Types.ObjectId.isValid(payload.restaurant)) {
      payload.restaurant = new Types.ObjectId(payload.restaurant);
    }

    const promo = file
      ? await PromoService.createWithImage(payload, file, userId)
      : await PromoService.create(payload);

    res.status(201).json({ success: true, data: promo });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10", category, type, restaurant } = req.query;

    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    const filter: any = {};
    if (typeof category === "string" && category.trim()) {
      filter.category = category.trim();
    }
    if (typeof type === "string" && type.trim()) {
      filter.type = type.trim();
    }
    if (typeof restaurant === "string" && Types.ObjectId.isValid(restaurant)) {
      filter.restaurant = new Types.ObjectId(restaurant);
    }

    const { promos, total } = await PromoService.get(filter, {
      offset: numericOffset,
      limit: numericLimit,
    });

    res.status(200).json({
      success: true,
      data: promos,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const promo = await PromoService.getById(req.params.id);
    if (!promo) throw new CustomError("Promo not found", 404);
    res.status(200).json({ success: true, data: promo });
  });

  getByRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10" } = req.query;
    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    const { promos, total } = await PromoService.getByRestaurant(
      req.params.restaurantId,
      { offset: numericOffset, limit: numericLimit }
    );

    res.status(200).json({
      success: true,
      data: promos,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const payload: any = { ...req.body };
    if (payload.restaurant && Types.ObjectId.isValid(payload.restaurant)) {
      payload.restaurant = new Types.ObjectId(payload.restaurant);
    }
    const promo = await PromoService.update(req.params.id, payload);
    if (!promo) throw new CustomError("Promo not found", 404);
    res.status(200).json({ success: true, data: promo });
  });

  updateImage = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    const userId = req.user?.id;
    if (!file) throw new CustomError("No image file uploaded", 400);
    const promo = await PromoService.updateImage(req.params.id, file, userId);
    if (!promo) throw new CustomError("Promo not found", 404);
    res.status(200).json({ success: true, data: promo, message: "Promo image updated" });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const promo = await PromoService.delete(req.params.id);
    if (!promo) throw new CustomError("Promo not found", 404);
    res.status(200).json({ success: true, message: "Promo deleted successfully" });
  });
}

export default new PromoController();
