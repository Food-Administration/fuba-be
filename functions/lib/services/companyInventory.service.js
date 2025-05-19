"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const companyInventory_model_1 = __importDefault(require("../models/inventories/companyInventory.model"));
const customError_1 = __importDefault(require("../utils/customError"));
const mongoose_1 = require("mongoose");
const user_model_1 = __importDefault(require("../models/user.model"));
class CompanyInventoryService {
    static async createCompanyInventory(itemName, category, createdBy, quantity, status) {
        if (!mongoose_1.Types.ObjectId.isValid(createdBy)) {
            throw new customError_1.default('Invalid user ID format', 400);
        }
        const userId = new mongoose_1.Types.ObjectId(createdBy);
        // Check if the vendor exists
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new customError_1.default('user does not exist', 404);
        }
        const existingInventory = await companyInventory_model_1.default.findOne({ itemName, createdBy });
        if (existingInventory) {
            throw new customError_1.default('Inventory item already exists for this vendor', 400);
        }
        const inventory = new companyInventory_model_1.default({ itemName, category, createdBy, quantity, status });
        await inventory.save();
        return inventory;
    }
    static async getCompanyInventories() {
        return companyInventory_model_1.default.find().populate('createdBy');
    }
    static async updateCompanyInventory(inventoryId, itemName, category, quantity, status) {
        const inventory = await companyInventory_model_1.default.findById(inventoryId);
        if (!inventory) {
            throw new customError_1.default('Inventory item not found', 404);
        }
        inventory.itemName = itemName;
        inventory.category = category;
        inventory.quantity = quantity;
        inventory.status = status;
        await inventory.save();
        return inventory;
    }
    static async deleteCompanyInventory(inventoryId) {
        const inventory = await companyInventory_model_1.default.findById(inventoryId);
        if (!inventory) {
            throw new customError_1.default('Inventory item not found', 404);
        }
        await inventory.deleteOne();
    }
}
exports.default = CompanyInventoryService;
//# sourceMappingURL=companyInventory.service.js.map