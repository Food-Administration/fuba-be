"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const contract_service_1 = __importDefault(require("../services/contract.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class ContractController {
}
_a = ContractController;
ContractController.createContract = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendor, document, startDate, endDate } = req.body;
    const contract = await contract_service_1.default.createContract(vendor, document, startDate, endDate);
    res.status(201).json(contract);
});
ContractController.getContracts = (0, asyncHandler_1.default)(async (req, res) => {
    const contracts = await contract_service_1.default.getContracts();
    res.status(200).json(contracts);
});
ContractController.getContractById = (0, asyncHandler_1.default)(async (req, res) => {
    const { contractId } = req.params;
    const contract = await contract_service_1.default.getContractById(contractId);
    if (!contract) {
        res.status(404).json({ message: 'Contract not found' });
        return;
    }
    res.status(200).json(contract);
});
ContractController.approveContract = (0, asyncHandler_1.default)(async (req, res) => {
    const { contractId } = req.params;
    const contract = await contract_service_1.default.approveContract(contractId);
    if (!contract) {
        res.status(404).json({ message: 'Contract not found' });
        return;
    }
    res.status(200).json(contract);
});
ContractController.suspendContract = (0, asyncHandler_1.default)(async (req, res) => {
    const { contractId } = req.params;
    const { reason } = req.body;
    const contract = await contract_service_1.default.suspendContract(contractId, reason);
    if (!contract) {
        res.status(404).json({ message: 'Contract not found' });
        return;
    }
    res.status(200).json(contract);
});
ContractController.reinstateContract = (0, asyncHandler_1.default)(async (req, res) => {
    const { contractId } = req.params;
    const contract = await contract_service_1.default.reinstateContract(contractId);
    if (!contract) {
        res.status(404).json({ message: 'Contract not found' });
        return;
    }
    res.status(200).json(contract);
});
ContractController.deleteContract = (0, asyncHandler_1.default)(async (req, res) => {
    const { contractId } = req.params;
    await contract_service_1.default.deleteContract(contractId);
    res.status(204).json({ message: 'Contract deleted successfully' });
});
exports.default = ContractController;
//# sourceMappingURL=contract.controller.js.map