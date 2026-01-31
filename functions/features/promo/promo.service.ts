import Promo, { IPromo } from "./promo.model";
import { Types, FilterQuery } from "mongoose";
import FileService from "../file/file.service";
import cloudinary from "../../config/cloudinary";

export class PromoService {
  async create(data: Partial<IPromo>): Promise<IPromo> {
    const promo = new Promo(data);
    return await promo.save();
  }

  async createWithImage(
    data: Partial<IPromo>,
    file?: Express.Multer.File,
    uploadedBy?: string
  ): Promise<IPromo> {
    if (file) {
      data.image = file.path; // Cloudinary URL from multer-storage-cloudinary
    }

    const promo = new Promo(data);
    const saved = await promo.save();

    if (file) {
      await FileService.saveFileMetadata(file, {
        uploadedBy,
        folder: "promos",
        associatedModel: "Promo",
        associatedId: (saved._id as Types.ObjectId).toString(),
      });
    }

    return saved;
  }

  async get(
    filter: FilterQuery<IPromo> = {},
    options: { offset?: number; limit?: number } = {}
  ): Promise<{ promos: IPromo[]; total: number; offset: number; limit: number }> {
    const offset = Math.max(0, options.offset || 0);
    const limit = Math.max(1, options.limit || 10);

    const [promos, total] = await Promise.all([
      Promo.find(filter)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({ path: "restaurant", select: "name image state" }),
      Promo.countDocuments(filter),
    ]);

    return { promos, total, offset, limit };
  }

  async getById(id: string): Promise<IPromo | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Promo.findById(id).populate({
      path: "restaurant",
      select: "name image state",
    });
  }

  async getByRestaurant(
    restaurantId: string,
    options: { offset?: number; limit?: number } = {}
  ): Promise<{ promos: IPromo[]; total: number; offset: number; limit: number }> {
    if (!Types.ObjectId.isValid(restaurantId)) {
      return { promos: [], total: 0, offset: 0, limit: options.limit || 10 };
    }
    return this.get({ restaurant: new Types.ObjectId(restaurantId) }, options);
  }

  async update(id: string, data: Partial<IPromo>): Promise<IPromo | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Promo.findByIdAndUpdate(id, data, { new: true });
  }

  async updateImage(
    id: string,
    file: Express.Multer.File,
    uploadedBy?: string
  ): Promise<IPromo | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const promo = await Promo.findById(id);
    if (!promo) return null;

    // Delete old image from Cloudinary if exists
    if (promo.image) {
      try {
        const urlParts = promo.image.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (error) {
        console.error("Failed to delete old promo image:", error);
      }
    }

    // Save file metadata
    await FileService.saveFileMetadata(file, {
      uploadedBy,
      folder: "promos",
      associatedModel: "Promo",
      associatedId: id,
    });

    return await Promo.findByIdAndUpdate(id, { image: file.path }, { new: true });
  }

  async delete(id: string): Promise<IPromo | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const promo = await Promo.findById(id);
    if (!promo) return null;

    if (promo.image) {
      try {
        const urlParts = promo.image.split("/");
        const publicIdWithExtension = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (error) {
        console.error("Failed to delete promo image:", error);
      }
    }

    return await Promo.findByIdAndDelete(id);
  }
}

export default new PromoService();
