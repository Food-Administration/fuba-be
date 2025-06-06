import { Request, Response } from 'express';
import PropertyService from './property.service';
import asyncHandler from '../../utils/asyncHandler';

export class PropertyController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertyService.create(req.body);
    res.status(201).json(property);
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const properties = await PropertyService.get(req.query);
    res.status(200).json(properties);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertyService.getById(req.params.id);
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.status(200).json(property);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertyService.update(req.params.id, req.body);
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.status(200).json(property);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertyService.delete(req.params.id);
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.status(204).json({ message: 'Property deleted successfully' });
  });
}

export default new PropertyController();
