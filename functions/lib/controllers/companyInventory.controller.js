"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const companyInventory_service_1 = __importDefault(require("../services/companyInventory.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class CompanyInventoryController {
}
_a = CompanyInventoryController;
CompanyInventoryController.createCompanyInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { itemName, category, createdBy, quantity, status } = req.body;
    const inventory = await companyInventory_service_1.default.createCompanyInventory(itemName, category, createdBy, quantity, status);
    res.status(201).json(inventory);
});
CompanyInventoryController.getCompanyInventories = (0, asyncHandler_1.default)(async (req, res) => {
    const inventories = await companyInventory_service_1.default.getCompanyInventories();
    res.status(200).json(inventories);
});
CompanyInventoryController.updateCompanyInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    const { itemName, category, quantity, status } = req.body;
    const inventory = await companyInventory_service_1.default.updateCompanyInventory(inventoryId, itemName, category, quantity, status);
    if (!inventory) {
        res.status(404).json({ message: 'Inventory item not found' });
        return;
    }
    res.status(200).json(inventory);
});
CompanyInventoryController.deleteCompanyInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    await companyInventory_service_1.default.deleteCompanyInventory(inventoryId);
    res.status(204).json({ message: 'Inventory item deleted successfully' });
});
exports.default = CompanyInventoryController;
//# sourceMappingURL=companyInventory.controller.js.map