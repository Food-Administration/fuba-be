import Restaurant, { IRestaurant } from "./restaurant.model";
import { Types } from "mongoose";
import FileService from "../file/file.service";
import cloudinary from "../../config/cloudinary";

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
   * @param options - Optional filters: search (filter items by name), promo (filter by promo type), mapLocation (check distance).
   * @returns The restaurant if found, otherwise null.
   */
  async getById(
    id: string,
    options: { search?: string; promo?: string; mapLocation?: string } = {}
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

    // Add mapLocation filter if provided (latitude,longitude,radius)
    if (options.mapLocation) {
      const locationParts = options.mapLocation.split(',');
      if (locationParts.length >= 2) {
        const latitude = parseFloat(locationParts[0]);
        const longitude = parseFloat(locationParts[1]);
        const radius = locationParts.length > 2 ? parseFloat(locationParts[2]) : 10; // Default 10km radius

        if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(radius)) {
          query.mapLocation = {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude] // MongoDB uses [longitude, latitude]
              },
              $maxDistance: radius * 1000 // Convert km to meters
            }
          };
        }
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

  async toggleFavorite(userId: string, restaurantId: string): Promise<IRestaurant | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(restaurantId)) {
      return null;
    }

    // Implement the logic to toggle favorite status here
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return null;
    }
    restaurant.isFavorite = !restaurant.isFavorite;
    await restaurant.save();
    return restaurant;
  }

  /**
   * Updates the restaurant image.
   * @param id - The ID of the restaurant.
   * @param file - The uploaded file from multer.
   * @param uploadedBy - The ID of the user uploading the image.
   * @returns The updated restaurant if found, otherwise null.
   */
  async updateImage(
    id: string,
    file: Express.Multer.File,
    uploadedBy?: string
  ): Promise<IRestaurant | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return null;

    // Delete old image from Cloudinary if exists
    if (restaurant.image) {
      try {
        // Extract public ID from URL if it's a Cloudinary URL
        const urlParts = restaurant.image.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (error) {
        console.error("Failed to delete old restaurant image:", error);
      }
    }

    // Save file metadata
    await FileService.saveFileMetadata(file, {
      uploadedBy,
      folder: "restaurants",
      associatedModel: "Restaurant",
      associatedId: id,
    });

    // Update restaurant with new image URL
    return await Restaurant.findByIdAndUpdate(
      id,
      { image: file.path },
      { new: true }
    ).populate("items", "name category description price image");
  }

  /**
   * Creates a new restaurant with an image.
   * @param data - Partial data for the restaurant.
   * @param file - The uploaded image file (optional).
   * @param uploadedBy - The ID of the user uploading the image.
   * @returns The created restaurant.
   */
  async createWithImage(
    data: Partial<IRestaurant>,
    file?: Express.Multer.File,
    uploadedBy?: string
  ): Promise<IRestaurant> {
    // If there's a file, set the image URL
    if (file) {
      data.image = file.path;
    }

    const restaurant = new Restaurant(data);
    const savedRestaurant = await restaurant.save();

    // Save file metadata if file was uploaded
    if (file) {
      await FileService.saveFileMetadata(file, {
        uploadedBy,
        folder: "restaurants",
        associatedModel: "Restaurant",
        associatedId: (savedRestaurant._id as Types.ObjectId).toString(),
      });
    }

    return savedRestaurant;
  }

  /**
   * Deletes a restaurant and its associated image.
   * @param id - The ID of the restaurant to delete.
   * @returns The deleted restaurant if found, otherwise null.
   */
  async deleteWithImage(id: string): Promise<IRestaurant | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return null;

    // Delete image from Cloudinary if exists
    if (restaurant.image) {
      try {
        const urlParts = restaurant.image.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (error) {
        console.error("Failed to delete restaurant image:", error);
      }
    }

    return await Restaurant.findByIdAndDelete(id);
  }
}

export default new RestaurantService();
