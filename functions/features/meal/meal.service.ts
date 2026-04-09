import Meal, { IMeal } from "./meal.model";
import { Types, FilterQuery } from "mongoose";
import FileService from "../file/file.service";
import cloudinary from "../../config/cloudinary";

class MealService {
  async create(data: Partial<IMeal>): Promise<IMeal> {
    const meal = new Meal(data);
    return await meal.save();
  }

  async get(
    filter: FilterQuery<IMeal> = {},
    options: { offset?: number; limit?: number } = {}
  ): Promise<{ meals: IMeal[]; total: number; offset: number; limit: number }> {
    const offset = Math.max(0, options.offset || 0);
    const limit = Math.max(1, options.limit || 10);

    const [meals, total] = await Promise.all([
      Meal.find(filter).skip(offset).limit(limit).populate("vendor", "first_name last_name email"),
      Meal.countDocuments(filter),
    ]);

    return { meals, total, offset, limit };
  }

  async getById(id: string): Promise<IMeal | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Meal.findById(id).populate("vendor", "first_name last_name email");
  }

  async update(id: string, data: Partial<IMeal>): Promise<IMeal | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Meal.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IMeal | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Meal.findByIdAndDelete(id);
  }

  async getByVendor(
    vendorId: string,
    options: { offset?: number; limit?: number } = {}
  ): Promise<{ meals: IMeal[]; total: number; offset: number; limit: number }> {
    if (!Types.ObjectId.isValid(vendorId)) {
      return { meals: [], total: 0, offset: 0, limit: options.limit || 10 };
    }
    return this.get({ vendor: new Types.ObjectId(vendorId) }, options);
  }

  async createWithImage(
    data: Partial<IMeal>,
    file?: Express.Multer.File,
    uploadedBy?: string
  ): Promise<IMeal> {
    if (file) {
      data.image = file.path;
    }

    const meal = new Meal(data);
    const savedMeal = await meal.save();

    if (file) {
      await FileService.saveFileMetadata(file, {
        uploadedBy,
        folder: "meals",
        associatedModel: "Meal",
        associatedId: (savedMeal._id as Types.ObjectId).toString(),
      });
    }

    return savedMeal;
  }

  async updateImage(
    id: string,
    file: Express.Multer.File,
    uploadedBy?: string
  ): Promise<IMeal | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const meal = await Meal.findById(id);
    if (!meal) return null;

    if (meal.image) {
      try {
        const urlParts = meal.image.split("/");
        const publicIdWithExt = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (error) {
        console.error("Failed to delete old meal image:", error);
      }
    }

    await FileService.saveFileMetadata(file, {
      uploadedBy,
      folder: "meals",
      associatedModel: "Meal",
      associatedId: id,
    });

    return await Meal.findByIdAndUpdate(id, { image: file.path }, { new: true });
  }

  async deleteWithImage(id: string): Promise<IMeal | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const meal = await Meal.findById(id);
    if (!meal) return null;

    if (meal.image) {
      try {
        const urlParts = meal.image.split("/");
        const publicIdWithExt = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (error) {
        console.error("Failed to delete meal image:", error);
      }
    }

    return await Meal.findByIdAndDelete(id);
  }

  async toggleStock(id: string): Promise<IMeal | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const meal = await Meal.findById(id);
    if (!meal) return null;
    meal.isInStock = !meal.isInStock;
    return await meal.save();
  }
}

export default new MealService();
