import { Request, Response } from 'express';
import CartService from './cart.service';
import asyncHandler from '../../utils/asyncHandler';

export class CartController {
  getCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await CartService.getByConsumer(req.params.consumerId);
    if (!cart) {
      res.status(200).json({ 
        success: true,
        data: { items: [] },
        message: 'Cart is empty'
      });
      return;
    }
    res.status(200).json({ success: true, data: cart });
  });

  addItem = asyncHandler(async (req: Request, res: Response) => {
    const { foodItemId, quantity } = req.body;
    const cart = await CartService.addItem(
      req.params.consumerId,
      foodItemId,
      quantity
    );
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item added to cart'
    });
  });

  updateItem = asyncHandler(async (req: Request, res: Response) => {
    const { quantity } = req.body;
    const cart = await CartService.updateItemQuantity(
      req.params.consumerId,
      req.params.foodItemId,
      quantity
    );
    if (!cart) {
      res.status(404).json({ 
        success: false,
        error: 'Item not found in cart'
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart item updated'
    });
  });

  removeItem = asyncHandler(async (req: Request, res: Response) => {
    const cart = await CartService.removeItem(
      req.params.consumerId,
      req.params.foodItemId
    );
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item removed from cart'
    });
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await CartService.clearCart(req.params.consumerId);
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart cleared'
    });
  });
}

export default new CartController();