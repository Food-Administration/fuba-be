"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const requestFlow_model_1 = __importDefault(require("../models/requestFlow.model"));
const customError_1 = __importDefault(require("../utils/customError"));
class RequestFlowService {
    static async isDuplicateWorkflowItem(workflowItem, excludeId) {
        const query = { workflowItem };
        if (excludeId) {
            query._id = { $ne: excludeId }; // Exclude the current document when updating
        }
        const existingFlow = await requestFlow_model_1.default.findOne(query);
        return !!existingFlow;
    }
    // Create a new request flow
    static async createRequestFlow(workflowItem, displayName, approvals) {
        // Check for duplicate workflowItem
        const isDuplicate = await this.isDuplicateWorkflowItem(workflowItem);
        if (isDuplicate) {
            throw new customError_1.default('A request flow with the same workflowItem already exists', 400);
        }
        // Check if all userIds in approvals exist
        for (const approval of approvals) {
            const userExists = await user_model_1.default.exists({ _id: approval.userId });
            if (!userExists) {
                throw new customError_1.default(`User with ID ${approval.userId} does not exist`, 400);
            }
        }
        // Create and save the request flow
        const requestFlow = new requestFlow_model_1.default({ workflowItem, displayName, approvals });
        await requestFlow.save();
        return requestFlow;
    }
    // Update a request flow
    static async updateRequestFlow(requestFlowId, updateData) {
        if (updateData.workflowItem) {
            // Check for duplicate workflowItem (excluding the current document)
            const isDuplicate = await this.isDuplicateWorkflowItem(updateData.workflowItem, requestFlowId);
            if (isDuplicate) {
                throw new customError_1.default('A request flow with the same workflowItem already exists', 400);
            }
        }
        if (updateData.approvals) {
            // Check if all userIds in approvals exist
            for (const approval of updateData.approvals) {
                const userExists = await user_model_1.default.exists({ _id: approval.userId });
                if (!userExists) {
                    throw new customError_1.default(`User with ID ${approval.userId} does not exist`, 400);
                }
            }
        }
        // Update the request flow
        const requestFlow = await requestFlow_model_1.default.findByIdAndUpdate(requestFlowId, updateData, { new: true }).populate({
            path: 'approvals.userId',
            select: 'firstName lastName fullName', // Select firstName and lastName explicitly
        });
        if (!requestFlow) {
            throw new customError_1.default('RequestFlow not found', 404);
        }
        return requestFlow;
    }
    static async getRequestFlows() {
        return requestFlow_model_1.default.find().populate({
            path: 'approvals.userId',
            select: 'firstName lastName fullName employmentDetails', // Only fetch fullName from the User model
        });
    }
    static async getRequestFlowById(requestFlowId) {
        return requestFlow_model_1.default.findById(requestFlowId).populate({
            path: 'approvals.userId',
            select: 'firstName lastName fullName employmentDetails', // Only fetch fullName from the User model
        });
    }
    // static async updateRequestFlow(
    //     requestFlowId: string,
    //     updateData: Partial<RequestFlowDocument>
    // ): Promise<RequestFlowDocument | null> {
    //     const requestFlow = await RequestFlow.findByIdAndUpdate(requestFlowId, updateData, { new: true }).populate({
    //         path: 'approvals.userId',
    //         select: 'fullName', // Only fetch fullName from the User model
    //     });
    //     if (!requestFlow) {
    //         throw new CustomError('RequestFlow not found', 404);
    //     }
    //     return requestFlow;
    // }
    static async deleteRequestFlow(requestFlowId) {
        const requestFlow = await requestFlow_model_1.default.findById(requestFlowId);
        if (!requestFlow) {
            throw new customError_1.default('RequestFlow not found', 404);
        }
        await requestFlow.deleteOne();
    }
}
exports.default = RequestFlowService;
//# sourceMappingURL=requestFlow.service.js.map