import Budget from '../models/budget.model';
import RequestFlow from '../models/requestFlow.model';
import CustomError from '../utils/customError';
import { Types } from 'mongoose';

class BudgetService {
    private readonly populateOptions = {
        basicUserFields: 'fullName firstName lastName email',
        flow: 'flowId'
    };

    private async findBudgetOrThrow(id: string, populate: boolean = true) {
        const query = Budget.findById(id).select('+categories.budgetItems.budgetedItemAmount');
        
        if (populate) {
            query.populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields)
                 .populate(this.populateOptions.flow);
        }
        
        const budget = await query;
        
        if (!budget) {
            throw new CustomError('Budget not found', 404);
        }
        
        return budget.toObject();
    }

    private async updateCategoryAndReturn(
        budgetId: string, 
        updateOperation: any, 
        updatedBy: Types.ObjectId,
        errorMessage: string = 'Budget not found'
    ) {
        const budget = await Budget.findByIdAndUpdate(
            budgetId,
            {
                ...updateOperation,
                $set: { lastUpdatedBy: updatedBy }
            },
            { new: true }
        ).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'name email',
            strictPopulate: false
        });
        
        if (!budget) {
            throw new CustomError(errorMessage, 404);
        }
        
        return budget.toObject();
    }

    async createBudget(data: any) {
        const budgetFlow = await RequestFlow.findOne({ workflowItem: "Budget" });
        if (!budgetFlow) {
            throw new CustomError('No RequestFlow found with workflowItem "Budget"', 404);
        }
    
        const normalizedCategories = data.categories.map((category: any) => {
            if (!category.amount && category.amount !== 0) {
                throw new CustomError(`Category "${category.title}" is missing amount`, 400);
            }
            const budgetItems = (category.budgetItems || []).map((item: any) => {
                if (!item.amount && item.amount !== 0) {
                    throw new CustomError(`Budget item "${item.itemName}" is missing amount`, 400);
                }
                if (!item.itemName) {
                    throw new CustomError(`Budget item is missing itemName`, 400);
                }
                return {
                    ...item,
                    budgetedItemAmount: item.amount,
                    itemName: item.itemName || 'Unnamed Item',
                };
            });
    
            return {
                ...category,
                budgetedAmount: category.amount || 0,
                budgetItems,
                alignedAmounts: category.alignedAmounts || [],
            };
        });
    
        const budgetData = {
            ...data,
            flowId: budgetFlow._id,
            categories: normalizedCategories,
        };
    
        const budget = new Budget(budgetData);
        const savedBudget = await budget.save();
        return savedBudget.toObject();
    }

    // async getBudgets() {
    //     return await Budget.find()
    //         .select('+categories.budgetItems.budgetedItemAmount')
    //         .populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields)
    //         .populate(this.populateOptions.flow)
    //         .lean()
    //         .then(budgets => budgets.map(budget => new Budget(budget).toObject()));
    // }

    async getBudgets() {
        const budgets = await Budget.find()
            .select('+categories.budgetItems.budgetedItemAmount')
            .populate({
                path: 'createdBy lastUpdatedBy',
                select: 'fullName firstName lastName email'
            })
            .populate('flowId')
            .lean();
    
        return budgets.map(budget => ({
            ...budget,
            totalValue: budget.categories.reduce((sum, category) => sum + (category.budgetedAmount || 0), 0)
        }));
    }

    async getBudgetById(id: string) {
        return await this.findBudgetOrThrow(id);
    }

    async updateBudget(id: string, data: any) {
        const budget = await Budget.findByIdAndUpdate(id, data, { new: true })
            .populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields)
            .populate(this.populateOptions.flow)
            .populate({
                path: 'createdBy lastUpdatedBy approvedById',
                select: 'fullName email firstName lastName',
                strictPopulate: false
            });
        
        if (!budget) {
            throw new CustomError('Budget not found', 404);
        }
        
        return budget.toObject();
    }

    async deleteBudget(id: string) {
        await this.findBudgetOrThrow(id, false);
        await Budget.findByIdAndDelete(id);
        return { message: 'Budget deleted successfully' };
    }

    async addCategory(budgetId: string, categoryData: any, updatedBy: Types.ObjectId) {
        const completeCategoryData = {
            ...categoryData,
            budgetedAmount: categoryData.amount,
            budgetItems: (categoryData.budgetItems || []).map((item: any) => ({
                ...item,
                budgetedItemAmount: item.amount
            }))
        };
        
        return await this.updateCategoryAndReturn(
            budgetId,
            { $push: { categories: completeCategoryData } },
            updatedBy
        );
    }

    async removeCategory(budgetId: string, categoryId: string, updatedBy: Types.ObjectId) {
        return await this.updateCategoryAndReturn(
            budgetId,
            { $pull: { categories: { _id: categoryId } } },
            updatedBy
        );
    }

    async addBudgetItem(budgetId: string, categoryId: string, itemData: any, updatedBy: Types.ObjectId) {
        if (!itemData.amount && itemData.amount !== 0) {
            throw new CustomError('Budget item amount is required', 400);
        }
        const completeItemData = {
            ...itemData,
            budgetedItemAmount: itemData.amount,
            itemName: itemData.itemName || 'Unnamed Item',
        };
        // const { budget } = await this.validateBudgetComponents(budgetId, categoryId);
        const updatedBudget = await Budget.findOneAndUpdate(
            {
                _id: budgetId,
                'categories._id': categoryId
            },
            {
                $push: { 'categories.$.budgetItems': completeItemData },
                $set: { lastUpdatedBy: updatedBy }
            },
            { new: true }
        ).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'name email',
            strictPopulate: false
        });
        
        if (!updatedBudget) {
            throw new CustomError('Budget or category not found', 404);
        }
        
        return updatedBudget.toObject();
    }

    async updateBudgetItem(budgetId: string, categoryId: string, itemId: string, updateData: any, updatedBy: Types.ObjectId) {
        if (!updateData.amount && updateData.amount !== 0) {
            throw new CustomError('Budget item amount is required', 400);
        }

        const {  budgetItem } = await this.validateBudgetComponents(budgetId, categoryId, itemId);

        // Preserve budgetedItemAmount unless explicitly increased
        if (!budgetItem) {
            throw new CustomError('Budget item is undefined', 404);
        }
        let budgetedItemAmount = budgetItem.budgetedItemAmount;
        if (updateData.budgetedItemAmount !== undefined && updateData.budgetedItemAmount > budgetedItemAmount) {
            budgetedItemAmount = updateData.budgetedItemAmount;
        }

        const completeUpdateData = {
            ...updateData,
            budgetedItemAmount,
            itemName: updateData.itemName || budgetItem.itemName,
        };

        const updatedBudget = await Budget.findOneAndUpdate(
            {
                _id: budgetId,
                'categories._id': categoryId,
                'categories.budgetItems._id': itemId
            },
            {
                $set: {
                    'categories.$[category].budgetItems.$[item]': completeUpdateData,
                    lastUpdatedBy: updatedBy
                }
            },
            {
                new: true,
                arrayFilters: [
                    { 'category._id': categoryId },
                    { 'item._id': itemId }
                ]
            }
        ).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'fullName email firstName lastName',
            strictPopulate: false
        });
        
        if (!updatedBudget) {
            throw new CustomError('Budget, category or item not found', 404);
        }
        
        return updatedBudget.toObject();
    }

    async removeBudgetItem(budgetId: string, categoryId: string, itemId: string, updatedBy: Types.ObjectId) {
        // const { budget } = await this.validateBudgetComponents(budgetId, categoryId);
        const updatedBudget = await Budget.findOneAndUpdate(
            {
                _id: budgetId,
                'categories._id': categoryId
            },
            {
                $pull: { 'categories.$.budgetItems': { _id: itemId } },
                $set: { lastUpdatedBy: updatedBy }
            },
            { new: true }
        ).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'fullName email firstName lastName',
            strictPopulate: false
        });
        
        if (!updatedBudget) {
            throw new CustomError('Budget or category not found', 404);
        }
        
        return updatedBudget.toObject();
    }

    private async validateBudgetComponents(budgetId: string, categoryId: string, itemId?: string) {
        const budget = await Budget.findOne({
            _id: budgetId,
            'categories._id': categoryId,
        });
        
        if (!budget) {
            throw new CustomError('Budget or category not found', 404);
        }
        
        const category = budget.categories.find((cat: any) => cat._id.toString() === categoryId);
        if (!category) {
            throw new CustomError('Category not found', 404);
        }
        
        if (itemId) {
            const budgetItem = category.budgetItems.find((item: any) => item._id.toString() === itemId);
            if (!budgetItem) {
                throw new CustomError('Budget item not found in category', 404);
            }
            return { budget, category, budgetItem };
        }
        
        return { budget, category };
    }

    async addAlignedAmount(budgetId: string, categoryId: string, alignedData: any, updatedBy: Types.ObjectId) {
        if (!alignedData.amount || !alignedData.budgetItemId || !alignedData.comment) {
            throw new CustomError('Amount, budgetItemId, and comment are required', 400);
        }
        
        // const { budget } = await this.validateBudgetComponents(budgetId, categoryId, alignedData.budgetItemId.toString());
        
        const updatedBudget = await Budget.findOneAndUpdate(
            {
                _id: budgetId,
                'categories._id': categoryId,
            },
            {
                $push: {
                    'categories.$.alignedAmounts': {
                        amount: alignedData.amount,
                        budgetItemId: alignedData.budgetItemId,
                        comment: alignedData.comment,
                        personnel: alignedData.personnel,
                        date: new Date(),
                        status: 'pending',
                        approvals: [],
                    },
                },
                $set: { lastUpdatedBy: updatedBy },
            },
            { new: true }
        ).populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields);
        
        if (!updatedBudget) {
            throw new CustomError('Failed to add aligned amount', 500);
        }
        
        return updatedBudget.toObject();
    }

    async updateAlignedAmountStatus(
        budgetId: string,
        categoryId: string,
        alignedId: string,
        status: 'approved' | 'rejected',
        userId: Types.ObjectId,
        rejectionReason?: string
    ) {
        const { category } = await this.validateBudgetComponents(budgetId, categoryId);

        const alignedAmount = category.alignedAmounts.find((a: any) => a._id.toString() === alignedId);
        if (!alignedAmount) {
            throw new CustomError('Aligned amount not found', 404);
        }

        const updateData: any = {
            'categories.$[category].alignedAmounts.$[aligned].status': status,
        };

        if (status === 'rejected' && rejectionReason) {
            updateData['categories.$[category].alignedAmounts.$[aligned].comment'] = rejectionReason;
        }

        const arrayFilters: any[] = [
            { 'category._id': categoryId },
            { 'aligned._id': alignedId },
        ];

        if (status === 'approved') {
            updateData['categories.$[category].alignedAmounts.$[aligned].approvals'] = [
                ...alignedAmount.approvals,
                { userId, fullName: 'Approver Name', date: new Date() }, // Replace 'Approver Name' with actual user data
            ];
            updateData.$inc = {
                'categories.$[category].budgetedAmount': alignedAmount.amount,
                'categories.$[category].budgetItems.$[item].budgetedItemAmount': alignedAmount.amount,
                'categories.$[category].budgetItems.$[item].amount': alignedAmount.amount,
            };
            arrayFilters.push({ 'item._id': alignedAmount.budgetItemId });
        }

        const updatedBudget = await Budget.findOneAndUpdate(
            {
                _id: budgetId,
                'categories._id': categoryId,
                'categories.alignedAmounts._id': alignedId,
            },
            updateData,
            {
                new: true,
                arrayFilters,
            }
        ).populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields);

        if (!updatedBudget) {
            throw new CustomError('Budget update failed', 404);
        }

        return updatedBudget.toObject();
    }

    async removeAlignedAmount(budgetId: string, categoryId: string, alignedId: string, updatedBy: Types.ObjectId) {
        // const { budget } = await this.validateBudgetComponents(budgetId, categoryId);
        const updatedBudget = await Budget.findOneAndUpdate(
            {
                _id: budgetId,
                'categories._id': categoryId
            },
            {
                $pull: { 'categories.$.alignedAmounts': { _id: alignedId } },
                $set: { lastUpdatedBy: updatedBy }
            },
            { new: true }
        ).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'name email',
            strictPopulate: false
        });
        
        if (!updatedBudget) {
            throw new CustomError('Budget or category not found', 404);
        }
        
        return updatedBudget.toObject();
    }
}

export default new BudgetService();