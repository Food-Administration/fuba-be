"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const vendor_service_1 = __importDefault(require("../services/vendor.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class VendorController {
}
_a = VendorController;
VendorController.createVendor = (0, asyncHandler_1.default)(async (req, res) => {
    // const userData: CreateUserDto = req.body;
    const vendorData = req.body;
    const vendor = await vendor_service_1.default.createVendor(vendorData);
    res.status(201).json(vendor);
});
VendorController.getVendors = (0, asyncHandler_1.default)(async (req, res) => {
    const users = await vendor_service_1.default.getVendors();
    res.status(200).json(users);
});
VendorController.getVendorById = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendorId } = req.params;
    //   console.log('userId: ', userId);
    const user = await vendor_service_1.default.getVendorById(vendorId);
    if (!user) {
        res.status(404).json({ message: 'Vendor not found' });
        return;
    }
    res.status(200).json(user);
});
VendorController.updateVendor = (0, asyncHandler_1.default)(async (req, res) => {
    const updateData = req.body;
    const vendor = await vendor_service_1.default.updateVendor(req.params.vendorId, updateData);
    if (!vendor) {
        res.status(404).json({ message: 'Vendor not found' });
        return;
    }
    res.status(200).json(vendor);
});
VendorController.deleteVendor = (0, asyncHandler_1.default)(async (req, res) => {
    const vendor = await vendor_service_1.default.deleteVendor(req.params.vendorId);
    if (!vendor) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.json({ message: 'User deleted successfully' });
});
VendorController.importVendors = (0, asyncHandler_1.default)(async (req, res) => {
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid Content-Type. Expected application/json.' });
        return;
    }
    const parsedData = req.body;
    if (!Array.isArray(parsedData)) {
        res.status(400).json({ message: 'Invalid input. Expected an array of vendors.' });
        return;
    }
    const requiredFields = ['email', 'vendorLegalName', 'businessType', 'vendorType', 'startDate', 'endDate', 'phNo', 'status'];
    const invalidEntries = parsedData.filter((item) => {
        return !requiredFields.every((field) => field in item && item[field]);
    });
    if (invalidEntries.length > 0) {
        res.status(400).json({
            message: 'Invalid input. Some user objects are missing required fields.',
            invalidEntries,
        });
        return;
    }
    try {
        const uniqueEmails = new Set();
        const filteredData = parsedData.filter((item) => {
            if (!item.email || uniqueEmails.has(item.email)) {
                return false;
            }
            uniqueEmails.add(item.email);
            return true;
        });
        console.log('Filtered data (no duplicates):', filteredData);
        if (filteredData.length === 0) {
            res.status(400).json({ message: 'Uploaded data is empty or contains only duplicates.' });
            return;
        }
        const result = await vendor_service_1.default.importVendors(filteredData);
        res.status(200).json({
            message: 'Users imported successfully',
            stats: {
                totalAttempted: filteredData.length,
                successfullyImported: result.successCount,
                duplicatesFound: result.duplicateEmails.length,
                errorsOccurred: result.errors.length,
            },
            duplicates: result.duplicateEmails,
            errors: result.errors,
        });
    }
    catch (error) {
        console.error('Error processing uploaded data:', error);
        res.status(500).json({ message: 'Failed to process uploaded data', error: error.message });
    }
});
exports.default = VendorController;
//# sourceMappingURL=vendor.controller.js.map