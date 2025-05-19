"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendorInventory_model_1 = __importDefault(require("../models/inventories/vendorInventory.model"));
const customError_1 = __importDefault(require("../utils/customError"));
const mongoose_1 = require("mongoose");
const user_model_1 = __importDefault(require("../models/user.model"));
class VendorInventoryService {
    static async createVendorInventory(itemName, category, price, vendor, // Accept vendor as a string from the frontend
    quantity, status) {
        console.log("Creating vendor inventory with itemName:", itemName, "and vendor:", vendor);
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
        // Check if the inventory item already exists for the vendor
        const existingInventory = await vendorInventory_model_1.default.findOne({ itemName, vendor: vendorId });
        if (existingInventory) {
            throw new customError_1.default('Inventory item already exists for this vendor', 400);
        }
        // Create and save the new inventory item
        const inventory = new vendorInventory_model_1.default({ itemName, category, price, vendor: vendorId, quantity, status });
        await inventory.save();
        return inventory;
    }
    static async getVendorInventories() {
        return vendorInventory_model_1.default.find().populate('vendor');
    }
    static async getVendorInventoryById(inventoryId) {
        return vendorInventory_model_1.default.findById(inventoryId).populate('vendor');
    }
    static async getVendorInventoryByVendor(vendorId) {
        return vendorInventory_model_1.default.find({ vendor: vendorId }).populate('vendor');
    }
    static async updateVendorInventory(inventoryId, itemName, category, price, quantity, status) {
        const inventory = await vendorInventory_model_1.default.findById(inventoryId);
        if (!inventory) {
            throw new customError_1.default('Inventory item not found', 404);
        }
        inventory.itemName = itemName;
        inventory.category = category;
        inventory.price = price;
        inventory.quantity = quantity;
        inventory.status = status;
        await inventory.save();
        return inventory;
    }
    static async deleteVendorInventory(inventoryId) {
        const inventory = await vendorInventory_model_1.default.findById(inventoryId);
        if (!inventory) {
            throw new customError_1.default('Inventory item not found', 404);
        }
        await inventory.deleteOne();
    }
}
exports.default = VendorInventoryService;
//# sourceMappingURL=vendorInventory.service.js.map