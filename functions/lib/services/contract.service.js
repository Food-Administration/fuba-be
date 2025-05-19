"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contract_model_1 = __importDefault(require("../models/contract.model"));
const customError_1 = __importDefault(require("../utils/customError"));
class ContractService {
    static async createContract(vendor, document, startDate, endDate) {
        const contract = new contract_model_1.default({ vendor, document, startDate, endDate });
        await contract.save();
        return contract;
    }
    static async getContracts() {
        return contract_model_1.default.find().populate('vendor');
    }
    static async getContractById(contractId) {
        return contract_model_1.default.findById(contractId).populate('vendor');
    }
    static async approveContract(contractId) {
        const contract = await contract_model_1.default.findByIdAndUpdate(contractId, { status: 'active' }, { new: true }).populate('vendor');
        if (!contract) {
            throw new customError_1.default('Contract not found', 404);
        }
        return contract;
    }
    static async suspendContract(contractId, reason) {
        const contract = await contract_model_1.default.findByIdAndUpdate(contractId, { status: 'suspended', suspensionReason: reason }, { new: true }).populate('vendor');
        if (!contract) {
            throw new customError_1.default('Contract not found', 404);
        }
        return contract;
    }
    static async reinstateContract(contractId) {
        const contract = await contract_model_1.default.findByIdAndUpdate(contractId, { status: 'active', suspensionReason: null }, { new: true }).populate('vendor');
        if (!contract) {
            throw new customError_1.default('Contract not found', 404);
        }
        return contract;
    }
    static async deleteContract(contractId) {
        const contract = await contract_model_1.default.findById(contractId);
        if (!contract) {
            throw new customError_1.default('Contract not found', 404);
        }
        await contract.deleteOne();
    }
}
exports.default = ContractService;
//# sourceMappingURL=contract.service.js.map