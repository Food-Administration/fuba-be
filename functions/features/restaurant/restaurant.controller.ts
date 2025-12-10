import { Request, Response } from "express";
import RestaurantService from "./restaurant.service";
import asyncHandler from "../../utils/asyncHandler";

export class RestaurantController {
  /**
   * Creates a new restaurant.
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const restaurant = await RestaurantService.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  });

  /**
   * Retrieves all restaurants with optional filters and pagination.
   */
  get = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10", search } = req.query;

    // Parse query parameters
    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    // Initialize filter object
    const filter: any = {};

    // Add search condition if search is a valid, non-empty string
    if (typeof search === "string" && search.trim().length > 0) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escapedSearch, $options: "i" };
    }

    const { restaurants, total } = await RestaurantService.get(filter, {
      offset: numericOffset,
      limit: numericLimit,
    });

    res.status(200).json({
      success: true,
      data: restaurants,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  /**
   * Retrieves a restaurant by its ID.
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const restaurant = await RestaurantService.getById(req.params.id);
    if (!restaurant) {
      res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });
      return;
    }
    res.status(200).json({ success: true, data: restaurant });
  });

  /**
   * Retrieves restaurants by mode (delivery, pickup, or both).
   */
  getByMode = asyncHandler(async (req: Request, res: Response) => {
    const { mode } = req.params;
    const { offset = "0", limit = "10" } = req.query;

    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    if (!["delivery", "pickup", "both"].includes(mode)) {
      res.status(400).json({
        success: false,
        error: "Mode must be 'delivery', 'pickup', or 'both'",
      });
      return;
    }

    const { restaurants, total } = await RestaurantService.getByMode(
      mode as "delivery" | "pickup" | "both",
      {
        offset: numericOffset,
        limit: numericLimit,
      }
    );

    res.status(200).json({
      success: true,
      data: restaurants,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  /**
   * Retrieves restaurants by state.
   */
  getByState = asyncHandler(async (req: Request, res: Response) => {
    const { state } = req.params;
    const { offset = "0", limit = "10" } = req.query;

    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    const { restaurants, total } = await RestaurantService.getByState(state, {
      offset: numericOffset,
      limit: numericLimit,
    });

    res.status(200).json({
      success: true,
      data: restaurants,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  /**
   * Retrieves restaurants with active promotions.
   */
  getWithPromos = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10" } = req.query;

    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    const { restaurants, total } = await RestaurantService.getWithPromos({
      offset: numericOffset,
      limit: numericLimit,
    });

    res.status(200).json({
      success: true,
      data: restaurants,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  /**
   * Updates a restaurant by its ID.
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const restaurant = await RestaurantService.update(req.params.id, req.body);
    if (!restaurant) {
      res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });
      return;
    }
    res.status(200).json({ success: true, data: restaurant });
  });

  /**
   * Deletes a restaurant by its ID.
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const restaurant = await RestaurantService.delete(req.params.id);
    if (!restaurant) {
      res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  });

  /**
   * Adds a food item to a restaurant.
   */
  addItem = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, itemId } = req.body;

    if (!restaurantId || !itemId) {
      res.status(400).json({
        success: false,
        error: "restaurantId and itemId are required",
      });
      return;
    }

    const restaurant = await RestaurantService.addItem(restaurantId, itemId);
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: "Restaurant or item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: restaurant,
      message: "Item added to restaurant",
    });
  });

  /**
   * Removes a food item from a restaurant.
   */
  removeItem = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, itemId } = req.body;

    if (!restaurantId || !itemId) {
      res.status(400).json({
        success: false,
        error: "restaurantId and itemId are required",
      });
      return;
    }

    const restaurant = await RestaurantService.removeItem(
      restaurantId,
      itemId
    );
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: "Restaurant or item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: restaurant,
      message: "Item removed from restaurant",
    });
  });

  /**
   * Updates the rating of a restaurant.
   */
  updateRating = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating === undefined) {
      res.status(400).json({
        success: false,
        error: "Rating is required",
      });
      return;
    }

    if (rating < 0 || rating > 5) {
      res.status(400).json({
        success: false,
        error: "Rating must be between 0 and 5",
      });
      return;
    }

    const restaurant = await RestaurantService.updateRating(id, rating);
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: restaurant,
      message: "Rating updated successfully",
    });
  });
}

export default new RestaurantController();
