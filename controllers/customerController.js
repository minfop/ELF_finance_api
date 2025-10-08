const customerService = require('../services/customerService');

class CustomerController {
  // Get all customers
  async getAllCustomers(req, res) {
    try {
      const { tenantId, roleName } = req.user;
      const result = await customerService.getAllCustomers(tenantId, roleName);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get customer by ID
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      const result = await customerService.getCustomerById(id, tenantId, roleName);

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

  // Get customers by tenant
  async getCustomersByTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const result = await customerService.getCustomersByTenant(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create customer
  async createCustomer(req, res) {
    try {
      const { tenantId } = req.user;
      
      // Always use tenantId from token, ignore from body
      req.body.tenantId = tenantId;

      const result = await customerService.createCustomer(req.body);

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

  // Update customer
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      
      // Remove tenantId from body to prevent changing customer's tenant
      delete req.body.tenantId;
      
      const result = await customerService.updateCustomer(id, req.body, tenantId, roleName);

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

  // Deactivate customer
  async deactivateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      const result = await customerService.deactivateCustomer(id, tenantId, roleName);

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

  // Delete customer
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      const result = await customerService.deleteCustomer(id, tenantId, roleName);

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

module.exports = new CustomerController();

