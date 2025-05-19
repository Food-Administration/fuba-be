import * as express from 'express';
import ContractController from '../controllers/contract.controller';
// import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

// Create a new contract
router.post('/', ContractController.createContract);

// Get all contracts
router.get('/', ContractController.getContracts);

// Get a contract by ID
router.get('/:contractId', ContractController.getContractById);

// Approve a contract
router.patch('/:contractId/approve', ContractController.approveContract);

// Suspend a contract
router.patch('/:contractId/suspend', ContractController.suspendContract);

// Reinstate a contract
router.patch('/:contractId/reinstate', ContractController.reinstateContract);

// Delete a contract
router.delete('/:contractId', ContractController.deleteContract);

export default router;