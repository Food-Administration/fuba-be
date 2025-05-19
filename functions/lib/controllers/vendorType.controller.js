"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const vendorType_service_1 = __importDefault(require("../services/vendorType.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class VendorTypeController {
}
_a = VendorTypeController;
VendorTypeController.createVendorType = (0, asyncHandler_1.default)(async (req, res) => {
    const { name, description } = req.body;
    const vendorType = await vendorType_service_1.default.createVendorType(name, description);
    res.status(201).json(vendorType);
});
VendorTypeController.getVendorTypes = (0, asyncHandler_1.default)(async (req, res) => {
    const vendorTypes = await vendorType_service_1.default.getVendorTypes();
    res.status(200).json(vendorTypes);
});
VendorTypeController.getVendorTypeById = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendorTypeId } = req.params;
    const vendorType = await vendorType_service_1.default.getVendorTypeById(vendorTypeId);
    if (!vendorType) {
        res.status(404).json({ message: 'Vendor type not found' });
        return;
    }
    res.status(200).json(vendorType);
});
VendorTypeController.updateVendorType = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendorTypeId } = req.params;
    const { name, description } = req.body;
    const vendorType = await vendorType_service_1.default.updateVendorType(vendorTypeId, name, description);
    if (!vendorType) {
        res.status(404).json({ message: 'Vendor type not found' });
        return;
    }
    res.status(200).json(vendorType);
});
VendorTypeController.deleteVendorType = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendorTypeId } = req.params;
    await vendorType_service_1.default.deleteVendorType(vendorTypeId);
    res.status(204).json({ message: 'Vendor type deleted successfully' });
});
exports.default = VendorTypeController;
//# sourceMappingURL=vendorType.controller.js.map