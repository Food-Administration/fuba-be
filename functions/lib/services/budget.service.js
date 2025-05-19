"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const budget_model_1 = __importDefault(require("../models/budget.model"));
const requestFlow_model_1 = __importDefault(require("../models/requestFlow.model"));
const customError_1 = __importDefault(require("../utils/customError"));
class BudgetService {
    constructor() {
        this.populateOptions = {
            basicUserFields: 'fullName firstName lastName email',
            flow: 'flowId'
        };
    }
    async findBudgetOrThrow(id, populate = true) {
        const query = budget_model_1.default.findById(id).select('+categories.budgetItems.budgetedItemAmount');
        if (populate) {
            query.populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields)
                .populate(this.populateOptions.flow);
        }
        const budget = await query;
        if (!budget) {
            throw new customError_1.default('Budget not found', 404);
        }
        return budget.toObject();
    }
    async updateCategoryAndReturn(budgetId, updateOperation, updatedBy, errorMessage = 'Budget not found') {
        const budget = await budget_model_1.default.findByIdAndUpdate(budgetId, {
            ...updateOperation,
            $set: { lastUpdatedBy: updatedBy }
        }, { new: true }).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'name email',
            strictPopulate: false
        });
        if (!budget) {
            throw new customError_1.default(errorMessage, 404);
        }
        return budget.toObject();
    }
    async createBudget(data) {
        const budgetFlow = await requestFlow_model_1.default.findOne({ workflowItem: "Budget" });
        if (!budgetFlow) {
            throw new customError_1.default('No RequestFlow found with workflowItem "Budget"', 404);
        }
        const normalizedCategories = data.categories.map((category) => {
            if (!category.amount && category.amount !== 0) {
                throw new customError_1.default(`Category "${category.title}" is missing amount`, 400);
            }
            const budgetItems = (category.budgetItems || []).map((item) => {
                if (!item.amount && item.amount !== 0) {
                    throw new customError_1.default(`Budget item "${item.itemName}" is missing amount`, 400);
                }
                if (!item.itemName) {
                    throw new customError_1.default(`Budget item is missing itemName`, 400);
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
        const budget = new budget_model_1.default(budgetData);
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
        const budgets = await budget_model_1.default.find()
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
    async getBudgetById(id) {
        return await this.findBudgetOrThrow(id);
    }
    async updateBudget(id, data) {
        const budget = await budget_model_1.default.findByIdAndUpdate(id, data, { new: true })
            .populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields)
            .populate(this.populateOptions.flow)
            .populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'fullName email firstName lastName',
            strictPopulate: false
        });
        if (!budget) {
            throw new customError_1.default('Budget not found', 404);
        }
        return budget.toObject();
    }
    async deleteBudget(id) {
        await this.findBudgetOrThrow(id, false);
        await budget_model_1.default.findByIdAndDelete(id);
        return { message: 'Budget deleted successfully' };
    }
    async addCategory(budgetId, categoryData, updatedBy) {
        const completeCategoryData = {
            ...categoryData,
            budgetedAmount: categoryData.amount,
            budgetItems: (categoryData.budgetItems || []).map((item) => ({
                ...item,
                budgetedItemAmount: item.amount
            }))
        };
        return await this.updateCategoryAndReturn(budgetId, { $push: { categories: completeCategoryData } }, updatedBy);
    }
    async removeCategory(budgetId, categoryId, updatedBy) {
        return await this.updateCategoryAndReturn(budgetId, { $pull: { categories: { _id: categoryId } } }, updatedBy);
    }
    async addBudgetItem(budgetId, categoryId, itemData, updatedBy) {
        if (!itemData.amount && itemData.amount !== 0) {
            throw new customError_1.default('Budget item amount is required', 400);
        }
        const completeItemData = {
            ...itemData,
            budgetedItemAmount: itemData.amount,
            itemName: itemData.itemName || 'Unnamed Item',
        };
        // const { budget } = await this.validateBudgetComponents(budgetId, categoryId);
        const updatedBudget = await budget_model_1.default.findOneAndUpdate({
            _id: budgetId,
            'categories._id': categoryId
        }, {
            $push: { 'categories.$.budgetItems': completeItemData },
            $set: { lastUpdatedBy: updatedBy }
        }, { new: true }).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'name email',
            strictPopulate: false
        });
        if (!updatedBudget) {
            throw new customError_1.default('Budget or category not found', 404);
        }
        return updatedBudget.toObject();
    }
    async updateBudgetItem(budgetId, categoryId, itemId, updateData, updatedBy) {
        if (!updateData.amount && updateData.amount !== 0) {
            throw new customError_1.default('Budget item amount is required', 400);
        }
        const { budgetItem } = await this.validateBudgetComponents(budgetId, categoryId, itemId);
        // Preserve budgetedItemAmount unless explicitly increased
        if (!budgetItem) {
            throw new customError_1.default('Budget item is undefined', 404);
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
        const updatedBudget = await budget_model_1.default.findOneAndUpdate({
            _id: budgetId,
            'categories._id': categoryId,
            'categories.budgetItems._id': itemId
        }, {
            $set: {
                'categories.$[category].budgetItems.$[item]': completeUpdateData,
                lastUpdatedBy: updatedBy
            }
        }, {
            new: true,
            arrayFilters: [
                { 'category._id': categoryId },
                { 'item._id': itemId }
            ]
        }).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'fullName email firstName lastName',
            strictPopulate: false
        });
        if (!updatedBudget) {
            throw new customError_1.default('Budget, category or item not found', 404);
        }
        return updatedBudget.toObject();
    }
    async removeBudgetItem(budgetId, categoryId, itemId, updatedBy) {
        // const { budget } = await this.validateBudgetComponents(budgetId, categoryId);
        const updatedBudget = await budget_model_1.default.findOneAndUpdate({
            _id: budgetId,
            'categories._id': categoryId
        }, {
            $pull: { 'categories.$.budgetItems': { _id: itemId } },
            $set: { lastUpdatedBy: updatedBy }
        }, { new: true }).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'fullName email firstName lastName',
            strictPopulate: false
        });
        if (!updatedBudget) {
            throw new customError_1.default('Budget or category not found', 404);
        }
        return updatedBudget.toObject();
    }
    async validateBudgetComponents(budgetId, categoryId, itemId) {
        const budget = await budget_model_1.default.findOne({
            _id: budgetId,
            'categories._id': categoryId,
        });
        if (!budget) {
            throw new customError_1.default('Budget or category not found', 404);
        }
        const category = budget.categories.find((cat) => cat._id.toString() === categoryId);
        if (!category) {
            throw new customError_1.default('Category not found', 404);
        }
        if (itemId) {
            const budgetItem = category.budgetItems.find((item) => item._id.toString() === itemId);
            if (!budgetItem) {
                throw new customError_1.default('Budget item not found in category', 404);
            }
            return { budget, category, budgetItem };
        }
        return { budget, category };
    }
    async addAlignedAmount(budgetId, categoryId, alignedData, updatedBy) {
        if (!alignedData.amount || !alignedData.budgetItemId || !alignedData.comment) {
            throw new customError_1.default('Amount, budgetItemId, and comment are required', 400);
        }
        // const { budget } = await this.validateBudgetComponents(budgetId, categoryId, alignedData.budgetItemId.toString());
        const updatedBudget = await budget_model_1.default.findOneAndUpdate({
            _id: budgetId,
            'categories._id': categoryId,
        }, {
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
        }, { new: true }).populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields);
        if (!updatedBudget) {
            throw new customError_1.default('Failed to add aligned amount', 500);
        }
        return updatedBudget.toObject();
    }
    async updateAlignedAmountStatus(budgetId, categoryId, alignedId, status, userId, rejectionReason) {
        const { category } = await this.validateBudgetComponents(budgetId, categoryId);
        const alignedAmount = category.alignedAmounts.find((a) => a._id.toString() === alignedId);
        if (!alignedAmount) {
            throw new customError_1.default('Aligned amount not found', 404);
        }
        const updateData = {
            'categories.$[category].alignedAmounts.$[aligned].status': status,
        };
        if (status === 'rejected' && rejectionReason) {
            updateData['categories.$[category].alignedAmounts.$[aligned].comment'] = rejectionReason;
        }
        const arrayFilters = [
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
        const updatedBudget = await budget_model_1.default.findOneAndUpdate({
            _id: budgetId,
            'categories._id': categoryId,
            'categories.alignedAmounts._id': alignedId,
        }, updateData, {
            new: true,
            arrayFilters,
        }).populate('createdBy lastUpdatedBy', this.populateOptions.basicUserFields);
        if (!updatedBudget) {
            throw new customError_1.default('Budget update failed', 404);
        }
        return updatedBudget.toObject();
    }
    async removeAlignedAmount(budgetId, categoryId, alignedId, updatedBy) {
        // const { budget } = await this.validateBudgetComponents(budgetId, categoryId);
        const updatedBudget = await budget_model_1.default.findOneAndUpdate({
            _id: budgetId,
            'categories._id': categoryId
        }, {
            $pull: { 'categories.$.alignedAmounts': { _id: alignedId } },
            $set: { lastUpdatedBy: updatedBy }
        }, { new: true }).populate({
            path: 'createdBy lastUpdatedBy approvedById',
            select: 'name email',
            strictPopulate: false
        });
        if (!updatedBudget) {
            throw new customError_1.default('Budget or category not found', 404);
        }
        return updatedBudget.toObject();
    }
}
exports.default = new BudgetService();
//# sourceMappingURL=budget.service.js.map