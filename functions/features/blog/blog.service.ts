import Blog, { IBlog } from './blog.model'; // Adjust path if needed
import { Types } from 'mongoose';

export class BlogService {
  /**
   * Creates a new blog.
   * @param data - Partial data for the blog.
   * @returns The created blog.
   */
  async create(data: Partial<IBlog>): Promise<IBlog> {
    const blog = new Blog(data);
    return await blog.save();
  }

  /**
   * Retrieves blogs based on the provided filter with pagination.
   * @param filter - Mongoose filter query.
   * @param options - Pagination options: page (1-based) and limit.
   * @returns An object containing blogs, total count, page and limit.
   */
  async get
    (filter: import('mongoose').FilterQuery<IBlog> = {},
      options: { page?: number; limit?: number } = {}
    ): Promise<{
      blogs: IBlog[];
      total: number;
      page: number;
      limit: number;
    }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(filter).skip(skip).limit(limit),
      Blog.countDocuments(filter)
    ]);

    return { blogs, total, page, limit };
  }

  /**
   * Retrieves a blog by its ID.
   * @param id - The ID of the blog.
   * @returns The blog if found, otherwise null.
   */
  async getById(id: string): Promise<IBlog | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Blog.findById(id);
  }

  /**
   * Updates a blog by its ID.
   * @param id - The ID of the blog to update.
   * @param data - Partial data to update the blog with.
   * @returns The updated blog if found, otherwise null.
   */
  async update(id: string, data: Partial<IBlog>): Promise<IBlog | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Blog.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Deletes a blog by its ID.
   * @param id - The ID of the blog to delete.
   * @returns The deleted blog if found, otherwise null.
   */
  async delete(id: string): Promise<IBlog | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Blog.findByIdAndDelete(id);
  }
}

export default new BlogService();