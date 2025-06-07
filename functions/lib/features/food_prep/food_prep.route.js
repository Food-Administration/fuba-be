"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const food_prep_controller_1 = __importDefault(require("./food_prep.controller"));
const router = (0, express_1.Router)();
// Create a food prep entry
router.post('/', food_prep_controller_1.default.create);
// Get all food prep entries (with optional query)
router.get('/', food_prep_controller_1.default.get);
// Get food prep entry by ID
router.get('/:id', food_prep_controller_1.default.getById);
// Update food prep entry
router.put('/:id', food_prep_controller_1.default.update);
// Get food prep entries by consumer
router.get('/consumer/:consumerId', food_prep_controller_1.default.getByConsumer);
// Delete food prep entry
router.delete('/:id', food_prep_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=food_prep.route.js.map