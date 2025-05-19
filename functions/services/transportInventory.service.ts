import CustomError from '../utils/customError';
import User from '../models/user.model';
import { Types } from 'mongoose';
import TransportInventory, { TransportInventoryDocument } from '../models/inventories/transportInventory.model';

class TransportInventoryService {
    static async createTransportInventory(
        transportType: string,
        departureLocation: string,
        departureTime: Date,
        arrivalLocation: string,
        arrivalTime: Date,
        price: number,
        seatsAvailable: number,
        vendor: string,
        status: string
    ): Promise<TransportInventoryDocument> {

        console.log("Vendor:", vendor, "Type:", typeof vendor);
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

        // Create and save the new inventory
        const inventory = new TransportInventory({ price, vendor: vendorId, transportType, status, departureLocation, departureTime, arrivalLocation, arrivalTime, seatsAvailable });
        await inventory.save();
        return inventory;
    }

    static async getTransportInventories(): Promise<TransportInventoryDocument[]> {
        return TransportInventory.find().populate('vendor');
    }

    static async getTransportInventoryById(inventoryId: string): Promise<TransportInventoryDocument | null> {
        return TransportInventory.findById(inventoryId).populate('vendor');
    }

    static async getTransportInventoryByVendor(vendorId: string): Promise<TransportInventoryDocument[]> {
        return TransportInventory.find({ vendor: vendorId }).populate('vendor');
    }

    static async updateTransportInventory(
        id: string,
        transportType: string,
        departureLocation: string,
        departureTime: Date,
        arrivalLocation: string,
        arrivalTime: Date,
        price: number,
        seatsAvailable: number,
        status: string
    ): Promise<TransportInventoryDocument | null> {
        const inventory = await TransportInventory.findById(id);
        if (!inventory) {
            throw new CustomError('Inventory item not found', 404);
        }

        inventory.transportType = transportType;
        inventory.departureLocation = departureLocation;
        inventory.departureTime = departureTime;
        inventory.arrivalLocation = arrivalLocation;
        inventory.arrivalTime = arrivalTime;
        inventory.seatsAvailable = seatsAvailable;
        inventory.price = price;
        inventory.status = status;

        await inventory.save();
        return inventory;
    }

    static async deleteTransportInventory(inventoryId: string): Promise<void> {
        const inventory = await TransportInventory.findById(inventoryId);
        if (!inventory) {
            throw new CustomError('Inventory item not found', 404);
        }

        await inventory.deleteOne();
    }
}

export default TransportInventoryService;