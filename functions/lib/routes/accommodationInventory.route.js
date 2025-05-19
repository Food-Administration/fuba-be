"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const accommodationInventory_controller_1 = __importDefault(require("../controllers/accommodationInventory.controller"));
const router = (0, express_1.Router)();
router.post('/', jwtAuth_1.default, accommodationInventory_controller_1.default.createAccommodationInventory);
router.get('/', jwtAuth_1.default, accommodationInventory_controller_1.default.getAccommodationInventories);
router.get('/:id', jwtAuth_1.default, accommodationInventory_controller_1.default.getAccommodationInventoryById);
router.put('/:id', jwtAuth_1.default, accommodationInventory_controller_1.default.updateAccommodationInventory);
router.delete('/:id', jwtAuth_1.default, accommodationInventory_controller_1.default.deleteAccommodationInventory);
exports.default = router;
//# sourceMappingURL=accommodationInventory.route.js.map