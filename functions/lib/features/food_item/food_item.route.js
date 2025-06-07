"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const food_item_controller_1 = __importDefault(require("./food_item.controller"));
const router = (0, express_1.Router)();
// Create a food item
router.post('/', food_item_controller_1.default.create);
// Get all food items (with optional query)
router.get('/', food_item_controller_1.default.get);
// Get food items by vendor
router.get('/vendor/:vendorId', food_item_controller_1.default.getByVendor);
// Get a food item by ID
router.get('/:id', food_item_controller_1.default.getById);
// Update a food item by ID
router.put('/:id', food_item_controller_1.default.update);
// Toggle food item availability
// router.patch('/:id/availability', FoodItemController.toggleAvailability);
// Delete a food item by ID
router.delete('/:id', food_item_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=food_item.route.js.map