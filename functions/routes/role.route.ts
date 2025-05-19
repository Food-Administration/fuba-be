import * as express from 'express';
import RoleController from '../controllers/role.controller';
import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

router.use(jwtAuth)


// // Create a new role
// router.post('/', jwtAuth, isAdmin, RoleController.createRole);
// // router.post('/', RoleController.createRole);

// // Get all roles
router.get('/', RoleController.getRoles);

// // Get a role by ID
router.get('/:roleId', RoleController.getRoleById);
 
// // Update a role
router.put('/:roleId', RoleController.updateRole);

// // Delete a role
router.delete('/:roleId', RoleController.deleteRole);

// Create a new role
router.post('/', RoleController.createRole);
// router.post('/', RoleController.createRole);

// Get all roles
// router.get('/', RoleController.getRoles);

// Get a role by ID
// router.get('/:roleId', RoleController.getRoleById);

// Update a role
// router.put('/:roleId', RoleController.updateRole);

// Delete a role
// router.delete('/:roleId', RoleController.deleteRole);

export default router;