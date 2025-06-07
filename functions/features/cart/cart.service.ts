import Cart, { ICart } from './cart.model';
import { Types } from 'mongoose';

export class CartService {
  /**
   * Creates a new cart or updates existing one
   * @param data - Cart data
   * @returns The created/updated cart
   */
  async createOrUpdate(data: Partial<ICart>): Promise<ICart> {
    const cart = await Cart.findOneAndUpdate(
      { consumer: data.consumer },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('items.foodItem', 'name price');
    return cart;
  }

  /**
   * Retrieves cart by consumer ID
   * @param consumerId - Consumer user ID
   * @returns The cart if found
   */
  async getByConsumer(consumerId: string): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(consumerId)) return null;
    return await Cart.findOne({ consumer: consumerId })
      .populate('consumer', 'name email')
      .populate('items.foodItem', 'name price image');
  }

  /**
   * Adds item to cart
   * @param consumerId - Consumer user ID
   * @param foodItemId - Food item ID to add
   * @param quantity - Quantity to add
   * @returns Updated cart
   */
  async addItem(
    consumerId: string,
    foodItemId: string,
    quantity: number = 1
  ): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(consumerId)) return null;
    if (!Types.ObjectId.isValid(foodItemId)) return null;

    return await Cart.findOneAndUpdate(
      { consumer: consumerId },
      {
        $push: {
          items: { foodItem: foodItemId, quantity }
        }
      },
      { new: true, upsert: true }
    ).populate('items.foodItem', 'name price');
  }

  /**
   * Updates item quantity in cart
   * @param consumerId - Consumer user ID
   * @param foodItemId - Food item ID to update
   * @param quantity - New quantity
   * @returns Updated cart
   */
  async updateItemQuantity(
    consumerId: string,
    foodItemId: string,
    quantity: number
  ): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(consumerId)) return null;
    if (!Types.ObjectId.isValid(foodItemId)) return null;

    return await Cart.findOneAndUpdate(
      { 
        consumer: consumerId,
        'items.foodItem': foodItemId 
      },
      {
        $set: {
          'items.$.quantity': quantity
        }
      },
      { new: true }
    ).populate('items.foodItem', 'name price');
  }

  /**
   * Removes item from cart
   * @param consumerId - Consumer user ID
   * @param foodItemId - Food item ID to remove
   * @returns Updated cart
   */
  async removeItem(
    consumerId: string,
    foodItemId: string
  ): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(consumerId)) return null;
    if (!Types.ObjectId.isValid(foodItemId)) return null;

    return await Cart.findOneAndUpdate(
      { consumer: consumerId },
      {
        $pull: {
          items: { foodItem: foodItemId }
        }
      },
      { new: true }
    ).populate('items.foodItem', 'name price');
  }

  /**
   * Clears cart
   * @param consumerId - Consumer user ID
   * @returns Empty cart
   */
  async clearCart(consumerId: string): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(consumerId)) return null;
    return await Cart.findOneAndUpdate(
      { consumer: consumerId },
      { items: [] },
      { new: true }
    );
  }
}

export default new CartService();