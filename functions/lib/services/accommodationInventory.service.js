"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = __importDefault(require("../utils/customError"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = require("mongoose");
const accommodationInventory_model_1 = __importDefault(require("../models/inventories/accommodationInventory.model"));
class AccommodationInventoryService {
    static async createAccommodationInventory(roomName, address, roomType, roomsAvailable, location, capacity, price, checkOutTime, services, utilities, vendor, status) {
        if (!mongoose_1.Types.ObjectId.isValid(vendor)) {
            throw new customError_1.default('Invalid vendor ID format', 400);
        }
        const vendorId = new mongoose_1.Types.ObjectId(vendor);
        const existingVendor = await user_model_1.default.findById(vendorId);
        if (!existingVendor) {
            throw new customError_1.default('Vendor does not exist', 404);
        }
        const inventory = new accommodationInventory_model_1.default({ price, vendor: vendorId, roomName, roomsAvailable, address, roomType, location, capacity, checkOutTime, services, utilities, status });
        await inventory.save();
        return inventory;
    }
    static async getAccommodationInventories() {
        return accommodationInventory_model_1.default.find().populate('vendor');
    }
    static async getAccommodationInventoryById(inventoryId) {
        return accommodationInventory_model_1.default.findById(inventoryId).populate('vendor');
    }
    static async updateAccommodationInventory(id, roomName, address, roomType, roomsAvailable, location, capacity, checkInTime, checkOutTime, price, services, utilities, status) {
        const inventory = await accommodationInventory_model_1.default.findById(id);
        if (!inventory) {
            throw new customError_1.default('Inventory item not found', 404);
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
    static async deleteAccommodationInventory(inventoryId) {
        const inventory = await accommodationInventory_model_1.default.findById(inventoryId);
        if (!inventory) {
            throw new customError_1.default('Inventory item not found', 404);
        }
        await inventory.deleteOne();
    }
}
exports.default = AccommodationInventoryService;
//# sourceMappingURL=accommodationInventory.service.js.map