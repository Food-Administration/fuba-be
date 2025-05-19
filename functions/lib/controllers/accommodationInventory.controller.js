"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const accommodationInventory_service_1 = __importDefault(require("../services/accommodationInventory.service"));
class AccommodationInventoryController {
}
_a = AccommodationInventoryController;
AccommodationInventoryController.createAccommodationInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { roomName, address, roomType, roomsAvailable, location, capacity, checkOutTime, price, services, utilities, status, vendor } = req.body;
    const inventory = await accommodationInventory_service_1.default.createAccommodationInventory(roomName, address, roomType, roomsAvailable, location, capacity, price, checkOutTime, services, utilities, vendor, status);
    res.status(201).json(inventory);
});
AccommodationInventoryController.getAccommodationInventories = (0, asyncHandler_1.default)(async (req, res) => {
    const inventories = await accommodationInventory_service_1.default.getAccommodationInventories();
    res.status(200).json(inventories);
});
AccommodationInventoryController.getAccommodationInventoryById = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    const inventory = await accommodationInventory_service_1.default.getAccommodationInventoryById(inventoryId);
    if (!inventory) {
        res.status(404).json({ message: 'Accommodation item not found' });
        return;
    }
    res.status(200).json(inventory);
});
AccommodationInventoryController.updateAccommodationInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { roomName, address, roomType, roomsAvailable, location, capacity, checkOutTime, checkInTime, price, services, utilities, status } = req.body;
    const inventory = await accommodationInventory_service_1.default.updateAccommodationInventory(id, roomName, address, roomType, roomsAvailable, location, capacity, checkInTime, checkOutTime, price, services, utilities, status);
    if (!inventory) {
        res.status(404).json({ message: 'Inventory item not found' });
        return;
    }
    res.status(200).json(inventory);
});
AccommodationInventoryController.deleteAccommodationInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    await accommodationInventory_service_1.default.deleteAccommodationInventory(inventoryId);
    res.status(204).json({ message: 'Inventory item deleted successfully' });
});
exports.default = AccommodationInventoryController;
//# sourceMappingURL=accommodationInventory.controller.js.map