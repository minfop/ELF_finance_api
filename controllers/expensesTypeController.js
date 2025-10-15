const expensesTypeService = require('../services/expensesTypeService');

class ExpensesTypeController {
  async getAll(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await expensesTypeService.getAll(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await expensesTypeService.getById(id, tenantId);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByTenant(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await expensesTypeService.getByTenant(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByUserAndTenant(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const result = await expensesTypeService.getByUserAndTenant(tenantId, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByUserTenantAndLine(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const { lineTypeId } = req.params;
      const result = await expensesTypeService.getByUserTenantAndLine(tenantId, userId, lineTypeId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { tenantId } = req.user;
      req.body.tenantId = tenantId;
      const result = await expensesTypeService.create(req.body);
      if (!result.success) return res.status(400).json(result);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      delete req.body.tenantId;
      const result = await expensesTypeService.update(id, req.body, tenantId);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async activate(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await expensesTypeService.activate(id, tenantId);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deactivate(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await expensesTypeService.deactivate(id, tenantId);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await expensesTypeService.delete(id, tenantId);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ExpensesTypeController();


