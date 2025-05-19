import requestFlowModel from '../models/requestFlow.model';
import CustomError from '../utils/customError';
import budgetModel from '../models/budget.model';
import Logistics from '../models/logistics.model';

class LogisticsService {
  async createLogistics(data: any) {
    const procurementFlow = await requestFlowModel.findOne({
      workflowItem: 'Logistics',
    });
    if (!procurementFlow) {
      throw new CustomError(
        'No RequestFlow found with workflowItem "Budget"',
        404
      );
    }

    if (!data.category) {
      data.category = 'Logistics';
    }

    if (data.category !== 'Logistics') {
      throw new CustomError('Category must be "Logistics"', 400);
    }

    const budget = await budgetModel.findOne({
      'categories.title': 'Logistics',
    });

    if (!budget) {
      throw new CustomError(
        'No budget found with a category titled "Logistics"',
        404
      );
    }

    const logisticsData = {
      ...data,
      category: 'Logistics',
      budgetId: budget._id,
      flowId: procurementFlow._id,
    };

    const logistics = new Logistics(logisticsData);
    return await logistics.save();
  }

  async getLogistics() {
    return await Logistics.find()
      .populate({
        path: 'user',
        select: 'fullName email firstName lastName',
        strictPopulate: false,
      })
      .populate('createdBy traveler', 'fullName email firstName lastName')
      .populate('budgetId')
      .populate('flowId')
      .populate({
        path: 'transportationDetails.vendorId',
        select: 'fullName email contactInfo vendorCompanyInfo',
      })
      .populate({
        path: 'accommodationDetails.vendorId',
        select: 'fullName email contactInfo vendorCompanyInfo',
      });
  }
  
  async getLogisticsById(id: string) {
    const logistics = await Logistics.findById(id)
      .populate({
        path: 'user',
        select: 'fullName email firstName lastName',
        strictPopulate: false,
      })
      .populate('createdBy traveler', 'fullName email firstName lastName')
      .populate('budgetId')
      .populate('flowId')
      .populate({
        path: 'transportationDetails.vendorId',
        select: 'fullName email contactInfo vendorCompanyInfo',
      })
      .populate({
        path: 'accommodationDetails.vendorId',
        select: 'fullName email contactInfo vendorCompanyInfo',
      });
  
    if (!logistics) {
      throw new CustomError('Logistics not found', 404);
    }
    return logistics;
  }

  async updateLogistics(id: string, data: any) {
    // Handle top-level updates
    const topLevelUpdates = { ...data };
    delete topLevelUpdates.transportationDetails;
    delete topLevelUpdates.accommodationDetails;
    delete topLevelUpdates.additionalExpenses;
    delete topLevelUpdates.alignedAmount;

    // Process nested array updates
    if (data.transportationDetails) {
      await this.updateTransportationDetails(id, data.transportationDetails);
    }

    if (data.accommodationDetails) {
      await this.updateAccommodationDetails(id, data.accommodationDetails);
    }

    if (data.additionalExpenses) {
      await this.updateAdditionalExpenses(id, data.additionalExpenses);
    }

    // if (data.alignedAmount) {
    //   await this.updateAlignedAmount(id, data.alignedAmount);
    // }

    // Update top-level fields if any exist
    if (Object.keys(topLevelUpdates).length > 0) {
      await Logistics.findByIdAndUpdate(
        id,
        { $set: topLevelUpdates },
        { runValidators: true }
      );
    }

    // Recalculate totals if financial fields were updated
    // if (data.transportationDetails || data.accommodationDetails || data.additionalExpenses) {
    //   await this.calculateTotals(id);
    // }

    return await Logistics.findById(id)
    .populate({
      path: 'user',
      select: 'fullName email firstName lastName',
      strictPopulate: false,
    })
    .populate('createdBy traveler', 'fullName email firstName lastName')
    .populate('budgetId')
    .populate('flowId')
    .populate({
      path: 'transportationDetails.vendorId',
      select: 'fullName email contactInfo vendorCompanyInfo',
    })
    .populate({
      path: 'accommodationDetails.vendorId',
      select: 'fullName email contactInfo vendorCompanyInfo',
    });
  }

  async updateAlignedAmount(logisticsId: string, updateData: any) {
    const logistics = await Logistics.findById(logisticsId);
    if (!logistics) {
      throw new CustomError('Logistics not found', 404);
    }

    // Validate required fields for alignedAmount
    if (!updateData.amount || !updateData.personnel || !updateData.date) {
      throw new CustomError(
        'amount, personnel, and date are required for alignedAmount',
        400
      );
    }

    if (typeof updateData.amount !== 'number' || updateData.amount <= 0) {
      throw new CustomError('amount must be a positive number', 400);
    }

    // Prepare the new alignedAmount entry
    const alignedAmountEntry = {
      date: new Date(updateData.date),
      amount: updateData.amount,
      personnel: updateData.personnel,
      comment: updateData.comment || '',
    };

    // Update the logistics document: push new alignedAmount and increment budgetAmount
    const updatedLogistics = await Logistics.findByIdAndUpdate(
      logisticsId,
      {
        $push: { alignedAmount: alignedAmountEntry },
        $inc: { budgetAmount: updateData.amount }, // Increment budgetAmount
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy traveler', 'fullName email firstName lastName')
      .populate('budgetId')
      .populate('flowId');

    if (!updatedLogistics) {
      throw new CustomError('Failed to update alignedAmount', 500);
    }

    return updatedLogistics;
  }

  private async updateTransportationDetails(id: string, updates: any[]) {
    const bulkOps = updates.map(update => {
      if (update._id) {
        // Update existing item
        const setObj: any = {};
        for (const [key, value] of Object.entries(update)) {
          if (key !== '_id') {
            setObj[`transportationDetails.$[elem].${key}`] = value;
          }
        }

        // Track status changes
        if (update.status) {
          setObj.$push = {
            [`transportationDetails.$[elem].statusHistory`]: {
              status: update.status,
              date: new Date()
            }
          };
        }

        return {
          updateOne: {
            filter: { _id: id, 'transportationDetails._id': update._id },
            update: { $set: setObj },
            arrayFilters: [{ 'elem._id': update._id }]
          }
        };
      } else {
        // Add new item
        return {
          updateOne: {
            filter: { _id: id },
            update: {
              $push: {
                transportationDetails: {
                  ...update,
                  statusHistory: update.status ? [{
                    status: update.status,
                    date: new Date()
                  }] : []
                }
              }
            }
          }
        };
      }
    });

    if (bulkOps.length > 0) {
      await Logistics.bulkWrite(bulkOps);
    }
  }

  private async updateAccommodationDetails(id: string, updates: any[]) {
    const bulkOps = updates.map(update => {
      if (update._id) {
        const setObj: any = {};
        for (const [key, value] of Object.entries(update)) {
          if (key !== '_id') {
            setObj[`accommodationDetails.$[elem].${key}`] = value;
          }
        }

        if (update.status) {
          setObj.$push = {
            [`accommodationDetails.$[elem].statusHistory`]: {
              status: update.status,
              date: new Date()
            }
          };
        }

        return {
          updateOne: {
            filter: { _id: id, 'accommodationDetails._id': update._id },
            update: { $set: setObj },
            arrayFilters: [{ 'elem._id': update._id }]
          }
        };
      } else {
        return {
          updateOne: {
            filter: { _id: id },
            update: {
              $push: {
                accommodationDetails: {
                  ...update,
                  statusHistory: update.status ? [{
                    status: update.status,
                    date: new Date()
                  }] : []
                }
              }
            }
          }
        };
      }
    });

    if (bulkOps.length > 0) {
      await Logistics.bulkWrite(bulkOps);
    }
  }

  private async updateAdditionalExpenses(id: string, updates: any[]) {
    const bulkOps = updates.map(update => {
      if (update._id) {
        const setObj: any = {};
        for (const [key, value] of Object.entries(update)) {
          if (key !== '_id') {
            setObj[`additionalExpenses.$[elem].${key}`] = value;
          }
        }

        if (update.status) {
          setObj.$push = {
            [`additionalExpenses.$[elem].statusHistory`]: {
              status: update.status,
              date: new Date()
            }
          };
        }

        return {
          updateOne: {
            filter: { _id: id, 'additionalExpenses._id': update._id },
            update: { $set: setObj },
            arrayFilters: [{ 'elem._id': update._id }]
          }
        };
      } else {
        return {
          updateOne: {
            filter: { _id: id },
            update: {
              $push: {
                additionalExpenses: {
                  ...update,
                  statusHistory: update.status ? [{
                    status: update.status,
                    date: new Date()
                  }] : []
                }
              }
            }
          }
        };
      }
    });

    if (bulkOps.length > 0) {
      await Logistics.bulkWrite(bulkOps);
    }
  }

  private async calculateTotals(id: string) {
    const logistics = await Logistics.findById(id);
    if (!logistics) return;

    const transportationTotal = logistics.transportationDetails.reduce(
        (sum, item) => sum + (item.price || 0), 0
    );

    const accommodationTotal = logistics.accommodationDetails.reduce(
        (sum, item) => sum + (item.price || 0), 0
    );

    const expensesTotal = logistics.additionalExpenses.reduce(
        (sum, item) => sum + (item.amount || 0), 0
    );

    const grandTotal = transportationTotal + accommodationTotal + expensesTotal;

    await Logistics.findByIdAndUpdate(
        id,
        {
            $set: {
                transportationTotal,
                accommodationTotal,
                expensesTotal,
                grandTotal
            }
        }
    );
}

// async updateTransportationItem(logisticsId: string, itemId: string, updateData: any) {
//   return this.updateArrayItem(
//     logisticsId,
//     'transportationDetails',
//     itemId,
//     updateData,
//     ['scheduled', 'booked', 'boarded', 'in-transit', 'completed', 'delayed', 'cancelled']
//   );
// }

// async updateAccommodationItem(logisticsId: string, itemId: string, updateData: any) {
//   console.log('updateAccommodationItem called with:', logisticsId, itemId, updateData);
//   return this.updateArrayItem(
//     logisticsId,
//     'accommodationDetails',
//     itemId,
//     updateData,
//     ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']
//   );
// }

// async updateExpenseItem(logisticsId: string, itemId: string, updateData: any) {
//   return this.updateArrayItem(
//     logisticsId,
//     'additionalExpenses',
//     itemId,
//     updateData,
//     ['pending', 'paid', 'cancelled']
//   );
// }

async updateTransportationItem(logisticsId: string, itemId: string, updateData: any) {
  await this.updateArrayItem(
    logisticsId,
    'transportationDetails',
    itemId,
    updateData,
    ['scheduled', 'booked', 'boarded', 'in-transit', 'completed', 'delayed', 'cancelled']
  );

  // Return with populated vendor details
  return await Logistics.findById(logisticsId)
    .populate({
      path: 'transportationDetails.vendorId',
      select: 'fullName email contactInfo vendorCompanyInfo',
    })
    .populate({
      path: 'accommodationDetails.vendorId',
      select: 'fullName email contactInfo vendorCompanyInfo',
    });
}

async updateAccommodationItem(logisticsId: string, itemId: string, updateData: any) {
  await this.updateArrayItem(
    logisticsId,
    'accommodationDetails',
    itemId,
    updateData,
    ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']
  );

  // Return with populated vendor details
  return await Logistics.findById(logisticsId)
    .populate({
      path: 'transportationDetails.vendorId',
      select: 'fullName email contactInfo vendorCompanyInfo',
    })
    .populate({
      path: 'accommodationDetails.vendorId',
      select: 'fullName email contactInfo vendorCompanyInfo',
    });
}

async updateExpenseItem(logisticsId: string, itemId: string, updateData: any) {
  await this.updateArrayItem(
    logisticsId,
    'additionalExpenses',
    itemId,
    updateData,
    ['pending', 'paid', 'cancelled']
  );

  // Return with populated vendor details (though expenses don't have vendors)
  return await Logistics.findById(logisticsId)
    .populate({
      path: 'transportationDetails.vendorId',
      select: 'fullName email contactInfo vendorCompanyInfo',
    })
    .populate({
      path: 'accommodationDetails.vendorId',
      select: 'fullName email contactInfo vendorCompanyInfo',
    });
}

private async updateArrayItem(
  logisticsId: string,
  arrayField: string,
  itemId: string,
  updateData: any,
  validStatuses?: string[]
) {
  // Validate status if provided
  if (updateData[0].status && validStatuses && !validStatuses.includes(updateData[0].status)) {
    throw new CustomError(`Invalid status value. Allowed values: ${validStatuses.join(', ')}`, 400);
  }

  const update: any = {};
  const setObj: any = {};
  let hasUpdates = false;

  const logistics = await Logistics.findById(logisticsId).lean();
  if (!logistics) {
    throw new CustomError('Logistics not found', 404);
  }

  // Prepare update data for the array item
  for (const [key, value] of Object.entries(updateData[0])) {
    if (key !== '_id' && key !== 'id' && key !== 'status' && key !== 'statusHistory') {
      setObj[`${arrayField}.$[elem].${key}`] = value;
      hasUpdates = true;
    }
  }

  // Handle status update with history tracking
  const currentItem = (logistics[arrayField as keyof typeof logistics] as any[]).find(
    (item) => item._id.toString() === itemId
  );
  if (
    updateData[0].status &&
    updateData[0].status !== currentItem?.status
  ) {
    setObj[`${arrayField}.$[elem].status`] = updateData[0].status;
    update.$push = {
      [`${arrayField}.$[elem].statusHistory`]: {
        status: updateData[0].status,
        date: new Date(),
      },
    };
    hasUpdates = true;
  }

  if (!hasUpdates) {
    throw new CustomError('No valid fields provided for update', 400);
  }

  update.$set = setObj;

  // Handle budget deduction for specific statuses
  const budget = await budgetModel.findById(logistics.budgetId);
  if (!budget) {
    throw new CustomError('Budget not found', 404);
  }

  const isTransportation = arrayField === 'transportationDetails' && updateData[0].status === 'booked';
  const isAccommodation = arrayField === 'accommodationDetails' && updateData[0].status === 'confirmed';
  const isExpense = arrayField === 'additionalExpenses' && updateData[0].status === 'paid';

  if (isTransportation || isAccommodation || isExpense) {
    const budgetItemId = updateData[0].budgetItemId;
    const amountToDeduct = isExpense ? updateData[0].amount : updateData[0].price;

    if (!budgetItemId || !amountToDeduct) {
      throw new CustomError('budgetItemId and price/amount are required', 400);
    }

    // Find the budget category (Logistics)
    const logisticsCategory = budget.categories.find(
      (cat) => cat.title === 'Logistics'
    );
    if (!logisticsCategory) {
      throw new CustomError('Logistics category not found in budget', 404);
    }

    // Find the specific budget item
    const budgetItem = logisticsCategory.budgetItems.find(
      (item) => item._id?.toString() === budgetItemId
    );
    if (!budgetItem) {
      throw new CustomError('Budget item not found', 404);
    }

    // Check if sufficient funds are available
    if (budgetItem.amount < amountToDeduct) {
      throw new CustomError(
        `Insufficient funds in budget item ${budgetItem.itemName}. Available: ${budgetItem.amount}, Required: ${amountToDeduct}`,
        400
      );
    }

    // Deduct the amount from the budget item
    budgetItem.amount -= amountToDeduct;

    // Recalculate the category's total amount (sum of budgetItems amounts)
    logisticsCategory.amount = logisticsCategory.budgetItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // Save the updated budget
    await budget.save();
  }

  // Perform the logistics update
  const result = await Logistics.findOneAndUpdate(
    { _id: logisticsId, [`${arrayField}._id`]: itemId },
    update,
    {
      new: true,
      runValidators: true,
      arrayFilters: [{ 'elem._id': itemId }],
    }
  ).populate('createdBy traveler', 'fullName email firstName lastName');

  if (!result) {
    throw new CustomError(`${arrayField} item not found`, 404);
  }

  // Recalculate totals if financial fields were updated
  if (['transportationDetails', 'accommodationDetails', 'additionalExpenses'].includes(arrayField)) {
    await this.calculateTotals(logisticsId);
  }

  return result;
}

async deleteLogistics(id: string) {
    const logistics = await Logistics.findByIdAndDelete(id);
    if (!logistics) {
      throw new CustomError('Logistics not found', 404);
    }
    return { message: 'Logistics deleted successfully' };
  }

  async deleteTransportationItem(logisticsId: string, itemId: string) {
    const logistics = await Logistics.findById(logisticsId);
    if (!logistics) {
      throw new CustomError('Logistics not found', 404);
    }
  
    // Check if the transportation item exists
    const transportationItem = logistics.transportationDetails.find(
      (item) => item._id.toString() === itemId
    );
    if (!transportationItem) {
      throw new CustomError('Transportation item not found', 404);
    }
  
    // Remove the transportation item using $pull
    await Logistics.updateOne(
      { _id: logisticsId },
      { $pull: { transportationDetails: { _id: itemId } } }
    );
  
    // Recalculate totals
    await this.calculateTotals(logisticsId);
  
    return { message: 'Transportation item deleted successfully' };
  }

  async deleteAccommodationItem(logisticsId: string, itemId: string) {
    const logistics = await Logistics.findById(logisticsId);
    if (!logistics) {
      throw new CustomError('Logistics not found', 404);
    }
  
    // Check if the transportation item exists
    const accommodationItem = logistics.accommodationDetails.find(
      (item) => item._id.toString() === itemId
    );
    if (!accommodationItem) {
      throw new CustomError('Accommodation item not found', 404);
    }
  
    // Remove the transportation item using $pull
    await Logistics.updateOne(
      { _id: logisticsId },
      { $pull: { accommodationDetails: { _id: itemId } } }
    );
  
    // Recalculate totals
    await this.calculateTotals(logisticsId);
  
    return { message: 'Accommodation item deleted successfully' };
  }

  async deleteExpenseItem(logisticsId: string, itemId: string) {
    const logistics = await Logistics.findById(logisticsId);
    if (!logistics) {
      throw new CustomError('Logistics not found', 404);
    }
  
    // Check if the transportation item exists
    const expenseItem = logistics.additionalExpenses.find(
      (item) => item._id.toString() === itemId
    );
    if (!expenseItem) {
      throw new CustomError('Expense item not found', 404);
    }
  
    // Remove the transportation item using $pull
    await Logistics.updateOne(
      { _id: logisticsId },
      { $pull: { additionalExpenses: { _id: itemId } } }
    );
  
    // Recalculate totals
    await this.calculateTotals(logisticsId);
  
    return { message: 'Expense item deleted successfully' };
  }

}

export default new LogisticsService();