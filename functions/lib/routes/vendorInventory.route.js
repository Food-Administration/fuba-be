"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendorInventory_controller_1 = __importDefault(require("../controllers/vendorInventory.controller"));
const express_1 = __importDefault(require("express"));
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const router = express_1.default.Router();
router.post('/', jwtAuth_1.default, vendorInventory_controller_1.default.createVendorInventory);
router.get('/', jwtAuth_1.default, vendorInventory_controller_1.default.getVendorInventories);
router.get('/:inventoryId', jwtAuth_1.default, vendorInventory_controller_1.default.getVendorInventoryById);
router.get('/vendor/:vendorId', jwtAuth_1.default, vendorInventory_controller_1.default.getVendorInventoryByVendor);
router.put('/:inventoryId', jwtAuth_1.default, vendorInventory_controller_1.default.updateVendorInventory);
router.delete('/:inventoryId', jwtAuth_1.default, vendorInventory_controller_1.default.deleteVendorInventory);
exports.default = router;
//# sourceMappingURL=vendorInventory.route.js.map