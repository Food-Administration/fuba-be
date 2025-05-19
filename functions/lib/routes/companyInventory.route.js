"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const companyInventory_controller_1 = __importDefault(require("../controllers/companyInventory.controller"));
const express_1 = __importDefault(require("express"));
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const router = express_1.default.Router();
router.post('/', jwtAuth_1.default, companyInventory_controller_1.default.createCompanyInventory);
router.get('/', jwtAuth_1.default, companyInventory_controller_1.default.getCompanyInventories);
router.put('/:inventoryId', jwtAuth_1.default, companyInventory_controller_1.default.updateCompanyInventory);
router.delete('/:inventoryId', jwtAuth_1.default, companyInventory_controller_1.default.deleteCompanyInventory);
exports.default = router;
//# sourceMappingURL=companyInventory.route.js.map