import Procurement from '../models/procurement.model';
import CustomError from '../utils/customError';
// import User from '../models/user.model'; // Adjust path to your Vendor model
// import mongoose from 'mongoose';
// import Budget from '../models/budget.model';
import RequestFlow from '../models/requestFlow.model'; // Import RequestFlow model
import mongoose from 'mongoose';
// import { User } from '../models/index';
import VendorInventory from '../models/inventories/vendorInventory.model';
import Budget from '../models/budget.model';
// import CompanyInventory from '../models/companyInventory.model';
import CompanyInventory from '../models/inventories/companyInventory.model';


class ProcurementService {

  async createProcurement(data: any) {
    const procurementFlow = await RequestFlow.findOne({ workflowItem: 'Procurement' });
    if (!procurementFlow) {
      throw new CustomError('No RequestFlow found with workflowItem "Budget"', 404);
    }
  
    // Enforce procurement category as "procurement"
    if (!data.category || data.category !== 'Procurement') {
      throw new CustomError('Category must be "procurement"', 400);
    }
  
    // Find a budget with a category titled "procurement"
    const budget = await Budget.findOne({
      'categories.title': 'Procurement',
    });
  
    if (!budget) {
      throw new CustomError('No budget found with a category titled "procurement"', 404);
    }
  
    const procurementData = {
      ...data,
      category: 'Procurement',
      budgetId: budget._id,
      flowId: procurementFlow._id,
    };
  
    const procurement = new Procurement(procurementData);
    return await procurement.save();
  }

  async processRequest(procurementId: string, data: { items: { budgetItem: string; unitPrice?: number; quantity?: number; amount?: number; vendorInventoryId?: string; vendor?: string; itemName?: string }[] }) {
    console.log("Starting processRequest with procurementId:", procurementId);
    console.log("Input data:", JSON.stringify(data, null, 2));
  
    // Start a MongoDB session for atomic updates
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Step 1: Find the procurement document
      const procurement = await Procurement.findById(procurementId).session(session);
      if (!procurement) {
        console.error("Procurement not found for ID:", procurementId);
        throw new CustomError('Procurement not found', 404);
      }
      console.log("Procurement found:", procurement);
  
      // Step 2: Validate required fields
      if (!procurement.procurementTitle || !procurement.category || !procurement.purposeOfRequest) {
        console.error("Missing required fields in procurement:", procurementId);
        throw new CustomError('Procurement title, category, and purpose of request are required', 400);
      }
  
      if (procurement.category !== 'Procurement') {
        console.error("Invalid category for procurement:", procurement.category);
        throw new CustomError('Category must be "Procurement"', 400);
      }
  
      // Step 3: Ensure budgetId is present
      if (!procurement.budgetId) {
        console.error("Budget ID is missing in procurement:", procurementId);
        throw new CustomError('Budget ID is required', 400);
      }
  
      // Step 4: Find the budget and validate
      const budget = await Budget.findById(procurement.budgetId).session(session);
      if (!budget) {
        console.error("Budget not found for ID:", procurement.budgetId);
        throw new CustomError('Budget not found', 404);
      }
      console.log("Budget found:", budget);
  
      if (budget.status !== 'approved') {
        console.error("Budget is not approved:", budget.status);
        throw new CustomError('Budget has not been approved yet', 400);
      }
  
      // Step 5: Find the Procurement category in the budget
      const budgetCategory = budget.categories.find((cat) => cat.title === 'Procurement');
      if (!budgetCategory) {
        console.error("Procurement category not found in budget:", procurement.budgetId);
        throw new CustomError('Procurement category not found in budget', 404);
      }
      console.log("Procurement category found:", budgetCategory);
  
      // Step 6: Validate budgetItem IDs for each item
      if (!data.items || data.items.length !== procurement.items.length) {
        console.error("Invalid items data provided:", data.items);
        throw new CustomError('Items array must match procurement items', 400);
      }
  
      const budgetItemIds = data.items.map((item) => item.budgetItem);
      const budgetItems = budgetCategory.budgetItems.filter((bi) =>
        bi._id && budgetItemIds.includes(bi._id.toString())
      );
  
      for (const [index, item] of data.items.entries()) {
        if (!item.budgetItem) {
          console.error(`Budget item ID is required for item at index ${index}:`, item);
          throw new CustomError(`Budget item ID is required for item at index ${index}`, 400);
        }
        const budgetItem = budgetItems.find((bi) => bi._id?.toString() === item.budgetItem);
        if (!budgetItem) {
          console.error(`Budget item not found for ID at index ${index}:`, item.budgetItem);
          throw new CustomError(`Budget item with ID ${item.budgetItem} not found in Procurement category`, 404);
        }
      }
      console.log("Budget items validated:", budgetItems.map((bi) => bi.itemName));
  
      // Step 7: Update items with unitPrice from VendorInventory, calculate amounts, and assign budgetItem
      const updatedItems = await Promise.all(
        procurement.items.map(async (item: any, index: number) => {
          const inputItem = data.items[index];
          const itemName = inputItem.itemName || item.itemName || `Item ${index + 1}`; // Fallback for itemName
          let unitPrice = inputItem.unitPrice || item.unitPrice || 0;
          let amount = inputItem.amount || item.amount || 0;
  
          console.log(`Processing item ${index}:`, { itemName, unitPrice, amount, vendorInventoryId: inputItem.vendorInventoryId });
  
          if (inputItem.vendorInventoryId) {
            const inventory = await VendorInventory.findById(inputItem.vendorInventoryId).session(session);
            if (!inventory) {
              console.error(`Vendor inventory not found for item ${itemName} at index ${index}:`, inputItem.vendorInventoryId);
              throw new CustomError(`Vendor inventory not found for item ${itemName}`, 404);
            }
            if (inventory.status !== 'available') {
              console.error(`Vendor inventory not available for item ${itemName} at index ${index}:`, inventory.status);
              throw new CustomError(`Vendor inventory for item ${itemName} is not available`, 400);
            }
            if (inventory.quantity < (inputItem.quantity ?? 0)) {
              console.error(`Insufficient vendor inventory quantity for item ${itemName} at index ${index}:`, inventory.quantity);
              throw new CustomError(`Insufficient quantity in vendor inventory for item ${itemName}`, 400);
            }
            unitPrice = inventory.price;
            amount = inventory.price * (inputItem.quantity ?? 0);
            console.log(`Updated item ${itemName} with unitPrice: ${unitPrice}, amount: ${amount}`);
          } else {
            if (unitPrice == null || unitPrice <= 0) {
              console.error(`Unit price missing or invalid for item ${itemName} without vendorInventoryId at index ${index}:`, unitPrice);
              throw new CustomError(`Unit price is required and must be positive for item ${itemName} without vendorInventoryId`, 400);
            }
            amount = unitPrice * (inputItem.quantity ?? 0);
            console.log(`Calculated amount for item ${itemName} without vendorInventoryId: ${amount}`);
          }
  
          // Assign the budgetItem from the input data
          const budgetItem = budgetItems.find((bi) => bi._id?.toString() === inputItem.budgetItem);
          if (!budgetItem) {
            throw new CustomError(`Budget item ${inputItem.budgetItem} not found for item ${itemName}`, 404);
          }
  
          // Validate budgetItem amount for this item's cost
          if (budgetItem.amount < amount) {
            console.error(
              `Budget item amount (${budgetItem.amount}) is less than item cost (${amount}) for item ${itemName} at index ${index}`
            );
            throw new CustomError(
              `Budget item amount (${budgetItem.amount}) is insufficient for item ${itemName} cost (${amount})`,
              400
            );
          }
  
          return {
            ...item.toObject(),
            itemName,
            unitPrice,
            amount,
            budgetItem: budgetItem._id,
            vendor: inputItem.vendor || item.vendor,
            vendorInventoryId: inputItem.vendorInventoryId || item.vendorInventoryId,
          };
        })
      );
      console.log("Updated procurement items:", JSON.stringify(updatedItems, null, 2));
  
      // Step 8: Calculate totalCost
      const totalCost = updatedItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      console.log("Calculated total cost:", totalCost);
  
      // Step 9: Validate budgetCategory amount
      if (budgetCategory.amount < totalCost) {
        console.error(
          `Budget category amount (${budgetCategory.amount}) is insufficient for total cost (${totalCost})`
        );
        throw new CustomError(
          'Procurement category amount is insufficient for the total cost',
          400
        );
      }
  
      // Step 10: Update the procurement document
      const updatedProcurement = await Procurement.findByIdAndUpdate(
        procurementId,
        {
          items: updatedItems,
          totalCost,
          status: 'processed',
          lastUpdatedBy: procurement.lastUpdatedBy, // Preserve or update as needed
        },
        { new: true, session }
      )
        .populate('createdBy lastUpdatedBy approvedById', 'fullName email firstName lastName')
        .populate('budgetId')
        .populate('flowId')
        .populate({
          path: 'createdBy lastUpdatedBy approvedById',
          select: 'fullName firstName lastName email',
          strictPopulate: false,
        });
  
      if (!updatedProcurement) {
        console.error("Failed to update procurement for ID:", procurementId);
        throw new CustomError('Procurement not found', 404);
      }
      console.log("Updated procurement:", JSON.stringify(updatedProcurement.toObject(), null, 2));
  
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
  
      return updatedProcurement;
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async receiveItem(procurementId: string, itemId: string, userId: string) {
    console.log(`Starting receiveItem with procurementId: ${procurementId}, itemId: ${itemId}`);
  
    // Start a MongoDB session for atomic updates
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Step 1: Find the procurement document
      const procurement = await Procurement.findById(procurementId).session(session);
      if (!procurement) {
        console.error(`Procurement not found for ID: ${procurementId}`);
        throw new CustomError('Procurement not found', 404);
      }
      console.log('Procurement found:', procurement);
  
      // Step 2: Find the specific item in the procurement
      const item = procurement.items.find((i: any) => i._id.toString() === itemId);
      if (!item) {
        console.error(`Item not found for ID: ${itemId} in procurement: ${procurementId}`);
        throw new CustomError('Item not found in procurement', 404);
      }
      console.log('Item found:', item);
  
      // Step 3: Check if the item is already accepted or rejected
      if (item.status === 'accepted') {
        console.error(`Item ${item.itemName} is already accepted`);
        throw new CustomError('Item is already accepted', 400);
      }
      if (item.status === 'rejected') {
        console.error(`Item ${item.itemName} is already rejected`);
        throw new CustomError('Item is already rejected', 400);
      }
  
      // Step 4: Ensure budgetId and budgetItem are present
      if (!procurement.budgetId || !item.budgetItem) {
        console.error('Budget ID or budgetItem ID is missing');
        throw new CustomError('Budget ID and budgetItem ID are required', 400);
      }
  
      // Step 5: Find the budget
      const budget = await Budget.findById(procurement.budgetId).session(session);
      if (!budget) {
        console.error(`Budget not found for ID: ${procurement.budgetId}`);
        throw new CustomError('Budget not found', 404);
      }
      console.log('Budget found:', budget);
  
      if (budget.status !== 'approved') {
        console.error(`Budget is not approved: ${budget.status}`);
        throw new CustomError('Budget has not been approved yet', 400);
      }
  
      // Step 6: Find the Procurement category in the budget
      const budgetCategory = budget.categories.find((cat) => cat.title === 'Procurement');
      if (!budgetCategory) {
        console.error(`Procurement category not found in budget: ${procurement.budgetId}`);
        throw new CustomError('Procurement category not found in budget', 404);
      }
      console.log('Procurement category found:', budgetCategory);
  
      // Step 7: Find the specific budget item
      const budgetItem = budgetCategory.budgetItems.find((bi) => bi._id?.toString() === item.budgetItem.toString());
      if (!budgetItem) {
        console.error(`Budget item not found for ID: ${item.budgetItem}`);
        throw new CustomError('Budget item not found in Procurement category', 404);
      }
      console.log('Budget item found:', budgetItem);
  
      // Step 8: Check if budgetItem amount is sufficient for the item's actualAmount
      if (budgetItem.amount < item.actualAmount) {
        console.error(
          `Budget item amount (${budgetItem.amount}) is insufficient for item ${item.itemName} cost (${item.actualAmount})`
        );
        throw new CustomError(
          `Insufficient budget for item ${item.itemName}. Available: ${budgetItem.amount}, Required: ${item.actualAmount}`,
          400
        );
      }
  
      // Step 9: Deduct the actualAmount from the budgetItem amount
      budgetItem.amount -= item.actualAmount;
      console.log(`Deducted ${item.actualAmount} from budget item ${budgetItem.itemName}. New amount: ${budgetItem.amount}`);
  
      // Step 10: Update the budgetCategory amount (sum of budgetItems amounts)
      budgetCategory.amount = budgetCategory.budgetItems.reduce((sum, bi) => sum + bi.amount, 0);
      console.log(`Updated budget category amount: ${budgetCategory.amount}`);
  
      // Step 11: Save the updated budget
      await budget.save({ session });
      console.log('Budget updated successfully');
  
      // Step 12: Mark the item as accepted
      item.status = 'accepted';
      console.log(`Marked item ${item.itemName} as accepted`);
  
      // Step 13: Update the procurement document
      procurement.lastUpdatedBy = new mongoose.Types.ObjectId(userId);
      // procurement.lastUpdatedAt = new Date();
      await procurement.save({ session });
      console.log('Procurement updated successfully');
  
      // Step 14: Commit the transaction
      await session.commitTransaction();
      session.endSession();
      console.log('Transaction committed');
  
      return {
        message: `Item ${item.itemName} accepted successfully`,
        procurement: procurement.toObject(),
      };
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();
      console.error('Error in receiveItem:', error);
      throw error;
    }
  }

  async rejectItem(procurementId: string, itemId: string, userId: string) {
    console.log(`Starting rejectItem with procurementId: ${procurementId}, itemId: ${itemId}`);
  
    // Start a MongoDB session for atomic updates
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Step 1: Find the procurement document
      const procurement = await Procurement.findById(procurementId).session(session);
      if (!procurement) {
        console.error(`Procurement not found for ID: ${procurementId}`);
        throw new CustomError('Procurement not found', 404);
      }
      console.log('Procurement found:', procurement);
  
      // Step 2: Find the specific item in the procurement
      const item = procurement.items.find((i: any) => i._id.toString() === itemId);
      if (!item) {
        console.error(`Item not found for ID: ${itemId} in procurement: ${procurementId}`);
        throw new CustomError('Item not found in procurement', 404);
      }
      console.log('Item found:', item);
  
      // Step 3: Check if the item is already accepted or rejected
      if (item.status === 'accepted') {
        console.error(`Item ${item.itemName} is already accepted`);
        throw new CustomError('Item is already accepted', 400);
      }
      if (item.status === 'rejected') {
        console.error(`Item ${item.itemName} is already rejected`);
        throw new CustomError('Item is already rejected', 400);
      }
  
      // Step 4: Mark the item as rejected
      item.status = 'rejected';
      console.log(`Marked item ${item.itemName} as rejected`);
  
      // Step 5: Update the procurement document
      procurement.lastUpdatedBy = new mongoose.Types.ObjectId(userId);
      // procurement.lastUpdated = new Date();
      await procurement.save({ session });
      console.log('Procurement updated successfully');
  
      // Step 6: Commit the transaction
      await session.commitTransaction();
      session.endSession();
      console.log('Transaction committed');
  
      return {
        message: `Item ${item.itemName} rejected successfully`,
        procurement: procurement.toObject(),
      };
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();
      console.error('Error in rejectItem:', error);
      throw error;
    }
  }

  async addItemToInventory(data: any) {
    const { itemName, quantity, unitPrice, procurementId, procurementItemId, addedBy } = data;
  
    if (!itemName || !quantity || quantity <= 0 || !procurementId || !procurementItemId || !addedBy) {
      throw new CustomError('itemName, quantity, procurementId, procurementItemId, and addedBy are required', 400);
    }
  
    console.log(`addItemToInventory: Starting for item ${itemName}, procurementId: ${procurementId}, procurementItemId: ${procurementItemId}`);
  
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Find the procurement
      const procurement = await Procurement.findById(procurementId).session(session);
      if (!procurement) {
        console.error(`Procurement not found for ID: ${procurementId}`);
        throw new CustomError('Procurement not found', 404);
      }
  
      // Find the specific procurement item
      const procurementItem = procurement.items.find((item: any) => item._id.toString() === procurementItemId);
      if (!procurementItem) {
        console.error(`Item not found for ID: ${procurementItemId} in procurement: ${procurementId}`);
        throw new CustomError('Item not found in procurement', 404);
      }
  
      if (procurementItem.status !== 'accepted') {
        console.error(`Item ${itemName} is not accepted, status: ${procurementItem.status}`);
        throw new CustomError(`Item ${itemName} must be accepted before adding to inventory`, 400);
      }
  
      if (procurementItem.addedToInventory) {
        console.warn(`Item ${itemName} is already added to inventory`);
        throw new CustomError(`Item ${itemName} is already added to inventory`, 400);
      }
  
      // Update or create inventory item
      let inventoryItem = await CompanyInventory.findOne({ itemName }).session(session);
  
      if (inventoryItem) {
        console.log(`Found existing inventory item: ${itemName}, current quantity: ${inventoryItem.quantity}`);
        inventoryItem.quantity += quantity;
        // inventoryItem.price = unitPrice || inventoryItem.price || 0;
        inventoryItem.status = inventoryItem.quantity > 0 ? 'in-stock' : 'out-of-stock';
        await inventoryItem.save({ session });
        console.log(`Updated inventory item: ${itemName}, new quantity: ${inventoryItem.quantity}`);
      } else {
        console.log(`No existing inventory item found for ${itemName}, creating new`);
        inventoryItem = new CompanyInventory({
          itemName,
          category: procurement.category || 'General',
          quantity,
          unitPrice: unitPrice || procurementItem.unitPrice || 0,
          status: quantity > 0 ? 'in-stock' : 'out-of-stock',
          createdBy: new mongoose.Types.ObjectId(addedBy),
        });
        await inventoryItem.save({ session });
        console.log(`Created new inventory item: ${itemName}, quantity: ${inventoryItem.quantity}`);
      }
  
      // Update procurement item
      procurementItem.addedToInventory = true;
      procurement.lastUpdatedBy = new mongoose.Types.ObjectId(addedBy);
      await procurement.save({ session });
      console.log(`Updated procurement item ${itemName}, addedToInventory: true`);
  
      // Commit transaction
      await session.commitTransaction();
      session.endSession();
      console.log('Transaction committed successfully');
  
      // Fetch updated procurement to ensure fresh data
      const updatedProcurement = await Procurement.findById(procurementId)
        .populate('createdBy lastUpdatedBy', 'fullName email firstName lastName')
        .populate('budgetId')
        .populate('flowId');
  
      if (!updatedProcurement) {
        console.error(`Failed to fetch updated procurement: ${procurementId}`);
        throw new CustomError('Updated procurement not found', 404);
      }
  
      return {
        message: `Item ${itemName} updated in inventory successfully`,
        inventoryItem: inventoryItem.toObject(),
        procurement: updatedProcurement.toObject(),
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in addItemToInventory:', error);
      throw error;
    }
  }

  async updateInventory(data: any) {
    const { itemName, quantity, unitPrice, procurementId, procurementItemId, addedBy } = data;
  
    if (!itemName || !quantity || quantity <= 0 || !procurementId || !procurementItemId || !addedBy) {
      throw new CustomError('itemName, quantity, procurementId, procurementItemId, and addedBy are required', 400);
    }
  
    console.log(`updateInventory: Starting for item ${itemName}, procurementId: ${procurementId}, procurementItemId: ${procurementItemId}`);
  
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Find the procurement
      const procurement = await Procurement.findById(procurementId).session(session);
      if (!procurement) {
        console.error(`Procurement not found for ID: ${procurementId}`);
        throw new CustomError('Procurement not found', 404);
      }
  
      // Find the specific procurement item
      const procurementItem = procurement.items.find((item: any) => item._id.toString() === procurementItemId);
      if (!procurementItem) {
        console.error(`Item not found for ID: ${procurementItemId} in procurement: ${procurementId}`);
        throw new CustomError('Item not found in procurement', 404);
      }
  
      if (procurementItem.status !== 'accepted') {
        console.error(`Item ${itemName} is not accepted, status: ${procurementItem.status}`);
        throw new CustomError(`Item ${itemName} must be accepted before updating inventory`, 400);
      }
  
      // Update or create inventory item
      let inventoryItem = await CompanyInventory.findOne({ itemName }).session(session);
  
      if (inventoryItem) {
        console.log(`Found existing inventory item: ${itemName}, current quantity: ${inventoryItem.quantity}`);
        inventoryItem.quantity += quantity;
        // inventoryItem.unitPrice = unitPrice || inventoryItem.unitPrice || 0;
        inventoryItem.status = inventoryItem.quantity > 0 ? 'in-stock' : 'out-of-stock';
        await inventoryItem.save({ session });
        console.log(`Updated inventory item: ${itemName}, new quantity: ${inventoryItem.quantity}`);
      } else {
        console.log(`No existing inventory item found for ${itemName}, creating new`);
        inventoryItem = new CompanyInventory({
          itemName,
          category: procurement.category || 'General',
          quantity,
          unitPrice: unitPrice || procurementItem.unitPrice || 0,
          status: quantity > 0 ? 'in-stock' : 'out-of-stock',
          createdBy: new mongoose.Types.ObjectId(addedBy),
        });
        await inventoryItem.save({ session });
        console.log(`Created new inventory item: ${itemName}, quantity: ${inventoryItem.quantity}`);
      }
  
      // Update procurement item
      procurementItem.addedToInventory = true;
      procurementItem.quantityToShip = quantity; // Update quantityToShip to reflect the latest update
      procurement.lastUpdatedBy = new mongoose.Types.ObjectId(addedBy);
      await procurement.save({ session });
      console.log(`Updated procurement item ${itemName}, addedToInventory: true, quantityToShip: ${quantity}`);
  
      // Commit transaction
      await session.commitTransaction();
      session.endSession();
      console.log('Transaction committed successfully');
  
      // Fetch updated procurement
      const updatedProcurement = await Procurement.findById(procurementId)
        .populate('createdBy lastUpdatedBy', 'fullName email firstName lastName')
        .populate('budgetId')
        .populate('flowId');
  
      if (!updatedProcurement) {
        console.error(`Failed to fetch updated procurement: ${procurementId}`);
        throw new CustomError('Updated procurement not found', 404);
      }
  
      return {
        message: `Item ${itemName} updated in inventory successfully`,
        inventoryItem: inventoryItem.toObject(),
        procurement: updatedProcurement.toObject(),
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in updateInventory:', error);
      throw error;
    }
  }

  async getProcurements() {
    return await Procurement.find()
      .populate({
        path: 'user',
        select: 'fullName email firstName lastName',
        strictPopulate: false,
      })
      .populate('createdBy lastUpdatedBy', 'fullName email firstName lastName')
      .populate('budgetId')
      .populate('flowId');
  }

  async getProcurementById(id: string) {
    const procurement = await Procurement.findById(id)
      .populate({
        path: 'user',
        select: 'fullName email firstName lastName',
        strictPopulate: false,
      })
      .populate('createdBy lastUpdatedBy', 'fullName email firstName lastName')
      .populate('budgetId')
      .populate('flowId');

    if (!procurement) {
      throw new CustomError('Procurement not found', 404);
    }
    return procurement;
  }

  async updateProcurement(id: string, data: any) {
    console.log("Starting updateProcurement with id:", id);
    console.log("Update data:", JSON.stringify(data, null, 2));
  
    // Find the procurement document
    const procurement = await Procurement.findById(id);
    if (!procurement) {
      console.error("Procurement not found for ID:", id);
      throw new CustomError('Procurement not found', 404);
    }
  
    // If items are provided, validate and update each item
    if (data.items && Array.isArray(data.items)) {
      const updatedItems = await Promise.all(
        procurement.items.map(async (existingItem: any) => {
          // Match by _id if provided
          const updateItem = data.items.find((item: any) => item._id === existingItem._id?.toString()) || {};
  
          // Validate vendorInventoryId if provided
          if (updateItem.vendorInventoryId) {
            const inventory = await VendorInventory.findById(updateItem.vendorInventoryId);
            if (!inventory) {
              console.error(`Vendor inventory not found for item ${updateItem.itemName || existingItem.itemName} with vendorInventoryId ${updateItem.vendorInventoryId}`);
              throw new CustomError(
                `Vendor inventory not found for item ${updateItem.itemName || existingItem.itemName} with vendorInventoryId ${updateItem.vendorInventoryId}`,
                400
              );
            }
          }
  
          // Merge existing item with updateItem, preserving all fields
          const updatedItem = {
            ...existingItem.toObject(),
            itemName: updateItem.itemName !== undefined ? updateItem.itemName : existingItem.itemName,
            quantity: updateItem.quantity !== undefined ? updateItem.quantity : existingItem.quantity,
            quantityToShip: updateItem.quantityToShip !== undefined ? updateItem.quantityToShip : existingItem.quantityToShip,
            unitPrice: updateItem.unitPrice !== undefined ? updateItem.unitPrice : existingItem.unitPrice,
            amount: updateItem.amount !== undefined ? updateItem.amount : existingItem.amount,
            actualAmount: updateItem.actualAmount !== undefined ? updateItem.actualAmount : existingItem.actualAmount,
            vendor: updateItem.vendor !== undefined ? updateItem.vendor : existingItem.vendor,
            vendorInventoryId: updateItem.vendorInventoryId !== undefined ? updateItem.vendorInventoryId : existingItem.vendorInventoryId,
            budgetItem: updateItem.budgetItem !== undefined ? updateItem.budgetItem : existingItem.budgetItem,
          };
  
          console.log(`Updated item for _id ${existingItem._id}:`, JSON.stringify(updatedItem, null, 2));
          return updatedItem;
        })
      );
  
      // Update the items array in the data object
      data.items = updatedItems;
      console.log("Prepared updatedItems:", JSON.stringify(updatedItems, null, 2));
    }
  
    // Perform the update using $set to preserve non-updated fields
    const updatedProcurement = await Procurement.findByIdAndUpdate(
      id,
      { $set: { ...data, items: data.items } }, // Explicitly set items to ensure subdocument update
      { new: true, runValidators: true }
    )
      .populate({
        path: 'items.vendor',
        select: 'fullName email firstName lastName',
      })
      .populate('createdBy lastUpdatedBy', 'fullName email firstName lastName')
      .populate('budgetId')
      .populate('flowId');
  
    if (!updatedProcurement) {
      console.error("Failed to update procurement for ID:", id);
      throw new CustomError('Procurement not found', 404);
    }
  
    console.log("Updated procurement:", JSON.stringify(updatedProcurement.toObject(), null, 2));
    return updatedProcurement.toObject(); // Ensure all fields are included in the response
  }

  async deleteProcurement(id: string) {
    const procurement = await Procurement.findByIdAndDelete(id);
    if (!procurement) {
      throw new CustomError('Procurement not found', 404);
    }
    return { message: 'Procurement deleted successfully' };
  }
}

export default new ProcurementService();