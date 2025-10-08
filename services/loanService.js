const LoanModel = require('../models/loanModel');

class LoanService {
  // Get all loans (with tenant filtering)
  async getAllLoans(userTenantId = null, userRole = null) {
    try {
      let loans;
      
      // Filter by tenant for non-monster roles
      if (userTenantId) {
        loans = await LoanModel.findByTenantId(userTenantId);
      } else {
        loans = await LoanModel.findAll();
      }

      return {
        success: true,
        data: loans
      };
    } catch (error) {
      throw new Error(`Error fetching loans: ${error.message}`);
    }
  }

  // Get active loans only
  async getActiveLoans(userTenantId = null) {
    try {
      const allActiveLoans = await LoanModel.findActive();
      
      // Filter by tenant if specified
      let loans;
      if (userTenantId) {
        loans = allActiveLoans.filter(loan => loan.tenantId === userTenantId);
      } else {
        loans = allActiveLoans;
      }

      return {
        success: true,
        data: loans
      };
    } catch (error) {
      throw new Error(`Error fetching active loans: ${error.message}`);
    }
  }

  // Get loan by ID
  async getLoanById(id, userTenantId = null) {
    try {
      const loan = await LoanModel.findById(id);
      
      if (!loan) {
        return {
          success: false,
          message: 'Loan not found'
        };
      }

      // Check tenant access
      if (userTenantId && loan.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan belongs to different tenant'
        };
      }

      return {
        success: true,
        data: loan
      };
    } catch (error) {
      throw new Error(`Error fetching loan: ${error.message}`);
    }
  }

  // Get loans by customer
  async getLoansByCustomer(customerId, userTenantId = null) {
    try {
      const loans = await LoanModel.findByCustomerId(customerId);
      
      // Filter by tenant if specified
      let filteredLoans;
      if (userTenantId) {
        filteredLoans = loans.filter(loan => loan.tenantId === userTenantId);
      } else {
        filteredLoans = loans;
      }

      return {
        success: true,
        data: filteredLoans
      };
    } catch (error) {
      throw new Error(`Error fetching loans by customer: ${error.message}`);
    }
  }

  // Get loans by status
  async getLoansByStatus(status, userTenantId = null) {
    try {
      const loans = await LoanModel.findByStatus(status, userTenantId);
      
      return {
        success: true,
        data: loans
      };
    } catch (error) {
      throw new Error(`Error fetching loans by status: ${error.message}`);
    }
  }

  // Get loan statistics
  async getLoanStats(userTenantId) {
    try {
      if (!userTenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      const stats = await LoanModel.getStatsByTenant(userTenantId);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new Error(`Error fetching loan statistics: ${error.message}`);
    }
  }

  // Create loan
  async createLoan(loanData) {
    try {
      // Validate required fields
      if (!loanData.tenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      if (!loanData.customerId) {
        return {
          success: false,
          message: 'Customer ID is required'
        };
      }

      if (!loanData.principal) {
        return {
          success: false,
          message: 'Principal amount is required'
        };
      }

      if (!loanData.interest) {
        return {
          success: false,
          message: 'Interest amount is required'
        };
      }

      if (!loanData.disbursedAmount) {
        return {
          success: false,
          message: 'Disbursed amount is required'
        };
      }

      if (!loanData.loanTypeId) {
        return {
          success: false,
          message: 'Loan type ID is required'
        };
      }

      if (!loanData.totalDays) {
        return {
          success: false,
          message: 'Total days is required'
        };
      }

      if (!loanData.startDate) {
        return {
          success: false,
          message: 'Start date is required'
        };
      }

      if (!loanData.endDate) {
        return {
          success: false,
          message: 'End date is required'
        };
      }

      if (!loanData.installmentAmount) {
        return {
          success: false,
          message: 'Installment amount is required'
        };
      }

      const loanId = await LoanModel.create(loanData);
      const newLoan = await LoanModel.findById(loanId);

      return {
        success: true,
        message: 'Loan created successfully',
        data: newLoan
      };
    } catch (error) {
      throw new Error(`Error creating loan: ${error.message}`);
    }
  }

  // Update loan
  async updateLoan(id, loanData, userTenantId = null) {
    try {
      const existingLoan = await LoanModel.findById(id);
      
      if (!existingLoan) {
        return {
          success: false,
          message: 'Loan not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingLoan.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan belongs to different tenant'
        };
      }

      // Preserve the original tenantId and customerId (prevent changes)
      loanData.tenantId = existingLoan.tenantId;
      loanData.customerId = existingLoan.customerId;

      const affectedRows = await LoanModel.update(id, loanData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedLoan = await LoanModel.findById(id);

      return {
        success: true,
        message: 'Loan updated successfully',
        data: updatedLoan
      };
    } catch (error) {
      throw new Error(`Error updating loan: ${error.message}`);
    }
  }

  // Update loan status
  async updateLoanStatus(id, status, userTenantId = null) {
    try {
      const existingLoan = await LoanModel.findById(id);
      
      if (!existingLoan) {
        return {
          success: false,
          message: 'Loan not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingLoan.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan belongs to different tenant'
        };
      }

      // Validate status
      const validStatuses = ['ONGOING', 'COMPLETED', 'PENDING', 'NIL'];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: 'Invalid status. Must be one of: ONGOING, COMPLETED, PENDING, NIL'
        };
      }

      await LoanModel.updateStatus(id, status);
      const updatedLoan = await LoanModel.findById(id);

      return {
        success: true,
        message: 'Loan status updated successfully',
        data: updatedLoan
      };
    } catch (error) {
      throw new Error(`Error updating loan status: ${error.message}`);
    }
  }

  // Deactivate loan
  async deactivateLoan(id, userTenantId = null) {
    try {
      const existingLoan = await LoanModel.findById(id);
      
      if (!existingLoan) {
        return {
          success: false,
          message: 'Loan not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingLoan.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan belongs to different tenant'
        };
      }

      await LoanModel.softDelete(id);

      return {
        success: true,
        message: 'Loan deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating loan: ${error.message}`);
    }
  }

  // Delete loan
  async deleteLoan(id, userTenantId = null) {
    try {
      const existingLoan = await LoanModel.findById(id);
      
      if (!existingLoan) {
        return {
          success: false,
          message: 'Loan not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingLoan.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan belongs to different tenant'
        };
      }

      await LoanModel.delete(id);

      return {
        success: true,
        message: 'Loan deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting loan: ${error.message}`);
    }
  }
}

module.exports = new LoanService();

