"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_1 = __importDefault(require("./property.controller")); // This file itself exports the controller
const router = (0, express_1.Router)();
// Create a property
router.post('/', property_controller_1.default.create);
// Get all properties (with optional query)
router.get('/', property_controller_1.default.get);
// Get a property by ID
router.get('/:id', property_controller_1.default.getById);
// Update a property by ID
router.put('/:id', property_controller_1.default.update);
// Delete a property by ID
router.delete('/:id', property_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=property.route.js.map