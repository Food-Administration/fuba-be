import { Request, Response } from 'express';
import RoleService from '../services/role.service';
import asyncHandler from '../utils/asyncHandler';

class RoleController {
    static createRole = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { name, permissions } = req.body;
            const role = await RoleService.createRole(name, permissions);
            res.status(201).json(role);
        }
    );

    static getRoles = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const roles = await RoleService.getRoles();
            res.status(200).json(roles);
        }
    );

    static getRoleById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { roleId } = req.params;
            const role = await RoleService.getRoleById(roleId);
            if (!role) {
                res.status(404).json({ message: 'Role not found' });
                return;
            }
            res.status(200).json(role);
        }
    );

    static updateRole = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { roleId } = req.params;
            const { name, permissions } = req.body;
            const role = await RoleService.updateRole(roleId, name, permissions);
            if (!role) {
                res.status(404).json({ message: 'Role not found' });
                return;
            }
            res.status(200).json(role);
        }
    );

    static deleteRole = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { roleId } = req.params;
            await RoleService.deleteRole(roleId);
            res.status(204).json({ message: 'Role deleted successfully' });
        }
    );
}

export default RoleController;