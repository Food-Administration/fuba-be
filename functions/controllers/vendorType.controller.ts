import { Request, Response } from 'express';
import VendorTypeService from '../services/vendorType.service';
import asyncHandler from '../utils/asyncHandler';

class VendorTypeController {
    static createVendorType = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { name, description } = req.body;
            const vendorType = await VendorTypeService.createVendorType(name, description);
            res.status(201).json(vendorType);
        }
    );

    static getVendorTypes = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const vendorTypes = await VendorTypeService.getVendorTypes();
            res.status(200).json(vendorTypes);
        }
    );

    static getVendorTypeById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendorTypeId } = req.params;
            const vendorType = await VendorTypeService.getVendorTypeById(vendorTypeId);
            if (!vendorType) {
                res.status(404).json({ message: 'Vendor type not found' });
                return;
            }
            res.status(200).json(vendorType);
        }
    );

    static updateVendorType = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendorTypeId } = req.params;
            const { name, description } = req.body;
            const vendorType = await VendorTypeService.updateVendorType(vendorTypeId, name, description);
            if (!vendorType) {
                res.status(404).json({ message: 'Vendor type not found' });
                return;
            }
            res.status(200).json(vendorType);
        }
    );

    static deleteVendorType = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendorTypeId } = req.params;
            await VendorTypeService.deleteVendorType(vendorTypeId);
            res.status(204).json({ message: 'Vendor type deleted successfully' });
        }
    );
}

export default VendorTypeController;