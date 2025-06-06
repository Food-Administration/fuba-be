"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const property_service_1 = __importDefault(require("./property.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class PropertyController {
    constructor() {
        this.create = (0, asyncHandler_1.default)(async (req, res) => {
            const property = await property_service_1.default.create(req.body);
            res.status(201).json(property);
        });
        this.get = (0, asyncHandler_1.default)(async (req, res) => {
            const properties = await property_service_1.default.get(req.query);
            res.status(200).json(properties);
        });
        this.getById = (0, asyncHandler_1.default)(async (req, res) => {
            const property = await property_service_1.default.getById(req.params.id);
            if (!property) {
                res.status(404).json({ error: 'Property not found' });
                return;
            }
            res.status(200).json(property);
        });
        this.update = (0, asyncHandler_1.default)(async (req, res) => {
            const property = await property_service_1.default.update(req.params.id, req.body);
            if (!property) {
                res.status(404).json({ error: 'Property not found' });
                return;
            }
            res.status(200).json(property);
        });
        this.delete = (0, asyncHandler_1.default)(async (req, res) => {
            const property = await property_service_1.default.delete(req.params.id);
            if (!property) {
                res.status(404).json({ error: 'Property not found' });
                return;
            }
            res.status(204).json({ message: 'Property deleted successfully' });
        });
    }
}
exports.PropertyController = PropertyController;
exports.default = new PropertyController();
//# sourceMappingURL=property.controller.js.map