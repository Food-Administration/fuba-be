import Contract, { ContractDocument } from '../models/contract.model';
import CustomError from '../utils/customError';

class ContractService {
    static async createContract(
        vendor: string,
        document: string,
        startDate: Date,
        endDate: Date
    ): Promise<ContractDocument> {
        const contract = new Contract({ vendor, document, startDate, endDate });
        await contract.save();
        return contract;
    }

    static async getContracts(): Promise<ContractDocument[]> {
        return Contract.find().populate('vendor');
    }

    static async getContractById(contractId: string): Promise<ContractDocument | null> {
        return Contract.findById(contractId).populate('vendor');
    }

    static async approveContract(contractId: string): Promise<ContractDocument | null> {
        const contract = await Contract.findByIdAndUpdate(
            contractId,
            { status: 'active' },
            { new: true }
        ).populate('vendor');
        if (!contract) {
            throw new CustomError('Contract not found', 404);
        }
        return contract;
    }

    static async suspendContract(contractId: string, reason: string): Promise<ContractDocument | null> {
        const contract = await Contract.findByIdAndUpdate(
            contractId,
            { status: 'suspended', suspensionReason: reason },
            { new: true }
        ).populate('vendor');
        if (!contract) {
            throw new CustomError('Contract not found', 404);
        }
        return contract;
    }

    static async reinstateContract(contractId: string): Promise<ContractDocument | null> {
        const contract = await Contract.findByIdAndUpdate(
            contractId,
            { status: 'active', suspensionReason: null },
            { new: true }
        ).populate('vendor');
        if (!contract) {
            throw new CustomError('Contract not found', 404);
        }
        return contract;
    }

    static async deleteContract(contractId: string): Promise<void> {
        const contract = await Contract.findById(contractId);
        if (!contract) {
            throw new CustomError('Contract not found', 404);
        }
        await contract.deleteOne();
    }
}

export default ContractService;