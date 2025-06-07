"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodItemController = void 0;
const food_item_service_1 = __importDefault(require("./food_item.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class FoodItemController {
    constructor() {
        this.create = (0, asyncHandler_1.default)(async (req, res) => {
            const foodItem = await food_item_service_1.default.create(req.body);
            res.status(201).json(foodItem);
        });
        this.get = (0, asyncHandler_1.default)(async (req, res) => {
            const { foodItems, total, page, limit } = await food_item_service_1.default.get(req.query);
            res.status(200).json({
                success: true,
                data: foodItems,
                meta: { total, page, limit }
            });
        });
        this.getById = (0, asyncHandler_1.default)(async (req, res) => {
            const foodItem = await food_item_service_1.default.getById(req.params.id);
            if (!foodItem) {
                res.status(404).json({ success: false, error: 'Food item not found' });
                return;
            }
            res.status(200).json({ success: true, data: foodItem });
        });
        this.getByVendor = (0, asyncHandler_1.default)(async (req, res) => {
            const { foodItems, total, page, limit } = await food_item_service_1.default.getByVendor(req.params.vendorId, req.query);
            res.status(200).json({
                success: true,
                data: foodItems,
                meta: { total, page, limit }
            });
        });
        this.update = (0, asyncHandler_1.default)(async (req, res) => {
            const foodItem = await food_item_service_1.default.update(req.params.id, req.body);
            if (!foodItem) {
                res.status(404).json({ success: false, error: 'Food item not found' });
                return;
            }
            res.status(200).json({ success: true, data: foodItem });
        });
        this.delete = (0, asyncHandler_1.default)(async (req, res) => {
            const foodItem = await food_item_service_1.default.delete(req.params.id);
            if (!foodItem) {
                res.status(404).json({ success: false, error: 'Food item not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Food item deleted successfully' });
        });
        // toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
        //   const foodItem = await FoodItemService.toggleAvailability(req.params.id);
        //   if (!foodItem) {
        //     res.status(404).json({ success: false, error: 'Food item not found' });
        //     return;
        //   }
        //   res.status(200).json({ 
        //     success: true, 
        //     data: foodItem,
        //     message: `Food item marked as ${foodItem.available ? 'available' : 'unavailable'}`
        //   });
        // });
    }
}
exports.FoodItemController = FoodItemController;
exports.default = new FoodItemController();
//# sourceMappingURL=food_item.controller.js.map