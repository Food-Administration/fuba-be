import { Request, Response } from 'express';
import VendorInventoryService from '../services/vendorInventory.service';
import asyncHandler from '../utils/asyncHandler';

class VendorInventoryController {
    static createVendorInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { itemName, category, price, vendor, quantity, status } = req.body;
            const inventory = await VendorInventoryService.createVendorInventory(
                itemName,
                category,
                price,
                vendor,
                quantity,
                status
            );
            res.status(201).json(inventory);
        }
    );

    static getVendorInventories = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const inventories = await VendorInventoryService.getVendorInventories();
            res.status(200).json(inventories);
        }
    );

    static getVendorInventoryById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            const inventory = await VendorInventoryService.getVendorInventoryById(inventoryId);
            if (!inventory) {
                res.status(404).json({ message: 'Inventory item not found' });
                return;
            }
            res.status(200).json(inventory);
        }
    );

    static getVendorInventoryByVendor = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendorId } = req.params;
            const inventories = await VendorInventoryService.getVendorInventoryByVendor(vendorId);
            res.status(200).json(inventories);
        }
    );

    static updateVendorInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            const { itemName, category, price, quantity, status } = req.body;
            const inventory = await VendorInventoryService.updateVendorInventory(
                inventoryId,
                itemName,
                category,
                price,
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

    static deleteVendorInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            await VendorInventoryService.deleteVendorInventory(inventoryId);
            res.status(204).json({ message: 'Inventory item deleted successfully' });
        }
    );
}

export default VendorInventoryController;