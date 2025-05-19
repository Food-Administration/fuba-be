import { Request, Response } from 'express';
import RequestFlowService from '../services/requestFlow.service';
import asyncHandler from '../utils/asyncHandler';

class RequestFlowController {
    static createRequestFlow = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { workflowItem, displayName, approvals } = req.body;
            const requestFlow = await RequestFlowService.createRequestFlow(workflowItem, displayName, approvals);
            res.status(201).json(requestFlow);
        }
    );

    static getRequestFlows = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const requestFlows = await RequestFlowService.getRequestFlows();
            res.status(200).json(requestFlows);
        }
    );

    static getRequestFlowById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { requestFlowId } = req.params;
            const requestFlow = await RequestFlowService.getRequestFlowById(requestFlowId);
            if (!requestFlow) {
                res.status(404).json({ message: 'RequestFlow not found' });
                return;
            }
            res.status(200).json(requestFlow);
        }
    );

    static updateRequestFlow = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { requestFlowId } = req.params;
            const updateData = req.body;
            const requestFlow = await RequestFlowService.updateRequestFlow(requestFlowId, updateData);
            if (!requestFlow) {
                res.status(404).json({ message: 'RequestFlow not found' });
                return;
            }
            res.status(200).json(requestFlow);
        }
    );

    static deleteRequestFlow = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { requestFlowId } = req.params;
            await RequestFlowService.deleteRequestFlow(requestFlowId);
            res.status(204).json({ message: 'RequestFlow deleted successfully' });
        }
    );
}

export default RequestFlowController;