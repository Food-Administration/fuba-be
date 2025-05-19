"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const email_service_1 = __importDefault(require("./email.service"));
const user_model_1 = __importDefault(require("../models/user.model"));
const bcrypt = __importStar(require("bcrypt"));
const index_1 = require("../models/index");
const crypto_1 = __importDefault(require("crypto"));
const customError_1 = __importDefault(require("../utils/customError"));
const vendorType_service_1 = __importDefault(require("./vendorType.service"));
const helper_1 = require("../utils/helper");
class VendorService {
    async createVendor(vendorData) {
        const { ...rest } = vendorData;
        const existingVendor = await user_model_1.default.findOne({ email: vendorData.email });
        if (existingVendor) {
            throw new customError_1.default('User with this email already exists', 409);
        }
        const password = crypto_1.default.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
        const vendorRole = await index_1.Role.findOne({ name: 'vendor' });
        if (!vendorRole) {
            throw new customError_1.default('Vendor role not found', 404);
        }
        if (!vendorData.vendorBusinessDetails?.vendorType) {
            throw new customError_1.default('Vendor type is required', 400);
        }
        let vendorTypeId = vendorData.vendorBusinessDetails.vendorType;
        if (typeof vendorTypeId === 'string' && !(0, helper_1.isValidObjectId)(vendorTypeId)) {
            const vendorType = await vendorType_service_1.default.getVendorTypeByName(vendorTypeId);
            if (!vendorType) {
                throw new customError_1.default(`Vendor type "${vendorTypeId}" not found`, 404);
            }
            vendorTypeId = vendorType._id;
        }
        const vendor = new user_model_1.default({
            ...rest,
            password: hashedPassword,
            roles: [vendorRole._id],
            vendorBusinessDetails: {
                ...rest.vendorBusinessDetails,
                vendorType: vendorTypeId,
            },
        });
        await vendor.save();
        await email_service_1.default.sendUserPasswordEmail(vendor.email, vendor.vendorCompanyInfo.vendorLegalName, vendor.email, password);
        return vendor;
    }
    async getVendorById(id) {
        return await user_model_1.default.findById(id).populate('roles');
    }
    async getVendors() {
        const vendorRole = await index_1.Role.findOne({ name: 'vendor' });
        if (!vendorRole) {
            throw new customError_1.default('Vendor role not found', 404);
        }
        return await user_model_1.default.find({ roles: { $in: [vendorRole._id] } })
            .populate('roles')
            .populate('vendorCompanyInfo')
            .populate('contactInfo')
            .populate('businessAddress')
            .populate('bankingInfo')
            .populate('vendorBusinessDetails.vendorType');
    }
    async findVendorByEmail(email) {
        return await user_model_1.default.findOne({ email, roles: { $in: ['vendor'] } });
    }
    async updateVendor(id, updateData) {
        return await user_model_1.default.findByIdAndUpdate(id, updateData, { new: true });
    }
    async deleteVendor(id) {
        return await user_model_1.default.findByIdAndDelete(id);
    }
    async blockVendor(id, isBlocked) {
        return await user_model_1.default.findByIdAndUpdate(id, { isBlocked }, { new: true });
    }
    async assignRole(vendorId, roleName) {
        const vendor = await user_model_1.default.findById(vendorId);
        if (!vendor) {
            throw new customError_1.default('Vendor not found', 404);
        }
        const role = await index_1.Role.findOne({ name: roleName });
        if (!role) {
            throw new customError_1.default('Vendor role not found', 404);
        }
        vendor.roles.push(role._id);
        await vendor.save();
        return vendor;
    }
    async importVendors(vendors) {
        const results = {
            successCount: 0,
            duplicateEmails: [],
            errors: [],
        };
        const vendorRole = await index_1.Role.findOne({ name: 'vendor' });
        if (!vendorRole) {
            throw new customError_1.default('Vendor role not found', 404);
        }
        for (const vendorData of vendors) {
            try {
                const existingVendor = await user_model_1.default.findOne({ email: vendorData.email });
                if (existingVendor) {
                    results.duplicateEmails.push(vendorData.email);
                    continue;
                }
                if (!vendorData.password) {
                    console.warn(`Password is required for vendor with email: ${vendorData.email}`, 400);
                    vendorData.password = crypto_1.default.randomBytes(8).toString('hex');
                }
                console.log(`Hashing password for vendor: ${vendorData.email}`);
                const hashedPassword = await bcrypt.hash(vendorData.password, 10);
                const newVendor = new user_model_1.default({
                    ...vendorData,
                    password: hashedPassword,
                    roles: [vendorRole._id],
                });
                await newVendor.save();
                await email_service_1.default.sendUserPasswordEmail(newVendor.email, newVendor.vendorCompanyInfo?.vendorLegalName || 'Vendor', newVendor.email, vendorData.password);
                results.successCount++;
            }
            catch (error) {
                results.errors.push({
                    email: vendorData.email,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return results;
    }
}
exports.default = new VendorService();
//# sourceMappingURL=vendor.service.js.map