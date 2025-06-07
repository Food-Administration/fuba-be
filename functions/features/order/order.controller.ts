import { Request, Response } from 'express';
import OrderService from './order.service';
import asyncHandler from '../../utils/asyncHandler';

export class OrderController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderService.create(req.body);
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { orders, total, page, limit } = await OrderService.get(req.query);
    res.status(200).json({
      success: true,
      data: orders,
      meta: { total, page, limit }
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderService.getById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, data: order });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderService.updateStatus(
      req.params.id,
      req.body.status
    );
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${order.status}`
    });
  });

  getByConsumer = asyncHandler(async (req: Request, res: Response) => {
    const { orders, total, page, limit } = await OrderService.getByConsumer(
      req.params.consumerId,
      req.query
    );
    res.status(200).json({
      success: true,
      data: orders,
      meta: { total, page, limit }
    });
  });

  getByVendor = asyncHandler(async (req: Request, res: Response) => {
    const { orders, total, page, limit } = await OrderService.getByVendor(
      req.params.vendorId,
      req.query
    );
    res.status(200).json({
      success: true,
      data: orders,
      meta: { total, page, limit }
    });
  });
}

export default new OrderController();