"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const transportInventory_service_1 = __importDefault(require("../services/transportInventory.service"));
class TransportInventoryController {
}
_a = TransportInventoryController;
TransportInventoryController.createTransportInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { transportType, departureLocation, departureTime, arrivalLocation, arrivalTime, price, seatsAvailable, status, vendor } = req.body;
    const inventory = await transportInventory_service_1.default.createTransportInventory(transportType, departureLocation, departureTime, arrivalLocation, arrivalTime, price, seatsAvailable, vendor, status);
    res.status(201).json(inventory);
});
TransportInventoryController.getTransportInventories = (0, asyncHandler_1.default)(async (req, res) => {
    const inventories = await transportInventory_service_1.default.getTransportInventories();
    res.status(200).json(inventories);
});
TransportInventoryController.getTransportInventoryById = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    const inventory = await transportInventory_service_1.default.getTransportInventoryById(inventoryId);
    if (!inventory) {
        res.status(404).json({ message: 'Transport item not found' });
        return;
    }
    res.status(200).json(inventory);
});
TransportInventoryController.updateTransportInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    console.log('inventoryId: ', id);
    const { transportType, departureLocation, departureTime, arrivalLocation, arrivalTime, price, seatsAvailable, status } = req.body;
    const inventory = await transportInventory_service_1.default.updateTransportInventory(id, transportType, departureLocation, departureTime, arrivalLocation, arrivalTime, price, seatsAvailable, status);
    if (!inventory) {
        res.status(404).json({ message: 'Inventory item not found' });
        return;
    }
    res.status(200).json(inventory);
});
TransportInventoryController.deleteTransportInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { inventoryId } = req.params;
    await transportInventory_service_1.default.deleteTransportInventory(inventoryId);
    res.status(204).json({ message: 'Inventory item deleted successfully' });
});
exports.default = TransportInventoryController;
//# sourceMappingURL=transportInventory.controller.js.map