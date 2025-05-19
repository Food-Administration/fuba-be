import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AccommodationInventoryService from '../services/accommodationInventory.service';

class AccommodationInventoryController {
    static createAccommodationInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { roomName, address, roomType, roomsAvailable, location, capacity, checkOutTime, price, services, utilities, status, vendor } = req.body;
            const inventory = await AccommodationInventoryService.createAccommodationInventory(
                roomName,
                address,
                roomType,
                roomsAvailable,
                location,
                capacity,
                price,
                checkOutTime,
                services,
                utilities,
                vendor,
                status
            );
            res.status(201).json(inventory);
        }
    );

    static getAccommodationInventories = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const inventories = await AccommodationInventoryService.getAccommodationInventories();
            res.status(200).json(inventories);
        }
    );

    static getAccommodationInventoryById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            const inventory = await AccommodationInventoryService.getAccommodationInventoryById(inventoryId);
            if (!inventory) {
                res.status(404).json({ message: 'Accommodation item not found' });
                return;
            }
            res.status(200).json(inventory);
        }
    );

    static updateAccommodationInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params;
            const { roomName, address, roomType, roomsAvailable, location, capacity, checkOutTime, checkInTime, price, services, utilities, status  } = req.body;
            const inventory = await AccommodationInventoryService.updateAccommodationInventory(
                id,
                roomName,
                address,
                roomType,
                roomsAvailable,
                location,
                capacity,
                checkInTime,
                checkOutTime,
                price,
                services,
                utilities,
                status
            );
            if (!inventory) {
                res.status(404).json({ message: 'Inventory item not found' });
                return;
            }
            res.status(200).json(inventory);
        }
    );

    static deleteAccommodationInventory = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { inventoryId } = req.params;
            await AccommodationInventoryService.deleteAccommodationInventory(inventoryId);
            res.status(204).json({ message: 'Inventory item deleted successfully' });
        }
    );
}

export default AccommodationInventoryController;