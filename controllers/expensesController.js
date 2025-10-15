const expensesService = require('../services/expensesService');

class ExpensesController {
  async getAll(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await expensesService.getAll(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await expensesService.getById(id, tenantId);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const result = await expensesService.create(req.body, userId, tenantId);
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
      const result = await expensesService.update(id, req.body, tenantId);
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
      const result = await expensesService.activate(id, tenantId);
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
      const result = await expensesService.deactivate(id, tenantId);
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
      const result = await expensesService.delete(id, tenantId);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ExpensesController();


