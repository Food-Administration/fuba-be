import CompanyInventory, { CompanyInventoryDocument as CompanyInventoryDocument } from '../models/inventories/companyInventory.model';
import CustomError from '../utils/customError';
import { Types } from 'mongoose';
import User from '../models/user.model';

class CompanyInventoryService {
    static async createCompanyInventory(
        itemName: string,
        category: string,
        createdBy: string,
        quantity: number,
        status: string
    ): Promise<CompanyInventoryDocument> {
        if (!Types.ObjectId.isValid(createdBy)) {
            throw new CustomError('Invalid user ID format', 400);
        }
        const userId = new Types.ObjectId(createdBy);

        // Check if the vendor exists
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('user does not exist', 404);
        }

        const existingInventory = await CompanyInventory.findOne({ itemName, createdBy });
        if (existingInventory) {
            throw new CustomError('Inventory item already exists for this vendor', 400);
        }

        const inventory = new CompanyInventory({ itemName, category, createdBy, quantity, status });
        await inventory.save();
        return inventory;
    }

    static async getCompanyInventories(): Promise<CompanyInventoryDocument[]> {
        return CompanyInventory.find().populate('createdBy');
    }

    static async updateCompanyInventory(
        inventoryId: string,
        itemName: string,
        category: string,
        quantity: number,
        status: string
    ): Promise<CompanyInventoryDocument | null> {
        const inventory = await CompanyInventory.findById(inventoryId);
        if (!inventory) {
            throw new CustomError('Inventory item not found', 404);
        }

        inventory.itemName = itemName;
        inventory.category = category;
        inventory.quantity = quantity;
        inventory.status = status;
        await inventory.save();
        return inventory;
    }

    static async deleteCompanyInventory(inventoryId: string): Promise<void> {
        const inventory = await CompanyInventory.findById(inventoryId);
        if (!inventory) {
            throw new CustomError('Inventory item not found', 404);
        }

        await inventory.deleteOne();
    }
}

export default CompanyInventoryService;