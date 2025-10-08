const installmentService = require('../services/installmentService');

class InstallmentController {
  // Get all installments
  async getAllInstallments(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await installmentService.getAllInstallments(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get installment by ID
  async getInstallmentById(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await installmentService.getInstallmentById(id, tenantId);

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

  // Get installments by loan
  async getInstallmentsByLoan(req, res) {
    try {
      const { loanId } = req.params;
      const { tenantId } = req.user;
      const result = await installmentService.getInstallmentsByLoan(loanId, tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get installments by customer
  async getInstallmentsByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const { tenantId } = req.user;
      const result = await installmentService.getInstallmentsByCustomer(customerId, tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get installments by status
  async getInstallmentsByStatus(req, res) {
    try {
      const { status } = req.params;
      const { tenantId } = req.user;
      const result = await installmentService.getInstallmentsByStatus(status, tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get pending installments
  async getPendingInstallments(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await installmentService.getPendingInstallments(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get today's installments
  async getTodayInstallments(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await installmentService.getTodayInstallments(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get installment statistics
  async getInstallmentStats(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await installmentService.getInstallmentStats(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create installment
  async createInstallment(req, res) {
    try {
      const { tenantId } = req.user;
      
      // Always use tenantId from token, ignore from body
      req.body.tenantId = tenantId;

      const result = await installmentService.createInstallment(req.body);

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

  // Update installment
  async updateInstallment(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      
      // Remove tenantId and loanId from body to prevent changes
      delete req.body.tenantId;
      delete req.body.loanId;
      
      const result = await installmentService.updateInstallment(id, req.body, tenantId);

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

  // Mark installment as paid
  async markAsPaid(req, res) {
    try {
      const { id } = req.params;
      const { userId, tenantId } = req.user;
      const result = await installmentService.markAsPaid(id, userId, tenantId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark installment as missed
  async markAsMissed(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await installmentService.markAsMissed(id, tenantId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete installment
  async deleteInstallment(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await installmentService.deleteInstallment(id, tenantId);

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

module.exports = new InstallmentController();

