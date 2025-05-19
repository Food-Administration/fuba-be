"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = __importDefault(require("../utils/customError"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = require("mongoose");
const transportInventory_model_1 = __importDefault(require("../models/inventories/transportInventory.model"));
class TransportInventoryService {
    static async createTransportInventory(transportType, departureLocation, departureTime, arrivalLocation, arrivalTime, price, seatsAvailable, vendor, status) {
        console.log("Vendor:", vendor, "Type:", typeof vendor);
        // Validate and convert vendorId to ObjectId
        if (!mongoose_1.Types.ObjectId.isValid(vendor)) {
            throw new customError_1.default('Invalid vendor ID format', 400);
        }
        const vendorId = new mongoose_1.Types.ObjectId(vendor);
        // Check if the vendor exists
        const existingVendor = await user_model_1.default.findById(vendorId);
        if (!existingVendor) {
            throw new customError_1.default('Vendor does not exist', 404);
        }
        // Create and save the new inventory
        const inventory = new transportInventory_model_1.default({ price, vendor: vendorId, transportType, status, departureLocation, departureTime, arrivalLocation, arrivalTime, seatsAvailable });
        await inventory.save();
        return inventory;
    }
    static async getTransportInventories() {
        return transportInventory_model_1.default.find().populate('vendor');
    }
    static async getTransportInventoryById(inventoryId) {
        return transportInventory_model_1.default.findById(inventoryId).populate('vendor');
    }
    static async getTransportInventoryByVendor(vendorId) {
        return transportInventory_model_1.default.find({ vendor: vendorId }).populate('vendor');
    }
    static async updateTransportInventory(id, transportType, departureLocation, departureTime, arrivalLocation, arrivalTime, price, seatsAvailable, status) {
        const inventory = await transportInventory_model_1.default.findById(id);
        if (!inventory) {
            throw new customError_1.default('Inventory item not found', 404);
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
    static async deleteTransportInventory(inventoryId) {
        const inventory = await transportInventory_model_1.default.findById(inventoryId);
        if (!inventory) {
            throw new customError_1.default('Inventory item not found', 404);
        }
        await inventory.deleteOne();
    }
}
exports.default = TransportInventoryService;
//# sourceMappingURL=transportInventory.service.js.map