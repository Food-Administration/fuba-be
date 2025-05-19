"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logistics_service_1 = __importDefault(require("../services/logistics.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const mongoose_1 = require("mongoose");
const customError_1 = __importDefault(require("../utils/customError"));
class LogisticsController {
    constructor() {
        this.createLogistics = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const logistics = await logistics_service_1.default.createLogistics({
                ...req.body,
                createdBy: new mongoose_1.Types.ObjectId(req.user.id),
                traveler: new mongoose_1.Types.ObjectId(req.user.id),
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            });
            res.status(201).json(logistics);
        });
        this.getLogistics = (0, asyncHandler_1.default)(async (req, res) => {
            const logistics = await logistics_service_1.default.getLogistics();
            res.status(200).json(logistics);
        });
        this.getLogisticsById = (0, asyncHandler_1.default)(async (req, res) => {
            const logistics = await logistics_service_1.default.getLogisticsById(req.params.id);
            if (!logistics) {
                throw new customError_1.default('Logistics request not found', 404);
            }
            res.status(200).json(logistics);
        });
        // updateLogistics = asyncHandler(async (req: Request, res: Response) => {
        //   this.assertAuthenticated(req);
        //   const logistics = await LogisticsService.updateLogistics(req.params.id, {
        //     ...req.body,
        //   });
        //   res.status(200).json(logistics);
        // });
        this.updateLogistics = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            // Basic validation
            // if (
            //   req.body.status &&
            //   !['pending', 'approved', 'processed', 'rejected', 'completed'].includes(
            //     req.body.status
            //   )
            // ) {
            //   throw new CustomError('Invalid status value', 400);
            // }
            const logistics = await logistics_service_1.default.updateLogistics(req.params.id, {
                ...req.body,
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            });
            res.status(200).json(logistics);
        });
        // New endpoint for updating alignedAmount
        this.updateAlignedAmount = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { id } = req.params;
            const alignedAmount = req.body.alignedAmount;
            if (!alignedAmount || typeof alignedAmount !== 'object') {
                throw new customError_1.default('alignedAmount must be provided in request body', 400);
            }
            const updateData = {
                ...alignedAmount,
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            };
            const logistics = await logistics_service_1.default.updateAlignedAmount(id, updateData);
            res.status(200).json(logistics);
        });
        this.updateTransportationItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { id, itemId } = req.params;
            // Get the entire transportationDetails object from body
            const transportationDetails = req.body.transportationDetails;
            console.log('transportationDetails:', transportationDetails); // Debugging line
            if (!transportationDetails || typeof transportationDetails !== 'object') {
                throw new customError_1.default('transportationDetails must be provided in request body', 400);
            }
            const updateData = {
                ...transportationDetails,
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            };
            const logistics = await logistics_service_1.default.updateTransportationItem(id, itemId, updateData);
            res.status(200).json(logistics);
        });
        this.updateAccommodationItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { id, itemId } = req.params;
            // Get the entire transportationDetails object from body
            const accommodationDetails = req.body.accommodationDetails;
            //  console.log('transportationDetails:', accommodationDetails); // Debugging line
            if (!accommodationDetails || typeof accommodationDetails !== 'object') {
                throw new customError_1.default('accommodationDetails must be provided in request body', 400);
            }
            const updateData = {
                ...accommodationDetails,
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            };
            const logistics = await logistics_service_1.default.updateAccommodationItem(id, itemId, updateData);
            res.status(200).json(logistics);
        });
        this.updateExpenseItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { id, itemId } = req.params;
            // Get the entire transportationDetails object from body
            const additionalExpensesDetails = req.body.additionalExpenses;
            if (!additionalExpensesDetails || typeof additionalExpensesDetails !== 'object') {
                throw new customError_1.default('additionalExpensesDetails must be provided in request body', 400);
            }
            const updateData = {
                ...additionalExpensesDetails,
                lastUpdatedBy: new mongoose_1.Types.ObjectId(req.user.id),
            };
            const logistics = await logistics_service_1.default.updateExpenseItem(id, itemId, updateData);
            res.status(200).json(logistics);
        });
        this.deleteLogistics = (0, asyncHandler_1.default)(async (req, res) => {
            await logistics_service_1.default.deleteLogistics(req.params.id);
            res.status(200).json({ message: 'Logistics deleted successfully' });
        });
        this.deleteTransportationItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { id, itemId } = req.params;
            const result = await logistics_service_1.default.deleteTransportationItem(id, itemId);
            res.status(200).json(result);
        });
        this.deleteAccommodationItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { id, itemId } = req.params;
            const result = await logistics_service_1.default.deleteAccommodationItem(id, itemId);
            res.status(200).json(result);
        });
        this.deleteExpenseItem = (0, asyncHandler_1.default)(async (req, res) => {
            this.assertAuthenticated(req);
            const { id, itemId } = req.params;
            const result = await logistics_service_1.default.deleteExpenseItem(id, itemId);
            res.status(200).json(result);
        });
    }
    assertAuthenticated(req) {
        if (!req.user) {
            throw new Error('User is not authenticated');
        }
    }
}
exports.default = new LogisticsController();
//# sourceMappingURL=logistics.controller.js.map