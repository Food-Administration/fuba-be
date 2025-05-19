import * as express from 'express';
import RequestFlowController from '../controllers/requestFlow.controller';
import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

router.use(jwtAuth);

// Create a new request flow
router.post('/', RequestFlowController.createRequestFlow);

// Get all request flows
router.get('/', RequestFlowController.getRequestFlows);

// Get a request flow by ID
router.get('/:requestFlowId', RequestFlowController.getRequestFlowById);

// Update a request flow
router.put('/:requestFlowId', RequestFlowController.updateRequestFlow);

// Delete a request flow
router.delete('/:requestFlowId', RequestFlowController.deleteRequestFlow);

export default router;