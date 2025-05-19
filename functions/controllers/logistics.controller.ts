import { Request, Response } from 'express';
import LogisticsService from '../services/logistics.service';
import asyncHandler from '../utils/asyncHandler';
import { Types } from 'mongoose';
import CustomError from '../utils/customError';

interface AuthenticatedRequest extends Request {
  user: Express.User & { id: string; companyName?: string; email?: string };
}

class LogisticsController {
  private assertAuthenticated(
    req: Request
  ): asserts req is AuthenticatedRequest {
    if (!req.user) {
      throw new Error('User is not authenticated');
    }
  }

  createLogistics = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);
    const logistics = await LogisticsService.createLogistics({
      ...req.body,
      createdBy: new Types.ObjectId(req.user.id),
      traveler: new Types.ObjectId(req.user.id),
      lastUpdatedBy: new Types.ObjectId(req.user.id),
    });
    res.status(201).json(logistics);
  });

  getLogistics = asyncHandler(async (req: Request, res: Response) => {
    const logistics = await LogisticsService.getLogistics();
    res.status(200).json(logistics);
  });

  getLogisticsById = asyncHandler(async (req: Request, res: Response) => {
    const logistics = await LogisticsService.getLogisticsById(req.params.id);
    if (!logistics) {
      throw new CustomError('Logistics request not found', 404);
    }
    res.status(200).json(logistics);
  });

  // updateLogistics = asyncHandler(async (req: Request, res: Response) => {
  //   this.assertAuthenticated(req);
  //   const logistics = await LogisticsService.updateLogistics(req.params.id, {
  //     ...req.body,
  //   });
  //   res.status(200).json(logistics);
  // });

  updateLogistics = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);

    // Basic validation
    // if (
    //   req.body.status &&
    //   !['pending', 'approved', 'processed', 'rejected', 'completed'].includes(
    //     req.body.status
    //   )
    // ) {
    //   throw new CustomError('Invalid status value', 400);
    // }

    const logistics = await LogisticsService.updateLogistics(req.params.id, {
      ...req.body,
      lastUpdatedBy: new Types.ObjectId(req.user.id),
    });

    res.status(200).json(logistics);
  });

   // New endpoint for updating alignedAmount
   updateAlignedAmount = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);

    const { id } = req.params;
    const alignedAmount = req.body.alignedAmount;

    if (!alignedAmount || typeof alignedAmount !== 'object') {
      throw new CustomError(
        'alignedAmount must be provided in request body',
        400
      );
    }

    const updateData = {
      ...alignedAmount,
      lastUpdatedBy: new Types.ObjectId(req.user.id),
    };

    const logistics = await LogisticsService.updateAlignedAmount(
      id,
      updateData
    );

    res.status(200).json(logistics);
  });

  updateTransportationItem = asyncHandler(
    async (req: Request, res: Response) => {
      this.assertAuthenticated(req);

      const { id, itemId } = req.params;

      // Get the entire transportationDetails object from body
      const transportationDetails = req.body.transportationDetails;

      console.log('transportationDetails:', transportationDetails); // Debugging line

      if (!transportationDetails || typeof transportationDetails !== 'object') {
        throw new CustomError(
          'transportationDetails must be provided in request body',
          400
        );
      }

      const updateData = {
        ...transportationDetails,
        lastUpdatedBy: new Types.ObjectId(req.user.id),
      };

      const logistics = await LogisticsService.updateTransportationItem(
        id,
        itemId,
        updateData
      );

      res.status(200).json(logistics);
    }
  );

  updateAccommodationItem = asyncHandler(
    async (req: Request, res: Response) => {
      this.assertAuthenticated(req);

      const { id, itemId } = req.params;

       // Get the entire transportationDetails object from body
       const accommodationDetails = req.body.accommodationDetails;

      //  console.log('transportationDetails:', accommodationDetails); // Debugging line
 
       if (!accommodationDetails || typeof accommodationDetails !== 'object') {
         throw new CustomError(
           'accommodationDetails must be provided in request body',
           400
         );
       }
 
       const updateData = {
         ...accommodationDetails,
         lastUpdatedBy: new Types.ObjectId(req.user.id),
       };

      const logistics = await LogisticsService.updateAccommodationItem(
        id,
        itemId,
        updateData
      );
      res.status(200).json(logistics);
    }
  );

  updateExpenseItem = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);

    const { id, itemId } = req.params;

     // Get the entire transportationDetails object from body
     const additionalExpensesDetails = req.body.additionalExpenses;

     if (!additionalExpensesDetails || typeof additionalExpensesDetails !== 'object') {
       throw new CustomError(
         'additionalExpensesDetails must be provided in request body',
         400
       );
     }

     const updateData = {
       ...additionalExpensesDetails,
       lastUpdatedBy: new Types.ObjectId(req.user.id),
     };

    const logistics = await LogisticsService.updateExpenseItem(
      id,
      itemId,
      updateData
    );
    res.status(200).json(logistics);
  });

  deleteLogistics = asyncHandler(async (req: Request, res: Response) => {
    await LogisticsService.deleteLogistics(req.params.id);
    res.status(200).json({ message: 'Logistics deleted successfully' });
  });

  deleteTransportationItem = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);

    const { id, itemId } = req.params;

    const result = await LogisticsService.deleteTransportationItem(id, itemId);

    res.status(200).json(result);
  });

  deleteAccommodationItem = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);

    const { id, itemId } = req.params;

    const result = await LogisticsService.deleteAccommodationItem(id, itemId);

    res.status(200).json(result);
  });

  deleteExpenseItem = asyncHandler(async (req: Request, res: Response) => {
    this.assertAuthenticated(req);

    const { id, itemId } = req.params;

    const result = await LogisticsService.deleteExpenseItem(id, itemId);

    res.status(200).json(result);
  });


}

export default new LogisticsController();
