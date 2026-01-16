import Restaurant, { IRestaurant } from "./restaurant.model";
import { Types } from "mongoose";

export class RestaurantService {
  /**
   * Creates a new restaurant.
   * @param data - Partial data for the restaurant.
   * @returns The created restaurant.
   */
  async create(data: Partial<IRestaurant>): Promise<IRestaurant> {
    const restaurant = new Restaurant(data);
    return await restaurant.save();
  }

  /**
   * Retrieves restaurants based on the provided filter with pagination.
   * @param filter - Mongoose filter query.
   * @param options - Pagination options: offset and limit.
   * @returns An object containing restaurants, total count, offset and limit.
   */
  async get(
    filter: import("mongoose").FilterQuery<IRestaurant> = {},
    options: { offset?: number; limit?: number } = {}
  ): Promise<{
    restaurants: IRestaurant[];
    total: number;
    offset: number;
    limit: number;
  }> {
    const offset = Math.max(0, options.offset || 0);
    const limit = Math.max(1, options.limit || 10);

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate("items", "name category description price image")
        .skip(offset)
        .limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    return { restaurants, total, offset, limit };
  }

  /**
   * Retrieves a restaurant by its ID with optional filters.
   * @param id - The ID of the restaurant.
   * @param options - Optional filters: search (filter items by name), promo (filter by promo type).
   * @returns The restaurant if found, otherwise null.
   */
  async getById(
    id: string,
    options: { search?: string; promo?: string } = {}
  ): Promise<IRestaurant | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    // Build the query
    const query: any = { _id: id };

    // Add promo filter if provided
    if (options.promo) {
      if (options.promo === "freeDelivery") {
        query["promo.freeDelivery"] = true;
      } else if (options.promo === "discount") {
        query["promo.discountPercentage"] = { $gt: 0 };
      } else if (options.promo === "any") {
        query.$or = [
          { "promo.freeDelivery": true },
          { "promo.discountPercentage": { $gt: 0 } },
        ];
        query._id = id; // Ensure ID is still part of the query
      }
    }

    const restaurant = await Restaurant.findOne(query).populate(
      "items",
      "name category description price image"
    );

    if (!restaurant) return null;

    // If search is provided, filter items by name
    if (options.search) {
      const searchRegex = new RegExp(options.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const restaurantObj = restaurant.toObject();
      restaurantObj.items = (restaurantObj.items as any[]).filter(
        (item: any) => searchRegex.test(item.name)
      );
      return restaurantObj as IRestaurant;
    }

    return restaurant;
  }

  /**
   * Updates a restaurant by its ID.
   * @param id - The ID of the restaurant to update.
   * @param data - Partial data to update the restaurant with.
   * @returns The updated restaurant if found, otherwise null.
   */
  async update(
    id: string,
    data: Partial<IRestaurant>
  ): Promise<IRestaurant | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Restaurant.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("items", "name category description price image");
  }

  /**
   * Deletes a restaurant by its ID.
   * @param id - The ID of the restaurant to delete.
   * @returns The deleted restaurant if found, otherwise null.
   */
  async delete(id: string): Promise<IRestaurant | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Restaurant.findByIdAndDelete(id);
  }

  /**
   * Retrieves restaurants by mode (delivery, pickup, or both).
   * @param mode - The mode of service.
   * @param options - Pagination options.
   * @returns Filtered restaurants with pagination data.
   */
  async getByMode(
    mode: "delivery" | "pickup" | "both",
    options: { offset?: number; limit?: number } = {}
  ): Promise<{
    restaurants: IRestaurant[];
    total: number;
    offset: number;
    limit: number;
  }> {
    return this.get({ mode }, options);
  }

  /**
   * Retrieves restaurants by state.
   * @param state - The state name.
   * @param options - Pagination options.
   * @returns Filtered restaurants with pagination data.
   */
  async getByState(
    state: string,
    options: { offset?: number; limit?: number } = {}
  ): Promise<{
    restaurants: IRestaurant[];
    total: number;
    offset: number;
    limit: number;
  }> {
    return this.get({ state }, options);
  }

  /**
   * Retrieves restaurants with active promotions.
   * @param options - Pagination options.
   * @returns Restaurants with active promos with pagination data.
   */
  async getWithPromos(
    options: { offset?: number; limit?: number } = {}
  ): Promise<{
    restaurants: IRestaurant[];
    total: number;
    offset: number;
    limit: number;
  }> {
    return this.get({ "promo.freeDelivery": true }, options);
  }

  /**
   * Adds an item to a restaurant's items list.
   * @param restaurantId - The ID of the restaurant.
   * @param itemId - The ID of the food item to add.
   * @returns The updated restaurant if found, otherwise null.
   */
  async addItem(
    restaurantId: string,
    itemId: string
  ): Promise<IRestaurant | null> {
    if (
      !Types.ObjectId.isValid(restaurantId) ||
      !Types.ObjectId.isValid(itemId)
    )
      return null;

    return await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $addToSet: { items: new Types.ObjectId(itemId) } },
      { new: true }
    ).populate("items", "name category description price image");
  }

  /**
   * Removes an item from a restaurant's items list.
   * @param restaurantId - The ID of the restaurant.
   * @param itemId - The ID of the food item to remove.
   * @returns The updated restaurant if found, otherwise null.
   */
  async removeItem(
    restaurantId: string,
    itemId: string
  ): Promise<IRestaurant | null> {
    if (
      !Types.ObjectId.isValid(restaurantId) ||
      !Types.ObjectId.isValid(itemId)
    )
      return null;

    return await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $pull: { items: new Types.ObjectId(itemId) } },
      { new: true }
    ).populate("items", "name category description price image");
  }

  /**
   * Updates the rating of a restaurant.
   * @param id - The ID of the restaurant.
   * @param newRating - The new rating value (0-5).
   * @returns The updated restaurant if found, otherwise null.
   */
  async updateRating(id: string, newRating: number): Promise<IRestaurant | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    if (newRating < 0 || newRating > 5) return null;

    return await Restaurant.findByIdAndUpdate(
      id,
      { ratings: newRating },
      { new: true }
    ).populate("items", "name category description price image");
  }
}

export default new RestaurantService();
