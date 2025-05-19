import VendorType, { VendorTypeDocument } from '../models/vendorType.model';
import CustomError from '../utils/customError';

class VendorTypeService {
    static async createVendorType(name: string, description?: string): Promise<VendorTypeDocument> {
        const existingVendorType = await VendorType.findOne({ name });
        if (existingVendorType) {
            throw new CustomError('Vendor type already exists', 400);
        }

        const vendorType = new VendorType({ name, description });
        await vendorType.save();
        return vendorType;
    }

    static async getVendorTypes(): Promise<VendorTypeDocument[]> {
        return VendorType.find();
    }

    static async getVendorTypeById(vendorTypeId: string): Promise<VendorTypeDocument | null> {
        return VendorType.findById(vendorTypeId);
    }

    static async getVendorTypeByName(name: string): Promise<VendorTypeDocument | null> {
        return VendorType.findOne({ name });
    }

    static async updateVendorType(vendorTypeId: string, name: string, description?: string): Promise<VendorTypeDocument | null> {
        const vendorType = await VendorType.findById(vendorTypeId);
        if (!vendorType) {
            throw new CustomError('Vendor type not found', 404);
        }

        vendorType.name = name;
        vendorType.description = description;
        await vendorType.save();
        return vendorType;
    }

    static async deleteVendorType(vendorTypeId: string): Promise<void> {
        const vendorType = await VendorType.findById(vendorTypeId);
        if (!vendorType) {
            throw new CustomError('Vendor type not found', 404);
        }

        await vendorType.deleteOne();
    }
}

export default VendorTypeService;