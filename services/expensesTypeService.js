const ExpensesTypeModel = require('../models/expensesTypeModel');

class ExpensesTypeService {
  async getAll(tenantId = null) {
    const data = tenantId ? await ExpensesTypeModel.findByTenantId(tenantId) : await ExpensesTypeModel.findAll();
    return { success: true, data };
  }

  async getById(id, tenantId = null) {
    const item = await ExpensesTypeModel.findById(id);
    if (!item) return { success: false, message: 'Expenses type not found' };
    if (tenantId && item.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    return { success: true, data: item };
  }

  async getByTenant(tenantId) {
    const data = await ExpensesTypeModel.findByTenantId(tenantId);
    return { success: true, data };
  }

  async getByUserAndTenant(tenantId, userId) {
    if (!tenantId || !userId) return { success: false, message: 'tenantId and userId are required' };
    const data = await ExpensesTypeModel.findByTenantAndUserAccess(tenantId, userId);
    return { success: true, data };
  }

  async getByUserTenantAndLine(tenantId, userId, lineTypeId) {
    if (!tenantId || !userId || !lineTypeId) return { success: false, message: 'tenantId, userId and lineTypeId are required' };
    const data = await ExpensesTypeModel.findByTenantUserAndLine(tenantId, userId, lineTypeId);
    return { success: true, data };
  }

  async create(data) {
    if (!data.tenantId) return { success: false, message: 'Tenant ID is required' };
    if (!data.name) return { success: false, message: 'Name is required' };
    // Enforce accessUsersId must be non-empty and include creator? Using same rule as line types: null/empty denies all
    if (!data.accessUsersId || String(data.accessUsersId).trim().length === 0) {
      return { success: false, message: 'accessUsersId is required and cannot be empty' };
    }
    const id = await ExpensesTypeModel.create(data);
    const created = await ExpensesTypeModel.findById(id);
    return { success: true, message: 'Expenses type created successfully', data: created };
  }

  async update(id, data, tenantId = null) {
    const existing = await ExpensesTypeModel.findById(id);
    if (!existing) return { success: false, message: 'Expenses type not found' };
    if (tenantId && existing.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    // Preserve tenant
    data.tenantId = existing.tenantId;
    // accessUsersId cannot be empty
    if (data.accessUsersId !== undefined && String(data.accessUsersId).trim().length === 0) {
      return { success: false, message: 'accessUsersId cannot be empty' };
    }
    await ExpensesTypeModel.update(id, data);
    const updated = await ExpensesTypeModel.findById(id);
    return { success: true, message: 'Expenses type updated successfully', data: updated };
  }

  async activate(id, tenantId = null) {
    const existing = await ExpensesTypeModel.findById(id);
    if (!existing) return { success: false, message: 'Expenses type not found' };
    if (tenantId && existing.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    await ExpensesTypeModel.activate(id);
    return { success: true, message: 'Expenses type activated' };
  }

  async deactivate(id, tenantId = null) {
    const existing = await ExpensesTypeModel.findById(id);
    if (!existing) return { success: false, message: 'Expenses type not found' };
    if (tenantId && existing.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    await ExpensesTypeModel.deactivate(id);
    return { success: true, message: 'Expenses type deactivated' };
  }

  async delete(id, tenantId = null) {
    const existing = await ExpensesTypeModel.findById(id);
    if (!existing) return { success: false, message: 'Expenses type not found' };
    if (tenantId && existing.tenantId !== tenantId) return { success: false, message: 'Access denied: Different tenant' };
    await ExpensesTypeModel.delete(id);
    return { success: true, message: 'Expenses type deleted' };
  }
}

module.exports = new ExpensesTypeService();


