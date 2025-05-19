import CustomError from '../utils/customError';
import User from '../models/user.model';
import { Types } from 'mongoose';
import AccomodationInventory, { AccommodationInventoryDocument } from '../models/inventories/accommodationInventory.model';

class AccommodationInventoryService {
    static async createAccommodationInventory(
        roomName: string,
        address: string,
        roomType: string,
        roomsAvailable: number,
        location: string,
        capacity: number,
        price: number,
        checkOutTime: Date,
        services: string[],
        utilities: string[],
        vendor: string,
        status: string
    ): Promise<AccommodationInventoryDocument> {

        if (!Types.ObjectId.isValid(vendor)) {
            throw new CustomError('Invalid vendor ID format', 400);
        }
        const vendorId = new Types.ObjectId(vendor);

        const existingVendor = await User.findById(vendorId);
        if (!existingVendor) {
            throw new CustomError('Vendor does not exist', 404);
        }

        const inventory = new AccomodationInventory({ price, vendor: vendorId, roomName, roomsAvailable, address, roomType, location, capacity, checkOutTime, services, utilities, status });
        await inventory.save();
        return inventory;
    }

    static async getAccommodationInventories(): Promise<AccommodationInventoryDocument[]> {
        return AccomodationInventory.find().populate('vendor');
    }

    static async getAccommodationInventoryById(inventoryId: string): Promise<AccommodationInventoryDocument | null> {
        return AccomodationInventory.findById(inventoryId).populate('vendor');
    }

    static async updateAccommodationInventory(
        id: string,
        roomName: string,
        address: string,
        roomType: string,
        roomsAvailable: number,
        location: string,
        capacity: number,
        checkInTime: Date,
        checkOutTime: Date,
        price: number,
        services: string[],
        utilities: string[],
        status: string
    ): Promise<AccommodationInventoryDocument | null> {
        const inventory = await AccomodationInventory.findById(id);
        if (!inventory) {
            throw new CustomError('Inventory item not found', 404);
        }

        inventory.roomName = roomName;
        inventory.address = address;
        inventory.roomType = roomType;
        inventory.location = location;
        inventory.roomsAvailable = roomsAvailable;
        inventory.capacity = capacity;
        inventory.checkInTime = checkInTime;
        inventory.checkOutTime = checkOutTime;
        inventory.price = price;
        inventory.services = services;
        inventory.utilities = utilities;
        inventory.status = status;

        await inventory.save();
        return inventory;
    }

    static async deleteAccommodationInventory(inventoryId: string): Promise<void> {
        const inventory = await AccomodationInventory.findById(inventoryId);
        if (!inventory) {
            throw new CustomError('Inventory item not found', 404);
        }

        await inventory.deleteOne();
    }
}

export default AccommodationInventoryService;