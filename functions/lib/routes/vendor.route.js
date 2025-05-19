"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const vendor_controller_1 = __importDefault(require("../controllers/vendor.controller"));
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const multer_1 = __importDefault(require("../config/multer"));
const router = express.Router();
router.use(jwtAuth_1.default);
// router.post('/', isAdmin, VendorController.createVendor);
// router.post('/importVendors', isAdmin,  VendorController.importVendors);
// router.get('/:vendorId', jwtAuth, VendorController.getVendorById);
// router.get('/', isAdmin, VendorController.getVendors);
// router.put('/:vendorId', jwtAuth, VendorController.updateVendor);
// router.delete('/:vendorId', isAdmin, VendorController.deleteVendor);
router.post('/', vendor_controller_1.default.createVendor);
router.post('/importVendors/file/upload-file', multer_1.default.single('file'), vendor_controller_1.default.importVendors);
router.get('/:vendorId', vendor_controller_1.default.getVendorById);
router.get('/', vendor_controller_1.default.getVendors);
router.put('/:vendorId', vendor_controller_1.default.updateVendor);
router.delete('/:vendorId', vendor_controller_1.default.deleteVendor);
exports.default = router;
//# sourceMappingURL=vendor.route.js.map