import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import TransportInventoryService from '../services/transportInventory.service';

class TransportInventoryController {
    static createTransportInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { transportType, departureLocation, departureTime, arrivalLocation, arrivalTime, price, seatsAvailable, status, vendor } = req.body;
            const inventory = await TransportInventoryService.createTransportInventory(
                transportType,
                departureLocation,
                departureTime,
                arrivalLocation,
                arrivalTime,
                price,
                seatsAvailable,
                vendor,
                status
            );
            res.status(201).json(inventory);
        }
    );

    static getTransportInventories = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const inventories = await TransportInventoryService.getTransportInventories();
            res.status(200).json(inventories);
        }
    );

    static getTransportInventoryById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            const inventory = await TransportInventoryService.getTransportInventoryById(inventoryId);
            if (!inventory) {
                res.status(404).json({ message: 'Transport item not found' });
                return;
            }
            res.status(200).json(inventory);
        }
    );

    static updateTransportInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params;
            console.log('inventoryId: ', id);
            const { transportType, departureLocation, departureTime, arrivalLocation, arrivalTime, price, seatsAvailable, status  } = req.body;
            const inventory = await TransportInventoryService.updateTransportInventory(
                id,
                transportType,
                departureLocation,
                departureTime,
                arrivalLocation,
                arrivalTime,
                price,
                seatsAvailable,
                status
            );
            if (!inventory) {
                res.status(404).json({ message: 'Inventory item not found' });
                return;
            }
            res.status(200).json(inventory);
        }
    );

    static deleteTransportInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            await TransportInventoryService.deleteTransportInventory(inventoryId);
            res.status(204).json({ message: 'Inventory item deleted successfully' });
        }
    );
}

export default TransportInventoryController;