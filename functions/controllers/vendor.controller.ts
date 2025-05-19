import { Request, Response } from 'express';
import VendorService from '../services/vendor.service';
import { VendorDto } from '../models/Dtos/entities.dto';
import asyncHandler from '../utils/asyncHandler';

class VendorController {
 static createVendor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // const userData: CreateUserDto = req.body;
      const vendorData: VendorDto = req.body;
      const vendor = await VendorService.createVendor(vendorData);
      res.status(201).json(vendor);
    }
  );

  static getVendors = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const users = await VendorService.getVendors();
      res.status(200).json(users);
    }
  );

  static getVendorById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { vendorId } = req.params;
    //   console.log('userId: ', userId);
      const user = await VendorService.getVendorById(vendorId as string);
      if (!user) {
        res.status(404).json({ message: 'Vendor not found' });
        return;
      }
      res.status(200).json(user);
    }
  );

  static updateVendor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const updateData = req.body;
      const vendor = await VendorService.updateVendor(req.params.vendorId, updateData);
      if (!vendor) {
        res.status(404).json({ message: 'Vendor not found' });
        return;
      }
      res.status(200).json(vendor);
    }
  );

  static deleteVendor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const vendor = await VendorService.deleteVendor(req.params.vendorId);
      if (!vendor) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json({ message: 'User deleted successfully' });
    }
  );

  static importVendors = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      if (req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ message: 'Invalid Content-Type. Expected application/json.' });
        return;
      }

      const parsedData = req.body;

      if (!Array.isArray(parsedData)) {
        res.status(400).json({ message: 'Invalid input. Expected an array of vendors.' });
        return;
      }

      const requiredFields = ['email', 'vendorLegalName', 'businessType', 'vendorType', 'startDate', 'endDate', 'phNo', 'status'];
      const invalidEntries = parsedData.filter((item: any) => {
        return !requiredFields.every((field) => field in item && item[field]);
      });

      if (invalidEntries.length > 0) {
        res.status(400).json({
          message: 'Invalid input. Some user objects are missing required fields.',
          invalidEntries,
        });
        return;
      }

      try {
        const uniqueEmails = new Set();
        const filteredData = parsedData.filter((item: any) => {
          if (!item.email || uniqueEmails.has(item.email)) {
            return false;
          }
          uniqueEmails.add(item.email);
          return true;
        });

        console.log('Filtered data (no duplicates):', filteredData);

        if (filteredData.length === 0) {
          res.status(400).json({ message: 'Uploaded data is empty or contains only duplicates.' });
          return;
        }

        const result = await VendorService.importVendors(filteredData);

        res.status(200).json({
          message: 'Users imported successfully',
          stats: {
            totalAttempted: filteredData.length,
            successfullyImported: result.successCount,
            duplicatesFound: result.duplicateEmails.length,
            errorsOccurred: result.errors.length,
          },
          duplicates: result.duplicateEmails,
          errors: result.errors,
        });
      } catch (error: any) {
        console.error('Error processing uploaded data:', error);
        res.status(500).json({ message: 'Failed to process uploaded data', error: error.message });
      }
    }
  );
}

export default VendorController;