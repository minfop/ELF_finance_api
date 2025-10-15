const loanService = require('../services/loanService');

class LoanController {
  // Get all loans
  async getAllLoans(req, res) {
    try {
      const { tenantId, roleName } = req.user;
      const result = await loanService.getAllLoans(tenantId, roleName);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get active loans
  async getActiveLoans(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await loanService.getActiveLoans(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get loan by ID
  async getLoanById(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await loanService.getLoanById(id, tenantId);

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

  // Get loans by customer
  async getLoansByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const { tenantId } = req.user;
      const result = await loanService.getLoansByCustomer(customerId, tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get loans by status
  async getLoansByStatus(req, res) {
    try {
      const { status } = req.params;
      const { tenantId } = req.user;
      const result = await loanService.getLoansByStatus(status, tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get loans by line type (with access control)
  async getLoansByLineType(req, res) {
    try {
      const { lineTypeId } = req.params;
      const { userId, tenantId } = req.user;
      const result = await loanService.getLoansByLineType(lineTypeId, userId, tenantId);
      
      if (!result.success) {
        return res.status(403).json(result);
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get loan statistics
  async getLoanStats(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await loanService.getLoanStats(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get analytics data by date range
  async getDateRangeAnalytics(req, res) {
    try {
      const { fromDate, toDate } = req.query;
      const { userId, tenantId } = req.user;
      
      const result = await loanService.getDateRangeAnalytics(fromDate, toDate, userId, tenantId);
      
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

  // Create loan
  async createLoan(req, res) {
    try {
      const { tenantId, userId } = req.user;
      
      // Always use tenantId from token, ignore from body
      req.body.tenantId = tenantId;

      const result = await loanService.createLoan(req.body, userId);

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

  // Update loan
  async updateLoan(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      
      // Remove tenantId and customerId from body to prevent changes
      delete req.body.tenantId;
      delete req.body.customerId;
      
      const result = await loanService.updateLoan(id, req.body, tenantId);

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

  // Update loan status
  async updateLoanStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { tenantId } = req.user;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const result = await loanService.updateLoanStatus(id, status, tenantId);

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

  // Deactivate loan
  async deactivateLoan(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await loanService.deactivateLoan(id, tenantId);

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

  // Delete loan
  async deleteLoan(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await loanService.deleteLoan(id, tenantId);

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

module.exports = new LoanController();

