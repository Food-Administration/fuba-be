import { Request, Response } from 'express';
import PermissionService from '../services/permission.service';
import asyncHandler from '../utils/asyncHandler';

class PermissionController {
    createPermission = asyncHandler(async (req: Request, res: Response) => {
        const permission = await PermissionService.createPermission(req.body);
        res.status(201).json(permission);
    });

    getPermissions = asyncHandler(async (req: Request, res: Response) => {
        const permissions = await PermissionService.getPermissions();
        res.status(200).json(permissions);
    });

    getPermissionById = asyncHandler(async (req: Request, res: Response) => {
        const permission = await PermissionService.getPermissionById(req.params.id);
        res.status(200).json(permission);
    });

    updatePermission = asyncHandler(async (req: Request, res: Response) => {
        const permission = await PermissionService.updatePermission(req.params.id, req.body);
        res.status(200).json(permission);
    });

    deletePermission = asyncHandler(async (req: Request, res: Response) => {
        await PermissionService.deletePermission(req.params.id);
        res.status(200).json({ message: 'Permission deleted successfully' });
    });
}

export default new PermissionController();
