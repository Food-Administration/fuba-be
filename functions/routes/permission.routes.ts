import { Router } from 'express';
import PermissionController from '../controllers/permission.controller';
import jwtAuth from '../middleware/jwtAuth';

const router = Router();

router.use(jwtAuth)

router.post('/', PermissionController.createPermission);
router.get('/', PermissionController.getPermissions);
router.get('/permissions/:id', PermissionController.getPermissionById);
router.put('/:id', PermissionController.updatePermission);
router.delete('/:id', PermissionController.deletePermission);

export default router;
