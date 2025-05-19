import VendorInventory, { VendorInventoryDocument } from '../models/inventories/vendorInventory.model';
import CustomError from '../utils/customError';
import { Types } from 'mongoose';
import User from '../models/user.model';

class VendorInventoryService {
    static async createVendorInventory(
        itemName: string,
        category: string,
        price: number,
        vendor: string, // Accept vendor as a string from the frontend
        quantity: number,
        status: string
    ): Promise<VendorInventoryDocument> {
        console.log("Creating vendor inventory with itemName:", itemName, "and vendor:", vendor);

        // Validate and convert vendorId to ObjectId
        if (!Types.ObjectId.isValid(vendor)) {
            throw new CustomError('Invalid vendor ID format', 400);
        }
        const vendorId = new Types.ObjectId(vendor);

        // Check if the vendor exists
        const existingVendor = await User.findById(vendorId);
        if (!existingVendor) {
            throw new CustomError('Vendor does not exist', 404);
        }

        // Check if the inventory item already exists for the vendor
        const existingInventory = await VendorInventory.findOne({ itemName, vendor: vendorId });
        if (existingInventory) {
            throw new CustomError('Inventory item already exists for this vendor', 400);
        }

        // Create and save the new inventory item
        const inventory = new VendorInventory({ itemName, category, price, vendor: vendorId, quantity, status });
        await inventory.save();
        return inventory;
    }

    static async getVendorInventories(): Promise<VendorInventoryDocument[]> {
        return VendorInventory.find().populate('vendor');
    }

    static async getVendorInventoryById(inventoryId: string): Promise<VendorInventoryDocument | null> {
        return VendorInventory.findById(inventoryId).populate('vendor');
    }

    static async getVendorInventoryByVendor(vendorId: string): Promise<VendorInventoryDocument[]> {
        return VendorInventory.find({ vendor: vendorId }).populate('vendor');
    }

    static async updateVendorInventory(
        inventoryId: string,
        itemName: string,
        category: string,
        price: number,
        quantity: number,
        status: string
    ): Promise<VendorInventoryDocument | null> {
        const inventory = await VendorInventory.findById(inventoryId);
        if (!inventory) {
            throw new CustomError('Inventory item not found', 404);
        }

        inventory.itemName = itemName;
        inventory.category = category;
        inventory.price = price;
        inventory.quantity = quantity;
        inventory.status = status;
        await inventory.save();
        return inventory;
    }

    static async deleteVendorInventory(inventoryId: string): Promise<void> {
        const inventory = await VendorInventory.findById(inventoryId);
        if (!inventory) {
            throw new CustomError('Inventory item not found', 404);
        }

        await inventory.deleteOne();
    }
}

export default VendorInventoryService;