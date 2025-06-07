"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodPrepController = void 0;
const food_prep_service_1 = __importDefault(require("./food_prep.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class FoodPrepController {
    constructor() {
        this.create = (0, asyncHandler_1.default)(async (req, res) => {
            const foodPrep = await food_prep_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                data: foodPrep,
                message: 'Food preparation entry created successfully'
            });
        });
        this.get = (0, asyncHandler_1.default)(async (req, res) => {
            const { foodPreps, total, page, limit } = await food_prep_service_1.default.get(req.query);
            res.status(200).json({
                success: true,
                data: foodPreps,
                meta: { total, page, limit }
            });
        });
        this.getById = (0, asyncHandler_1.default)(async (req, res) => {
            const foodPrep = await food_prep_service_1.default.getById(req.params.id);
            if (!foodPrep) {
                res.status(404).json({ success: false, error: 'Food preparation entry not found' });
                return;
            }
            res.status(200).json({ success: true, data: foodPrep });
        });
        this.update = (0, asyncHandler_1.default)(async (req, res) => {
            const foodPrep = await food_prep_service_1.default.update(req.params.id, req.body);
            if (!foodPrep) {
                res.status(404).json({ success: false, error: 'Food preparation entry not found' });
                return;
            }
            res.status(200).json({
                success: true,
                data: foodPrep,
                message: 'Food preparation entry updated successfully'
            });
        });
        this.getByConsumer = (0, asyncHandler_1.default)(async (req, res) => {
            const { foodPreps, total, page, limit } = await food_prep_service_1.default.getByConsumer(req.params.consumerId, req.query);
            res.status(200).json({
                success: true,
                data: foodPreps,
                meta: { total, page, limit }
            });
        });
        this.delete = (0, asyncHandler_1.default)(async (req, res) => {
            const foodPrep = await food_prep_service_1.default.delete(req.params.id);
            if (!foodPrep) {
                res.status(404).json({ success: false, error: 'Food preparation entry not found' });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Food preparation entry deleted successfully'
            });
        });
    }
}
exports.FoodPrepController = FoodPrepController;
exports.default = new FoodPrepController();
//# sourceMappingURL=food_prep.controller.js.map