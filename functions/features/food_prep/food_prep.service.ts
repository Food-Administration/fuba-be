import FoodPrep, { IFoodPrep } from './food_prep.model';
import { Types } from 'mongoose';

export class FoodPrepService {
  /**
   * Creates a new food preparation entry
   * @param data - Partial food prep data
   * @returns The created food prep entry
   */
  async create(data: Partial<IFoodPrep>): Promise<IFoodPrep> {
    const foodPrep = new FoodPrep(data);
    return await foodPrep.save();
  }

  /**
   * Retrieves food prep entries with pagination
   * @param filter - Mongoose filter query
   * @param options - Pagination options
   * @returns Food prep entries with pagination data
   */
  async get(
    filter: import('mongoose').FilterQuery<IFoodPrep> = {},
    options: { page?: number; limit?: number } = {}
  ): Promise<{
    foodPreps: IFoodPrep[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    const [foodPreps, total] = await Promise.all([
      FoodPrep.find(filter)
        .populate('consumer', 'name email')
        .populate('items.foodItem', 'name price')
        .skip(skip)
        .limit(limit),
      FoodPrep.countDocuments(filter)
    ]);

    return { foodPreps, total, page, limit };
  }

  /**
   * Gets food prep entry by ID
   * @param id - Food prep ID
   * @returns The food prep entry if found
   */
  async getById(id: string): Promise<IFoodPrep | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await FoodPrep.findById(id)
      .populate('consumer', 'name email')
      .populate('items.foodItem', 'name price');
  }

  /**
   * Updates food prep entry
   * @param id - Food prep ID
   * @param data - Update data
   * @returns Updated food prep entry
   */
  async update(id: string, data: Partial<IFoodPrep>): Promise<IFoodPrep | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await FoodPrep.findByIdAndUpdate(
      id,
      data,
      { new: true }
    ).populate('consumer items.foodItem');
  }

  /**
   * Gets food prep entries by consumer ID
   * @param consumerId - Consumer user ID
   * @param options - Pagination options
   * @returns Consumer's food prep entries
   */
  async getByConsumer(
    consumerId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    if (!Types.ObjectId.isValid(consumerId)) {
      return { foodPreps: [], total: 0, page: 1, limit: options.limit || 10 };
    }
    return this.get({ consumer: new Types.ObjectId(consumerId) }, options);
  }

  /**
   * Deletes a food prep entry
   * @param id - Food prep ID
   * @returns Deleted food prep entry
   */
  async delete(id: string): Promise<IFoodPrep | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await FoodPrep.findByIdAndDelete(id);
  }
}

export default new FoodPrepService();