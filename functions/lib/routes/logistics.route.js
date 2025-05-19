"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logistics_controller_1 = __importDefault(require("../controllers/logistics.controller"));
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const router = (0, express_1.Router)();
router.post('/', jwtAuth_1.default, logistics_controller_1.default.createLogistics);
router.get('/', jwtAuth_1.default, logistics_controller_1.default.getLogistics);
router.get('/:id', jwtAuth_1.default, logistics_controller_1.default.getLogisticsById);
router.put('/:id', jwtAuth_1.default, logistics_controller_1.default.updateLogistics);
router.put('/:id/aligned-amount', jwtAuth_1.default, logistics_controller_1.default.updateAlignedAmount);
router.delete('/:id', jwtAuth_1.default, logistics_controller_1.default.deleteLogistics);
router.delete('/:id/transportation/:itemId', jwtAuth_1.default, logistics_controller_1.default.deleteTransportationItem);
router.delete('/:id/accommodation/:itemId', jwtAuth_1.default, logistics_controller_1.default.deleteAccommodationItem);
router.delete('/:id/expense/:itemId', jwtAuth_1.default, logistics_controller_1.default.deleteExpenseItem);
// New partial update routes
router.patch('/:id/transportation/:itemId', jwtAuth_1.default, logistics_controller_1.default.updateTransportationItem);
router.patch('/:id/accommodation/:itemId', jwtAuth_1.default, logistics_controller_1.default.updateAccommodationItem);
router.patch('/:id/expense/:itemId', jwtAuth_1.default, logistics_controller_1.default.updateExpenseItem);
exports.default = router;
//# sourceMappingURL=logistics.route.js.map