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
      console.log('getintllalsa', loanId, tenantId);
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
      const { tenantId, userId } = req.user;
      
      // Extract user inputs
      const { loanId, amount, cashInHand, cashInOnline } = req.body;
      
      // Build clean request data
      const installmentData = {
        loanId,
        amount,
        cashInHand: cashInHand || 0,  // Default to 0 if not provided
        cashInOnline: cashInOnline || 0,  // Default to 0 if not provided
        tenantId,  // From token
        collectedBy: userId  // From token
        // status is auto-calculated, not from user
        // dueAt is system date, not from user
        // remainAmount is auto-calculated, not from user
        // nextDue is auto-calculated, not from user
      };

      const result = await installmentService.createInstallment(installmentData);

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
      
      // Extract user inputs (only allow updating payment details)
      const { amount, cashInHand, cashInOnline } = req.body;
      
      // Build clean update data
      const updateData = {
        amount,
        cashInHand: cashInHand !== undefined ? cashInHand : undefined,
        cashInOnline: cashInOnline !== undefined ? cashInOnline : undefined
        // status is auto-calculated, not from user
        // tenantId cannot be changed
        // loanId cannot be changed
        // collectedBy cannot be changed
        // dueAt cannot be changed
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );
      
      const result = await installmentService.updateInstallment(id, updateData, tenantId);

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
      const { cashInHand, cashInOnline } = req.body;
      
      const result = await installmentService.markAsPaid(id, cashInHand, cashInOnline, userId, tenantId);

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

  // Mark installment as partially paid
  async markAsPartiallyPaid(req, res) {
    try {
      const { id } = req.params;
      const { userId, tenantId } = req.user;
      const { cashInHand, cashInOnline } = req.body;
      
      const result = await installmentService.markAsPartiallyPaid(id, cashInHand, cashInOnline, userId, tenantId);

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

  // Mark installment as missed (creates new installment row with MISSED status)
  async markAsMissed(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const { loanId } = req.body;
      
      // Build installment data for MISSED payment
      const installmentData = {
        loanId,
        tenantId,  // From token
        collectedBy: userId  // From token
        // amount will be fetched from loan's installmentAmount in service
        // cashInHand = 0 (no payment)
        // cashInOnline = 0 (no payment)
        // remainAmount will equal amount
        // status = 'MISSED'
        // dueAt is system date
        // nextDue is auto-calculated
      };
      
      const result = await installmentService.markAsMissed(installmentData);

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

  // Get last 7 period totals by lineTypeId
  async getLast7TotalsByLineType(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const { lineTypeId } = req.query;
      const result = await installmentService.getLast7TotalsByLineType(lineTypeId, userId, tenantId);
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
}

module.exports = new InstallmentController();

