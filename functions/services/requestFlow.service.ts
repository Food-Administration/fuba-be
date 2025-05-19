import User  from '../models/user.model';
import RequestFlow, { RequestFlowDocument, Approval } from '../models/requestFlow.model';
import CustomError from '../utils/customError';

class RequestFlowService {
    static async isDuplicateWorkflowItem(workflowItem: string, excludeId?: string): Promise<boolean> {
        const query: any = { workflowItem };
        if (excludeId) {
            query._id = { $ne: excludeId }; // Exclude the current document when updating
        }
        const existingFlow = await RequestFlow.findOne(query);
        return !!existingFlow;
    }

    // Create a new request flow
    static async createRequestFlow(
        workflowItem: string,
        displayName: string,
        approvals: Approval[]
    ): Promise<RequestFlowDocument> {
        // Check for duplicate workflowItem
        const isDuplicate = await this.isDuplicateWorkflowItem(workflowItem);
        if (isDuplicate) {
            throw new CustomError('A request flow with the same workflowItem already exists', 400);
        }

        // Check if all userIds in approvals exist
        for (const approval of approvals) {
            const userExists = await User.exists({ _id: approval.userId });
            if (!userExists) {
                throw new CustomError(`User with ID ${approval.userId} does not exist`, 400);
            }
        }

        // Create and save the request flow
        const requestFlow = new RequestFlow({ workflowItem, displayName, approvals });
        await requestFlow.save();
        return requestFlow;
    }

    // Update a request flow
    static async updateRequestFlow(
        requestFlowId: string,
        updateData: Partial<RequestFlowDocument>
    ): Promise<RequestFlowDocument | null> {
        if (updateData.workflowItem) {
            // Check for duplicate workflowItem (excluding the current document)
            const isDuplicate = await this.isDuplicateWorkflowItem(updateData.workflowItem, requestFlowId);
            if (isDuplicate) {
                throw new CustomError('A request flow with the same workflowItem already exists', 400);
            }
        }

        if (updateData.approvals) {
            // Check if all userIds in approvals exist
            for (const approval of updateData.approvals) {
                const userExists = await User.exists({ _id: approval.userId });
                if (!userExists) {
                    throw new CustomError(`User with ID ${approval.userId} does not exist`, 400);
                }
            }
        }

        // Update the request flow
        const requestFlow = await RequestFlow.findByIdAndUpdate(requestFlowId, updateData, { new: true }).populate({
            path: 'approvals.userId',
            select: 'firstName lastName fullName', // Select firstName and lastName explicitly
        });
        if (!requestFlow) {
            throw new CustomError('RequestFlow not found', 404);
        }
        return requestFlow;
    }


    static async getRequestFlows(): Promise<RequestFlowDocument[]> {
        return RequestFlow.find().populate({
            path: 'approvals.userId',
            select: 'firstName lastName fullName employmentDetails', // Only fetch fullName from the User model
        });
    }

    static async getRequestFlowById(requestFlowId: string): Promise<RequestFlowDocument | null> {
        return RequestFlow.findById(requestFlowId).populate({
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

    static async deleteRequestFlow(requestFlowId: string): Promise<void> {
        const requestFlow = await RequestFlow.findById(requestFlowId);
        if (!requestFlow) {
            throw new CustomError('RequestFlow not found', 404);
        }
        await requestFlow.deleteOne();
    }
}

export default RequestFlowService;