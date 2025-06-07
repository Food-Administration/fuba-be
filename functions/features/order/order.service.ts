import Order, { IOrder, OrderStatus } from './order.model';
import { Types } from 'mongoose';

export class OrderService {
  /**
   * Creates a new order
   * @param data - Partial order data
   * @returns The created order
   */
  async create(data: Partial<IOrder>): Promise<IOrder> {
    const order = new Order(data);
    return await order.save();
  }

  /**
   * Retrieves orders with pagination
   * @param filter - Mongoose filter query
   * @param options - Pagination options
   * @returns Orders with pagination data
   */
  async get(
    filter: import('mongoose').FilterQuery<IOrder> = {},
    options: { page?: number; limit?: number } = {}
  ): Promise<{
    orders: IOrder[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('consumer', 'name email')
        .populate('vendor', 'name email')
        .populate('items.foodItem', 'name price')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    return { orders, total, page, limit };
  }

  /**
   * Gets order by ID
   * @param id - Order ID
   * @returns The order if found
   */
  async getById(id: string): Promise<IOrder | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Order.findById(id)
      .populate('consumer', 'name email')
      .populate('vendor', 'name email')
      .populate('items.foodItem', 'name price');
  }

  /**
   * Updates order status
   * @param id - Order ID
   * @param status - New status
   * @returns Updated order
   */
  async updateStatus(id: string, status: OrderStatus): Promise<IOrder | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('consumer vendor items.foodItem');
  }

  /**
   * Gets orders by consumer ID
   * @param consumerId - Consumer user ID
   * @param options - Pagination options
   * @returns Consumer's orders
   */
  async getByConsumer(
    consumerId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    if (!Types.ObjectId.isValid(consumerId)) {
      return { orders: [], total: 0, page: 1, limit: options.limit || 10 };
    }
    return this.get({ consumer: new Types.ObjectId(consumerId) }, options);
  }

  /**
   * Gets orders by vendor ID
   * @param vendorId - Vendor user ID
   * @param options - Pagination options
   * @returns Vendor's orders
   */
  async getByVendor(
    vendorId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    if (!Types.ObjectId.isValid(vendorId)) {
      return { orders: [], total: 0, page: 1, limit: options.limit || 10 };
    }
    return this.get({ vendor: new Types.ObjectId(vendorId) }, options);
  }
}

export default new OrderService();