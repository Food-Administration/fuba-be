import FoodItem, { IFoodItem } from "./food_item.model"; // Adjust path if needed
import { Types } from "mongoose";

export class FoodItemService {
  /**
   * Creates a new food item.
   * @param data - Partial data for the food item.
   * @returns The created food item.
   */
  async create(data: Partial<IFoodItem>): Promise<IFoodItem> {
    const foodItem = new FoodItem(data);
    return await foodItem.save();
  }

  /**
   * Retrieves food items based on the provided filter and optional search, with pagination.
   * @param filter - Mongoose filter query.
   * @param options - Pagination options: page (1-based), limit, and search string.
   * @returns An object containing food items, total count, page and limit.
   */
  async get(
  filter: import("mongoose").FilterQuery<IFoodItem> = {},
  options: { offset?: number; limit?: number } = {}
): Promise<{
  foodItems: IFoodItem[];
  total: number;
  offset: number;
  limit: number;
}> {
  const offset = Math.max(0, options.offset || 0);
  const limit = Math.max(1, options.limit || 10);

  const [foodItems, total] = await Promise.all([
    FoodItem.find(filter).skip(offset).limit(limit),
    FoodItem.countDocuments(filter),
  ]);

  return { foodItems, total, offset, limit };
}

  /**
   * Retrieves a food item by its ID.
   * @param id - The ID of the food item.
   * @returns The food item if found, otherwise null.
   */
  async getById(id: string): Promise<IFoodItem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await FoodItem.findById(id);
  }

  /**
   * Updates a food item by its ID.
   * @param id - The ID of the food item to update.
   * @param data - Partial data to update the food item with.
   * @returns The updated food item if found, otherwise null.
   */
  async update(
    id: string,
    data: Partial<IFoodItem>
  ): Promise<IFoodItem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await FoodItem.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Deletes a food item by its ID.
   * @param id - The ID of the food item to delete.
   * @returns The deleted food item if found, otherwise null.
   */
  async delete(id: string): Promise<IFoodItem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await FoodItem.findByIdAndDelete(id);
  }

  /**
   * Retrieves food items by vendor ID with pagination.
   * @param vendorId - The ID of the vendor.
   * @param options - Pagination options.
   * @returns Filtered food items with pagination data.
   */
  async getByVendor(
    vendorId: string,
    options: { offset?: number; limit?: number } = {}
  ): Promise<{
    foodItems: IFoodItem[];
    total: number;
    offset: number;
    limit: number;
  }> {
    if (!Types.ObjectId.isValid(vendorId)) {
      return { foodItems: [], total: 0, offset: 1, limit: options.limit || 10 };
    }
    return this.get({ vendor: new Types.ObjectId(vendorId) }, options);
  }

  // /**
  //  * Toggles the availability of a food item.
  //  * @param id - The ID of the food item.
  //  * @returns The updated food item if found, otherwise null.
  //  */
  // async toggleAvailability(id: string): Promise<IFoodItem | null> {
  //   if (!Types.ObjectId.isValid(id)) return null;
  //   const foodItem = await FoodItem.findById(id);
  //   if (!foodItem) return null;
  //   foodItem.available = !foodItem.available;
  //   return await foodItem.save();
  // }
}

export default new FoodItemService();
