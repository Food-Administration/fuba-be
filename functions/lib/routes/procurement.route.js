"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const procurement_controller_1 = __importDefault(require("../controllers/procurement.controller"));
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const router = express_1.default.Router();
router.get('/', jwtAuth_1.default, procurement_controller_1.default.getProcurements);
router.get('/:id', jwtAuth_1.default, procurement_controller_1.default.getProcurementById);
router.post('/', jwtAuth_1.default, procurement_controller_1.default.createProcurement);
router.patch('/:id/process', jwtAuth_1.default, procurement_controller_1.default.processRequest);
router.put('/update-inventory', jwtAuth_1.default, procurement_controller_1.default.updateInventory);
router.put('/:id', jwtAuth_1.default, procurement_controller_1.default.updateProcurement);
// router.put('/:id/status', jwtAuth, ProcurementController.updateProcurementStatus);
router.delete('/:id', jwtAuth_1.default, procurement_controller_1.default.deleteProcurement);
router.patch('/:procurementId/items/:itemId/receive', jwtAuth_1.default, procurement_controller_1.default.receiveItem);
router.patch('/:procurementId/items/:itemId/reject', jwtAuth_1.default, procurement_controller_1.default.rejectItem);
router.post('/add', jwtAuth_1.default, procurement_controller_1.default.addItemToInventory);
router.put('/update-inventory', jwtAuth_1.default, procurement_controller_1.default.updateInventory);
exports.default = router;
//# sourceMappingURL=procurement.route.js.map