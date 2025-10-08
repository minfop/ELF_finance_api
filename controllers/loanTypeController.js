const loanTypeService = require('../services/loanTypeService');

class LoanTypeController {
  // Get all loan types
  async getAllLoanTypes(req, res) {
    try {
      const { tenantId, roleName } = req.user;
      const result = await loanTypeService.getAllLoanTypes(tenantId, roleName);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get active loan types
  async getActiveLoanTypes(req, res) {
    try {
      const { tenantId, roleName } = req.user;
      const result = await loanTypeService.getActiveLoanTypes(tenantId, roleName);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get loan type by ID
  async getLoanTypeById(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      const result = await loanTypeService.getLoanTypeById(id, tenantId, roleName);

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

  // Get loan types by tenant
  async getLoanTypesByTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const result = await loanTypeService.getLoanTypesByTenant(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create loan type
  async createLoanType(req, res) {
    try {
      const { tenantId } = req.user;
      
      // Always use tenantId from token, ignore from body
      req.body.tenantId = tenantId;

      const result = await loanTypeService.createLoanType(req.body);

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

  // Update loan type
  async updateLoanType(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      
      // Remove tenantId from body to prevent changing loan type's tenant
      delete req.body.tenantId;
      
      const result = await loanTypeService.updateLoanType(id, req.body, tenantId, roleName);

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

  // Deactivate loan type
  async deactivateLoanType(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      const result = await loanTypeService.deactivateLoanType(id, tenantId, roleName);

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

  // Delete loan type
  async deleteLoanType(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      const result = await loanTypeService.deleteLoanType(id, tenantId, roleName);

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

module.exports = new LoanTypeController();

