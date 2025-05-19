"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const requestFlow_service_1 = __importDefault(require("../services/requestFlow.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class RequestFlowController {
}
_a = RequestFlowController;
RequestFlowController.createRequestFlow = (0, asyncHandler_1.default)(async (req, res) => {
    const { workflowItem, displayName, approvals } = req.body;
    const requestFlow = await requestFlow_service_1.default.createRequestFlow(workflowItem, displayName, approvals);
    res.status(201).json(requestFlow);
});
RequestFlowController.getRequestFlows = (0, asyncHandler_1.default)(async (req, res) => {
    const requestFlows = await requestFlow_service_1.default.getRequestFlows();
    res.status(200).json(requestFlows);
});
RequestFlowController.getRequestFlowById = (0, asyncHandler_1.default)(async (req, res) => {
    const { requestFlowId } = req.params;
    const requestFlow = await requestFlow_service_1.default.getRequestFlowById(requestFlowId);
    if (!requestFlow) {
        res.status(404).json({ message: 'RequestFlow not found' });
        return;
    }
    res.status(200).json(requestFlow);
});
RequestFlowController.updateRequestFlow = (0, asyncHandler_1.default)(async (req, res) => {
    const { requestFlowId } = req.params;
    const updateData = req.body;
    const requestFlow = await requestFlow_service_1.default.updateRequestFlow(requestFlowId, updateData);
    if (!requestFlow) {
        res.status(404).json({ message: 'RequestFlow not found' });
        return;
    }
    res.status(200).json(requestFlow);
});
RequestFlowController.deleteRequestFlow = (0, asyncHandler_1.default)(async (req, res) => {
    const { requestFlowId } = req.params;
    await requestFlow_service_1.default.deleteRequestFlow(requestFlowId);
    res.status(204).json({ message: 'RequestFlow deleted successfully' });
});
exports.default = RequestFlowController;
//# sourceMappingURL=requestFlow.controller.js.map