"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const vendorInventory_service_1 = __importDefault(require("../services/vendorInventory.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class VendorInventoryController {
}
_a = VendorInventoryController;
VendorInventoryController.createVendorInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { itemName, category, price, vendor, quantity, status } = req.body;
    const inventory = await vendorInventory_service_1.default.createVendorInventory(itemName, category, price, vendor, quantity, status);
    res.status(201).json(inventory);
});
VendorInventoryController.getVendorInventories = (0, asyncHandler_1.default)(async (req, res) => {
    const inventories = await vendorInventory_service_1.default.getVendorInventories();
    res.status(200).json(inventories);
});
VendorInventoryController.getVendorInventoryById = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    const inventory = await vendorInventory_service_1.default.getVendorInventoryById(inventoryId);
    if (!inventory) {
        res.status(404).json({ message: 'Inventory item not found' });
        return;
    }
    res.status(200).json(inventory);
});
VendorInventoryController.getVendorInventoryByVendor = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendorId } = req.params;
    const inventories = await vendorInventory_service_1.default.getVendorInventoryByVendor(vendorId);
    res.status(200).json(inventories);
});
VendorInventoryController.updateVendorInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    const { itemName, category, price, quantity, status } = req.body;
    const inventory = await vendorInventory_service_1.default.updateVendorInventory(inventoryId, itemName, category, price, quantity, status);
    if (!inventory) {
        res.status(404).json({ message: 'Inventory item not found' });
        return;
    }
    res.status(200).json(inventory);
});
VendorInventoryController.deleteVendorInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    await vendorInventory_service_1.default.deleteVendorInventory(inventoryId);
    res.status(204).json({ message: 'Inventory item deleted successfully' });
});
exports.default = VendorInventoryController;
//# sourceMappingURL=vendorInventory.controller.js.map