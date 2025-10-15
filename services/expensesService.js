const ExpensesModel = require('../models/expensesModel');
const ExpensesTypeModel = require('../models/expensesTypeModel');
const LineTypeModel = require('../models/lineTypeModel');

class ExpensesService {
  async getAll(tenantId = null) {
    const data = tenantId ? await ExpensesModel.findByTenantId(tenantId) : await ExpensesModel.findAll();
    return { success: true, data };
  }

  async getById(id, tenantId = null) {
    const item = await ExpensesModel.findById(id);
    if (!item) return { success: false, message: 'Expense not found' };
    if (tenantId && item.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    return { success: true, data: item };
  }

  async create(data, userIdFromToken, tenantIdFromToken) {
    // Map token-sourced fields
    data.userId = userIdFromToken;
    data.tenantId = tenantIdFromToken;

    if (!data.expenseId) return { success: false, message: 'expenseId is required' };
    if (!data.lineTypeId) return { success: false, message: 'lineTypeId is required' };
    if (data.amount === undefined || data.amount === null) return { success: false, message: 'amount is required' };

    // Validate line type tenant
    const lineType = await LineTypeModel.findById(data.lineTypeId);
    if (!lineType) return { success: false, message: 'Line type not found' };
    if (lineType.tenantId !== tenantIdFromToken) return { success: false, message: 'Line type belongs to a different tenant' };

    // Validate expenses type, access, and limit
    const expType = await ExpensesTypeModel.findById(data.expenseId);
    if (!expType) return { success: false, message: 'Expenses type not found' };
    if (expType.tenantId !== tenantIdFromToken) return { success: false, message: 'Expenses type belongs to a different tenant' };
    // Access must be defined and must include user
    if (!expType.accessUsersId || String(expType.accessUsersId).trim().length === 0) {
      return { success: false, message: 'Access denied: Expenses type has no access assignments' };
    }
    const accessIds = String(expType.accessUsersId).split(',').map(x => parseInt(x.trim())).filter(n => !Number.isNaN(n));
    if (accessIds.length === 0 || !accessIds.includes(userIdFromToken)) {
      return { success: false, message: "Access denied: You don't have permission to use this expenses type" };
    }

    // Amount must be <= maxLimit when maxLimit present
    const amount = parseFloat(data.amount);
    const maxLimit = expType.maxLimit !== null && expType.maxLimit !== undefined ? parseFloat(expType.maxLimit) : null;
    if (Number.isNaN(amount)) return { success: false, message: 'amount must be a number' };
    if (maxLimit !== null && amount > maxLimit) {
      return { success: false, message: 'Amount exceeds maxLimit for this expenses type' };
    }

    const id = await ExpensesModel.create(data);
    const created = await ExpensesModel.findById(id);
    return { success: true, message: 'Expense created successfully', data: created };
  }

  async update(id, data, tenantId = null) {
    const existing = await ExpensesModel.findById(id);
    if (!existing) return { success: false, message: 'Expense not found' };
    if (tenantId && existing.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };

    // If changing expenseId, re-validate access and limit against amount
    if (data.expenseId || data.amount !== undefined) {
      const newExpenseTypeId = data.expenseId || existing.expenseId;
      const expType = await ExpensesTypeModel.findById(newExpenseTypeId);
      if (!expType) return { success: false, message: 'Expenses type not found' };
      if (expType.tenantId !== existing.tenantId) return { success: false, message: 'Expenses type belongs to a different tenant' };
      if (!expType.accessUsersId || String(expType.accessUsersId).trim().length === 0) {
        return { success: false, message: 'Access denied: Expenses type has no access assignments' };
      }
      const amount = parseFloat(data.amount !== undefined ? data.amount : existing.amount);
      const maxLimit = expType.maxLimit !== null && expType.maxLimit !== undefined ? parseFloat(expType.maxLimit) : null;
      if (Number.isNaN(amount)) return { success: false, message: 'amount must be a number' };
      if (maxLimit !== null && amount > maxLimit) {
        return { success: false, message: 'Amount exceeds maxLimit for this expenses type' };
      }
    }

    // Preserve tenant and user
    data.tenantId = existing.tenantId;
    data.userId = existing.userId;
    await ExpensesModel.update(id, data);
    const updated = await ExpensesModel.findById(id);
    return { success: true, message: 'Expense updated successfully', data: updated };
  }

  async activate(id, tenantId = null) {
    const existing = await ExpensesModel.findById(id);
    if (!existing) return { success: false, message: 'Expense not found' };
    if (tenantId && existing.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    await ExpensesModel.activate(id);
    return { success: true, message: 'Expense activated' };
  }

  async deactivate(id, tenantId = null) {
    const existing = await ExpensesModel.findById(id);
    if (!existing) return { success: false, message: 'Expense not found' };
    if (tenantId && existing.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    await ExpensesModel.deactivate(id);
    return { success: true, message: 'Expense deactivated' };
  }

  async delete(id, tenantId = null) {
    const existing = await ExpensesModel.findById(id);
    if (!existing) return { success: false, message: 'Expense not found' };
    if (tenantId && existing.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    await ExpensesModel.delete(id);
    return { success: true, message: 'Expense deleted' };
  }
}

module.exports = new ExpensesService();


