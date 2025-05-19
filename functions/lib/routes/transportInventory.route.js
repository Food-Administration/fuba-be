"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const transportInventory_controller_1 = __importDefault(require("../controllers/transportInventory.controller"));
const router = (0, express_1.Router)();
router.post('/', jwtAuth_1.default, transportInventory_controller_1.default.createTransportInventory);
router.get('/', jwtAuth_1.default, transportInventory_controller_1.default.getTransportInventories);
router.get('/:id', jwtAuth_1.default, transportInventory_controller_1.default.getTransportInventoryById);
router.put('/:id', jwtAuth_1.default, transportInventory_controller_1.default.updateTransportInventory);
router.delete('/:id', jwtAuth_1.default, transportInventory_controller_1.default.deleteTransportInventory);
exports.default = router;
//# sourceMappingURL=transportInventory.route.js.map