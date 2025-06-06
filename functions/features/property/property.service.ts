import Property, { IProperty } from './property.model'; // Adjust path if needed
import { Types } from 'mongoose';

export class PropertyService {
  /**
   * Creates a new property.
   * @param data - Partial data for the property.
   * @returns The created property.
   */
  async create(data: Partial<IProperty>): Promise<IProperty> {
    const property = new Property(data);
    return await property.save();
  }

  /**
   * Retrieves properties based on the provided filter with pagination.
   * @param filter - Mongoose filter query.
   * @param options - Pagination options: page (1-based) and limit.
   * @returns An object containing properties, total count, page, and limit.
   */
  async get(
    filter: import('mongoose').FilterQuery<IProperty> = {},
    options: { page?: number; limit?: number } = {}
  ): Promise<{
    properties: IProperty[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(filter).skip(skip).limit(limit),
      Property.countDocuments(filter)
    ]);

    return { properties, total, page, limit };
  }

  /**
   * Retrieves a property by its ID.
   * @param id - The ID of the property.
   * @returns The property if found, otherwise null.
   */
  async getById(id: string): Promise<IProperty | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Property.findById(id);
  }

  /**
   * Updates a property by its ID.
   * @param id - The ID of the property to update.
   * @param data - Partial data to update the property with.
   * @returns The updated property if found, otherwise null.
   */
  async update(id: string, data: Partial<IProperty>): Promise<IProperty | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Property.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Deletes a property by its ID.
   * @param id - The ID of the property to delete.
   * @returns The deleted property if found, otherwise null.
   */
  async delete(id: string): Promise<IProperty | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Property.findByIdAndDelete(id);
  }
}

export default new PropertyService();