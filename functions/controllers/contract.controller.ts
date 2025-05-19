import { Request, Response } from 'express';
import ContractService from '../services/contract.service';
import asyncHandler from '../utils/asyncHandler';

class ContractController {
    static createContract = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendor, document, startDate, endDate } = req.body;
            const contract = await ContractService.createContract(vendor, document, startDate, endDate);
            res.status(201).json(contract);
        }
    );
    

    static getContracts = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const contracts = await ContractService.getContracts();
            res.status(200).json(contracts);
        }
    );

    static getContractById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { contractId } = req.params;
            const contract = await ContractService.getContractById(contractId);
            if (!contract) {
                res.status(404).json({ message: 'Contract not found' });
                return;
            }
            res.status(200).json(contract);
        }
    );

    static approveContract = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { contractId } = req.params;
            const contract = await ContractService.approveContract(contractId);
            if (!contract) {
                res.status(404).json({ message: 'Contract not found' });
                return;
            }
            res.status(200).json(contract);
        }
    );

    static suspendContract = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { contractId } = req.params;
            const { reason } = req.body;
            const contract = await ContractService.suspendContract(contractId, reason);
            if (!contract) {
                res.status(404).json({ message: 'Contract not found' });
                return;
            }
            res.status(200).json(contract);
        }
    );

    static reinstateContract = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { contractId } = req.params;
            const contract = await ContractService.reinstateContract(contractId);
            if (!contract) {
                res.status(404).json({ message: 'Contract not found' });
                return;
            }
            res.status(200).json(contract);
        }
    );

    static deleteContract = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { contractId } = req.params;
            await ContractService.deleteContract(contractId);
            res.status(204).json({ message: 'Contract deleted successfully' });
        }
    );
}

export default ContractController;