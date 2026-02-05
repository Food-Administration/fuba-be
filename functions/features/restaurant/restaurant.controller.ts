import { Request, Response } from "express";
import RestaurantService from "./restaurant.service";
import asyncHandler from "../../utils/asyncHandler";
import FoodItemService from "../food_item/food_item.service";

export class RestaurantController {
  /**
   * Creates a new restaurant.
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;
    
    const restaurant = file 
      ? await RestaurantService.createWithImage(req.body, file, userId)
      : await RestaurantService.create(req.body);
      
    res.status(201).json({ success: true, data: restaurant });
  });

  /**
   * Retrieves all restaurants with optional filters and pagination.
   * @query offset - Pagination offset (default: 0)
   * @query limit - Pagination limit (default: 10)
   * @query search - Search by restaurant name (optional)
   * @query promo - Filter by promo: 'freeDelivery' or 'discount' (optional)
   * @query mapLocation - Filter by location: 'latitude,longitude,radius' (optional)
   */
  get = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10", search, promo, mapLocation } = req.query;

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

    // Add promo filter if provided (case-insensitive and supports boolean semantics)
    if (typeof promo !== "undefined") {
      const raw = String(promo).trim();
      if (raw.length > 0) {
        const val = raw.toLowerCase();
        if (val === "freedelivery") {
          filter["promo.freeDelivery"] = true;
        } else if (val === "discount") {
          filter["promo.discountPercentage"] = { $gt: 0 };
        } else if (val === "any" || val === "true" || val === "1") {
          filter.$or = [
            { "promo.freeDelivery": true },
            { "promo.discountPercentage": { $gt: 0 } },
          ];
        } else if (val === "false" || val === "0") {
          // Explicitly request restaurants with no active promos
          filter.$and = [
            { $or: [
              { "promo.freeDelivery": { $exists: false } },
              { "promo.freeDelivery": { $ne: true } }
            ] },
            { $or: [
              { "promo.discountPercentage": { $exists: false } },
              { "promo.discountPercentage": { $lte: 0 } }
            ] }
          ];
        }
        // Any other string is ignored to avoid over-filtering
      }
    }

    // Add favorite/favourite filter if provided
    const favouriteParam = (req.query as any).favourite ?? (req.query as any).favorite;
    if (typeof favouriteParam !== "undefined") {
      const favStr = String(favouriteParam).trim().toLowerCase();
      if (["true", "1"].includes(favStr)) {
        filter.isFavorite = true;
      } else if (["false", "0"].includes(favStr)) {
        filter.isFavorite = false;
      }
    }

    // Parse user location if provided (latitude,longitude,radius[km])
    let userLocation: { latitude: number; longitude: number; radiusKm?: number } | undefined;
    if (typeof mapLocation === "string" && mapLocation.trim().length > 0) {
      // Some clients may accidentally send `mapLocation=?mapLocation=lat,long,radius`
      // Normalize that here by stripping a leading `?mapLocation=` if present
      let loc = mapLocation.trim();
      if (loc.startsWith("?mapLocation=")) {
        loc = loc.replace(/^\?mapLocation=/, "");
      }
      const locationParts = loc.split(',');
      if (locationParts.length >= 2) {
        const latitude = parseFloat(locationParts[0]);
        const longitude = parseFloat(locationParts[1]);
        const radiusKm = locationParts.length > 2 ? parseFloat(locationParts[2]) : 10; // Default 10km radius
        if (!isNaN(latitude) && !isNaN(longitude)) {
          userLocation = { latitude, longitude, radiusKm: !isNaN(radiusKm) ? radiusKm : 10 };
        }
      }
    }

    const { restaurants, total } = await RestaurantService.get(filter, {
      offset: numericOffset,
      limit: numericLimit,
    }, userLocation);

    res.status(200).json({
      success: true,
      data: restaurants,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  /**
   * Retrieves a restaurant by its ID with optional filters.
   * @query search - Search within restaurant items by name (optional)
   * @query promo - Filter by promo: 'freeDelivery' or 'discount' (optional)
   * @query mapLocation - Filter by location: 'latitude,longitude,radius' (optional)
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { search, promo, mapLocation } = req.query;

    // Build options object for optional filters
    const options: { search?: string; promo?: string; mapLocation?: string } = {};

    if (typeof search === "string" && search.trim().length > 0) {
      options.search = search.trim();
    }

    if (typeof promo === "string" && promo.trim().length > 0) {
      options.promo = promo.trim();
    }

    if (typeof mapLocation === "string" && mapLocation.trim().length > 0) {
      options.mapLocation = mapLocation.trim();
    }

    const restaurant = await RestaurantService.getById(req.params.id, options);
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
    const restaurant = await RestaurantService.deleteWithImage(req.params.id);
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
   * Updates restaurant image.
   */
  updateImage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const file = req.file;
    const userId = req.user?.id;

    if (!file) {
      res.status(400).json({
        success: false,
        error: "No image file uploaded",
      });
      return;
    }

    const restaurant = await RestaurantService.updateImage(id, file, userId);
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
      message: "Restaurant image updated successfully",
    });
  });

  /**
   * Adds a food item to a restaurant.
   */
  addItem = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId, itemId, item } = req.body as any;

    if (!restaurantId) {
      res.status(400).json({
        success: false,
        error: "restaurantId is required",
      });
      return;
    }

    // Path A: Existing itemId provided -> attempt to link directly
    if (itemId && String(itemId).trim().length > 0) {
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
      return;
    }

    // Path B: Create a new FoodItem from payload and link to restaurant
    // Accept either an `item` object or top-level fields besides restaurantId/itemId
    const topLevelCandidate = (() => {
      const clone: any = { ...req.body };
      delete clone.restaurantId;
      delete clone.itemId;
      delete clone.item;
      return Object.keys(clone).length ? clone : undefined;
    })();
    const source = (item && typeof item === "object") ? item : topLevelCandidate;
    if (!source) {
      res.status(400).json({
        success: false,
        error: "Provide either a valid itemId or an item payload",
      });
      return;
    }

    // Prepare payload: allow restaurants to define their own items.
    const payload: any = { ...source };
    // Do not allow client to set vendor directly from this endpoint
    if (payload.vendor) delete payload.vendor;

    // Basic validation for required fields
    const missing: string[] = [];
    if (!payload.name) missing.push("name");
    if (!payload.description) missing.push("description");
    if (!payload.price || typeof payload.price !== "object") {
      missing.push("price.premium, price.executive, price.regular");
    } else {
      const p = payload.price;
      if (p.premium === undefined) missing.push("price.premium");
      if (p.executive === undefined) missing.push("price.executive");
      if (p.regular === undefined) missing.push("price.regular");
    }
    if (missing.length) {
      res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      });
      return;
    }

    const createdItem = await FoodItemService.create(payload);
    const restaurant = await RestaurantService.addItem(
      restaurantId,
      (createdItem as any)._id.toString()
    );
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: restaurant,
      message: "New item created and added to restaurant",
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

  toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const restaurantId = req.params.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const restaurant = await RestaurantService.toggleFavorite(userId, restaurantId);
    if (!restaurant) {
      res.status(404).json({ success: false, error: "Restaurant not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: restaurant,
      message: "Favorite status toggled successfully",
    });
  });
}

export default new RestaurantController();
