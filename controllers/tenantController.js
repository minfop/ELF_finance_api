const tenantService = require('../services/tenantService');

class TenantController {
  // Get all tenants
  async getAllTenants(req, res) {
    try {
      const result = await tenantService.getAllTenants();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get active tenants
  async getActiveTenants(req, res) {
    try {
      const result = await tenantService.getActiveTenants();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get tenant by ID
  async getTenantById(req, res) {
    try {
      const { id } = req.params;
      const result = await tenantService.getTenantById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new tenant
  async createTenant(req, res) {
    try {
      const result = await tenantService.createTenant(req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update tenant
  async updateTenant(req, res) {
    try {
      const { id } = req.params;
      const result = await tenantService.updateTenant(id, req.body);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Deactivate tenant (soft delete)
  async deactivateTenant(req, res) {
    try {
      const { id } = req.params;
      const result = await tenantService.deactivateTenant(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete tenant (hard delete)
  async deleteTenant(req, res) {
    try {
      const { id } = req.params;
      const result = await tenantService.deleteTenant(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TenantController();
