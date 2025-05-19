"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const procurement_service_1 = __importDefault(require("../services/procurement.service"));
const budget_service_1 = __importDefault(require("../services/budget.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const mongoose_1 = require("mongoose");
const customError_1 = __importDefault(require("../utils/customError"));
class ProcurementController {
    constructor() {
        this.createProcurement = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const procurement = await procurement_service_1.default.createProcurement({
                ...req.body,
                createdBy: new mongoose_1.Types.ObjectId(req.user.id),
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            });
            res.status(201).json(procurement);
        });
        this.processRequest = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { id } = req.params;
            const { items } = req.body;
            // Validate inputs
            if (!id || !mongoose_1.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid procurement ID');
            }
            if (!items || !Array.isArray(items)) {
                throw new Error('Items array is required');
            }
            for (const item of items) {
                if (!item.budgetItem || !mongoose_1.Types.ObjectId.isValid(item.budgetItem)) {
                    throw new Error(`Invalid budgetItem ID for item: ${JSON.stringify(item)}`);
                }
            }
            const procurement = await procurement_service_1.default.processRequest(id, { items });
            res.status(200).json({ data: procurement });
        });
        this.receiveItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { procurementId, itemId } = req.params;
            if (!procurementId || !itemId) {
                throw new customError_1.default('Procurement ID and Item ID are required', 400);
            }
            if (!req.user.id) {
                throw new customError_1.default('User ID is required', 401);
            }
            const result = await procurement_service_1.default.receiveItem(procurementId, itemId, req.user.id // No need to convert to ObjectId here - let the service handle it
            );
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.procurement,
            });
        });
        this.rejectItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { procurementId, itemId } = req.params;
            if (!procurementId || !itemId) {
                throw new customError_1.default('Procurement ID and Item ID are required', 400);
            }
            if (!req.user.id) {
                throw new customError_1.default('User ID is required', 401);
            }
            const result = await procurement_service_1.default.rejectItem(procurementId, itemId, req.user.id);
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.procurement,
            });
        });
        this.addItemToInventory = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { itemName, quantity, procurementId, procurementItemId } = req.body;
            if (!itemName || !quantity || !procurementId || !procurementItemId) {
                throw new customError_1.default('itemName, quantity, procurementId, and procurementItemId are required', 400);
            }
            const result = await procurement_service_1.default.addItemToInventory({
                itemName,
                quantity,
                // unitPrice,
                procurementId,
                procurementItemId,
                addedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    inventoryItem: result.inventoryItem,
                    procurement: result.procurement,
                },
            });
        });
        this.updateInventory = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { itemName, quantity, procurementId, procurementItemId } = req.body;
            if (!itemName || !quantity || !procurementId || !procurementItemId) {
                throw new customError_1.default('itemName, quantity, procurementId, and procurementItemId are required', 400);
            }
            const result = await procurement_service_1.default.updateInventory({
                itemName,
                quantity,
                procurementId,
                procurementItemId,
                addedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    inventoryItem: result.inventoryItem,
                    procurement: result.procurement,
                },
            });
        });
        this.createRealignment = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { category, amount, budgetId, comment } = req.body;
            const budget = await budget_service_1.default.addAlignedAmount(budgetId, category, {
                amount,
                personnel: req.user.id,
                comment,
            }, new mongoose_1.Types.ObjectId(req.user.id));
            res.status(201).json(budget);
        });
        this.updateRealignmentStatus = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { budgetId, categoryId, alignedId, status, rejectionReason } = req.body;
            const budget = await budget_service_1.default.updateAlignedAmountStatus(budgetId, categoryId, alignedId, status, new mongoose_1.Types.ObjectId(req.user.id), rejectionReason);
            res.status(200).json(budget);
        });
        this.getProcurements = (0, asyncHandler_1.default)(async (req, res) => {
            const procurements = await procurement_service_1.default.getProcurements();
            res.status(200).json(procurements);
        });
        this.getProcurementById = (0, asyncHandler_1.default)(async (req, res) => {
            const procurement = await procurement_service_1.default.getProcurementById(req.params.id);
            res.status(200).json(procurement);
        });
        this.updateProcurement = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const procurement = await procurement_service_1.default.updateProcurement(req.params.id, {
                ...req.body,
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            });
            res.status(200).json(procurement);
        });
        this.deleteProcurement = (0, asyncHandler_1.default)(async (req, res) => {
            await procurement_service_1.default.deleteProcurement(req.params.id);
            res.status(200).json({ message: 'Procurement deleted successfully' });
        });
    }
    assertAuthenticated(req) {
        if (!req.user) {
            throw new Error('User is not authenticated');
        }
    }
}
exports.default = new ProcurementController();
//# sourceMappingURL=procurement.controller.js.map