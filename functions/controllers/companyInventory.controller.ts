import { Request, Response } from 'express';
import CompanyInventoryService from '../services/companyInventory.service';
import asyncHandler from '../utils/asyncHandler';

class CompanyInventoryController {
    static createCompanyInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { itemName, category, createdBy, quantity, status } = req.body;
            const inventory = await CompanyInventoryService.createCompanyInventory(
                itemName,
                category,
                createdBy,
                quantity,
                status
            );
            res.status(201).json(inventory);
        }
    );

    static getCompanyInventories = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const inventories = await CompanyInventoryService.getCompanyInventories();
            res.status(200).json(inventories);
        }
    );

    static updateCompanyInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            const { itemName, category, quantity, status } = req.body;
            const inventory = await CompanyInventoryService.updateCompanyInventory(
                inventoryId,
                itemName,
                category,
                quantity,
                status
            );
            if (!inventory) {
                res.status(404).json({ message: 'Inventory item not found' });
                return;
            }
            res.status(200).json(inventory);
        }
    );

    static deleteCompanyInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            await CompanyInventoryService.deleteCompanyInventory(inventoryId);
            res.status(204).json({ message: 'Inventory item deleted successfully' });
        }
    );
}

export default CompanyInventoryController;