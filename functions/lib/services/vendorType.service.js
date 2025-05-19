"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendorType_model_1 = __importDefault(require("../models/vendorType.model"));
const customError_1 = __importDefault(require("../utils/customError"));
class VendorTypeService {
    static async createVendorType(name, description) {
        const existingVendorType = await vendorType_model_1.default.findOne({ name });
        if (existingVendorType) {
            throw new customError_1.default('Vendor type already exists', 400);
        }
        const vendorType = new vendorType_model_1.default({ name, description });
        await vendorType.save();
        return vendorType;
    }
    static async getVendorTypes() {
        return vendorType_model_1.default.find();
    }
    static async getVendorTypeById(vendorTypeId) {
        return vendorType_model_1.default.findById(vendorTypeId);
    }
    static async getVendorTypeByName(name) {
        return vendorType_model_1.default.findOne({ name });
    }
    static async updateVendorType(vendorTypeId, name, description) {
        const vendorType = await vendorType_model_1.default.findById(vendorTypeId);
        if (!vendorType) {
            throw new customError_1.default('Vendor type not found', 404);
        }
        vendorType.name = name;
        vendorType.description = description;
        await vendorType.save();
        return vendorType;
    }
    static async deleteVendorType(vendorTypeId) {
        const vendorType = await vendorType_model_1.default.findById(vendorTypeId);
        if (!vendorType) {
            throw new customError_1.default('Vendor type not found', 404);
        }
        await vendorType.deleteOne();
    }
}
exports.default = VendorTypeService;
//# sourceMappingURL=vendorType.service.js.map