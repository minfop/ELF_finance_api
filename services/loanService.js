const LoanModel = require('../models/loanModel');
const LoanTypeModel = require('../models/loanTypeModel');
const LineTypeModel = require('../models/lineTypeModel');
const InstallmentModel = require('../models/installmentModel');
const CustomerModel = require('../models/customerModel');

class LoanService {
  /**
   * Calculate end date based on loan type
   * @param {number} loanTypeId - The loan type ID
   * @param {number} tenantId - The tenant ID
   * @param {string|Date} startDate - The start date
   * @returns {Promise<string>} - The calculated end date as ISO string
   */
  async calculateEndDate(loanTypeId, tenantId, startDate) {
    try {
      // Fetch loan type information
      const loanType = await LoanTypeModel.findById(loanTypeId);
      
      if (!loanType) {
        throw new Error('Loan type not found');
      }
      
      // Verify tenant ID matches
      if (loanType.tenantId !== tenantId) {
        throw new Error('Loan type does not belong to this tenant');
      }
      
      // Parse start date
      const start = new Date(startDate);
      
      if (isNaN(start.getTime())) {
        throw new Error('Invalid start date');
      }
      
      // Calculate end date based on collection type
      let endDate;
      const collectionType = loanType.collectionType.toUpperCase();
      const collectionPeriod = parseInt(loanType.collectionPeriod);
      
      if (collectionType === 'DAILY') {
        // Add days
        endDate = new Date(start.getTime() + collectionPeriod * 24 * 60 * 60 * 1000);
      } else if (collectionType === 'WEEKLY') {
        // Add weeks (7 days per week)
        endDate = new Date(start.getTime() + collectionPeriod * 7 * 24 * 60 * 60 * 1000);
      } else if (collectionType === 'MONTHLY') {
        // Add months
        endDate = new Date(start);
        endDate.setMonth(endDate.getMonth() + collectionPeriod);
      } else {
        throw new Error(`Unsupported collection type: ${collectionType}`);
      }
      
      // Return as ISO date string
      return endDate.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      throw new Error(`Error calculating end date: ${error.message}`);
    }
  }

  /**
   * Calculate total installment based on loan type
   * @param {number} loanTypeId - The loan type ID
   * @param {number} tenantId - The tenant ID
   * @returns {Promise<int>} - The calculated total installment
   */
  async calculateTotalInstallement(loanTypeId, tenantId) {
    try {
      // Fetch loan type information
      const loanType = await LoanTypeModel.findById(loanTypeId);
      
      if (!loanType) {
        throw new Error('Loan type not found');
      }
      
      // Verify tenant ID matches
      if (loanType.tenantId !== tenantId) {
        throw new Error('Loan type does not belong to this tenant');
      }
      
      // Parse start date
      const start = new Date(startDate);
      
      if (isNaN(start.getTime())) {
        throw new Error('Invalid start date');
      }

      const collectionPeriod = parseInt(loanType.collectionPeriod);

      return collectionPeriod; 
    } catch (error) {
      throw new Error(`Error calculating total installment: ${error.message}`);
    }
  }

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

  // Get loans by line type (with access control based on lineType.accessUsersId)
  async getLoansByLineType(lineTypeId, userId, userTenantId) {
    try {
      if (!lineTypeId) {
        return {
          success: false,
          message: 'Line Type ID is required'
        };
      }

      if (!userId || !userTenantId) {
        return {
          success: false,
          message: 'User ID and Tenant ID are required'
        };
      }

      // Fetch line type to check access
      const lineType = await LineTypeModel.findById(lineTypeId);
      
      if (!lineType) {
        return {
          success: false,
          message: 'Line type not found'
        };
      }

      // Check tenant access
      if (lineType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Line type belongs to different tenant'
        };
      }

      // Check user access based on accessUsersId
      // accessUsersId is stored as comma-separated string like "1,2,3"
      if (lineType.accessUsersId) {
        const accessUserIds = lineType.accessUsersId.split(',').map(id => parseInt(id.trim()));
        
        if (!accessUserIds.includes(userId)) {
          return {
            success: false,
            message: 'Access denied: You do not have permission to access loans for this line type'
          };
        }
      } else {
        // If accessUsersId is null or empty, deny access (or allow all based on your business logic)
        return {
          success: false,
          message: 'Access denied: No users are authorized for this line type'
        };
      }

      // Fetch loans by lineTypeId
      const loans = await LoanModel.findByLineTypeId(lineTypeId, userTenantId);
      
      // If loans exist, fetch installments for last 5 days (including today)
      if (loans && loans.length > 0) {
        const loanIds = loans.map(loan => loan.id);
        const installments = await InstallmentModel.findByLoanIdsAndDateRange(loanIds, 5);
        
        // Group installments by loanId
        const installmentsByLoanId = {};
        installments.forEach(installment => {
          if (!installmentsByLoanId[installment.loanId]) {
            installmentsByLoanId[installment.loanId] = [];
          }
          installmentsByLoanId[installment.loanId].push(installment);
        });
        
        // Attach installments to each loan
        loans.forEach(loan => {
          loan.installments = installmentsByLoanId[loan.id] || [];
        });
      }
      
      return {
        success: true,
        data: loans
      };
    } catch (error) {
      throw new Error(`Error fetching loans by line type: ${error.message}`);
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

  // Get analytics data by date range
  async getDateRangeAnalytics(fromDate, toDate, userId, userTenantId) {
    try {
      // Validate required fields
      if (!fromDate || !toDate) {
        return {
          success: false,
          message: 'fromDate and toDate are required'
        };
      }

      if (!userId || !userTenantId) {
        return {
          success: false,
          message: 'User ID and Tenant ID are required'
        };
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
        return {
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        };
      }

      // Validate fromDate is not after toDate
      if (new Date(fromDate) > new Date(toDate)) {
        return {
          success: false,
          message: 'fromDate cannot be after toDate'
        };
      }

      // Fetch all analytics data in parallel
      const [loanAnalytics, customerAnalytics, installmentAnalytics, expensesList, expensesTotal] = await Promise.all([
        LoanModel.getAnalyticsByDateRange(fromDate, toDate, userTenantId),
        CustomerModel.getNewCustomersCountByDateRange(fromDate, toDate, userTenantId),
        InstallmentModel.getTotalCollectedByDateRange(fromDate, toDate, userTenantId),
        require('../models/expensesModel').getListByDateRange(fromDate, toDate, userTenantId),
        require('../models/expensesModel').getTotalByDateRange(fromDate, toDate, userTenantId)
      ]);

      // Combine all analytics data
      const analytics = {
        dateRange: {
          fromDate,
          toDate
        },
        loans: {
          newLoanCount: loanAnalytics.newLoanCount || 0,
          totalDisbursedAmount: parseFloat(loanAnalytics.totalDisbursedAmount) || 0,
          totalInitialDeduction: parseFloat(loanAnalytics.totalInitialDeduction) || 0,
          totalInterest: parseFloat(loanAnalytics.totalInterest) || 0,
          totalInvestmentAmount: parseFloat(loanAnalytics.totalInvestmentAmount) || 0,
          totalBalanceAmountInLine: parseFloat(loanAnalytics.totalBalanceAmountInLine) || 0
        },
        customers: {
          newCustomerCount: customerAnalytics.newCustomerCount || 0
        },
        installments: {
          totalCashInHand: parseFloat(installmentAnalytics.totalCashInHand) || 0,
          totalCashInOnline: parseFloat(installmentAnalytics.totalCashInOnline) || 0,
          totalCollected: parseFloat(installmentAnalytics.totalCollected) || 0
        },
        expenses: {
          list: (expensesList || []).map(e => ({
            id: e.id,
            expenseId: e.expenseId,
            expenseName: e.expenseName,
            amount: parseFloat(e.amount) || 0,
            userId: e.userId,
            lineTypeId: e.lineTypeId,
            createdAt: e.createdAt
          })),
          totalExpensesAmount: parseFloat(expensesTotal?.totalExpensesAmount) || 0
        }
      };

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      throw new Error(`Error fetching date range analytics: ${error.message}`);
    }
  }

  // Create loan
  async createLoan(loanData, userId = null) {
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

      if (!loanData.lineTypeId) {
        return {
          success: false,
          message: 'Line type ID is required'
        };
      }

      if (!loanData.startDate) {
        return {
          success: false,
          message: 'Start date is required'
        };
      }
      
      // Fetch line type to get loanTypeId and validate tenant
      const lineType = await LineTypeModel.findById(loanData.lineTypeId);
      
      if (!lineType) {
        return {
          success: false,
          message: 'Line type not found'
        };
      }
      
      // Verify tenant ID matches
      if (lineType.tenantId !== loanData.tenantId) {
        return {
          success: false,
          message: 'Line type does not belong to this tenant'
        };
      }
      
      // Enforce access via lineType.accessUsersId: if null/empty -> deny; otherwise require membership
      if (!userId) {
        return {
          success: false,
          message: "Access denied: Invalid user context"
        };
      }
      const accessUsersRaw = lineType.accessUsersId;
      if (!accessUsersRaw || String(accessUsersRaw).trim().length === 0) {
        return {
          success: false,
          message: "Access denied: Line type has no access assignments"
        };
      }
      const accessUserIds = String(accessUsersRaw)
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(n => !Number.isNaN(n));
      if (accessUserIds.length === 0 || !accessUserIds.includes(userId)) {
        return {
          success: false,
          message: "Access denied: You don't have permission to use this line type"
        };
      }
      
      // Get loanTypeId from lineType
      loanData.loanTypeId = lineType.loanTypeId;
      
      // Calculate end date based on loan type
      const calculatedEndDate = await this.calculateEndDate(
        loanData.loanTypeId,
        loanData.tenantId,
        loanData.startDate
      );
      loanData.endDate = calculatedEndDate;
      
      // Fetch loan type to get initialDeduction percentage
      const loanType = await LoanTypeModel.findById(loanData.loanTypeId);
      const initialDeductionPercent = parseInt(loanType.initialDeduction);
      const interestPercent = parseInt(loanType.interest);
      const collectionPeriod = parseInt(loanType.collectionPeriod);
      const isInterestPreDetection = loanType.isInterestPreDetection;
      const interestAmount = Math.round((parseFloat(loanData.principal) * interestPercent) / 100);
      
      // Calculate initialDeduction amount based on percentage
      loanData.initialDeduction = Math.round((parseFloat(loanData.principal) * initialDeductionPercent) / 100);
      loanData.totalInstallment = collectionPeriod;
      loanData.interest = interestAmount;
      
      // Calculate disbursedAmount based on isInterestPreDetection flag
      if (isInterestPreDetection) {
        // If true: 
        // principal - interest - initialDeduction = disbursedAmount
        loanData.disbursedAmount = parseFloat(loanData.principal) - parseFloat(interestAmount) - parseFloat(loanData.initialDeduction);
        // (principal) / installmentAmount
        loanData.installmentAmount = parseFloat(loanData.principal / collectionPeriod).toFixed(2); // Simple equal installment calculation
        // totalAmount = principal (interest already deducted)
        loanData.totalAmount = parseFloat(loanData.principal);
      } else {
        // If false: 
        // principal - initialDeduction = disbursedAmount
        loanData.disbursedAmount = parseFloat(loanData.principal) - parseFloat(loanData.initialDeduction);
        // (principal + interest) / installmentAmount
        loanData.installmentAmount = parseFloat((parseFloat(loanData.principal) + parseFloat(loanData.interest)) / collectionPeriod).toFixed(2); // Simple equal installment calculation
        // totalAmount = principal + interest
        loanData.totalAmount = parseFloat(loanData.principal) + parseFloat(interestAmount);
      }
      
      // balanceAmount initially equals totalAmount (no payments made yet)
      loanData.balanceAmount = loanData.totalAmount;
      
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
      
      // Fetch line type to get loanTypeId
      if (loanData.lineTypeId) {
        const lineType = await LineTypeModel.findById(loanData.lineTypeId);
        
        if (!lineType) {
          return {
            success: false,
            message: 'Line type not found'
          };
        }
        
        // Verify tenant ID matches
        if (lineType.tenantId !== loanData.tenantId) {
          return {
            success: false,
            message: 'Line type does not belong to this tenant'
          };
        }
        
        // Get loanTypeId from lineType
        loanData.loanTypeId = lineType.loanTypeId;
      }
      
      // Calculate end date based on loan type if relevant fields are provided
      if (loanData.loanTypeId && loanData.startDate) {
        const calculatedEndDate = await this.calculateEndDate(
          loanData.loanTypeId,
          loanData.tenantId,
          loanData.startDate
        );
        loanData.endDate = calculatedEndDate;
      }
      
      // Fetch loan type to get initialDeduction percentage
      if (loanData.loanTypeId) {
        const loanType = await LoanTypeModel.findById(loanData.loanTypeId);
        
        if (!loanType) {
          return {
            success: false,
            message: 'Loan type not found'
          };
        }
        
        const initialDeductionPercent = parseInt(loanType.initialDeduction);
        const interestPercent = parseInt(loanType.interest);
        const collectionPeriod = parseInt(loanType.collectionPeriod);
        const isInterestPreDetection = loanType.isInterestPreDetection;
        const interestAmount = Math.round((parseFloat(loanData.principal) * interestPercent) / 100);
      
        // Calculate initialDeduction amount based on percentage
        loanData.initialDeduction = Math.round((parseFloat(loanData.principal) * initialDeductionPercent) / 100);
        loanData.interest = interestAmount;
        loanData.totalInstallment = collectionPeriod;
        
        // Calculate disbursedAmount based on isInterestPreDetection flag
       if (isInterestPreDetection) {
         // If true: 
         // principal - interest - initialDeduction = disbursedAmount
         loanData.disbursedAmount = parseFloat(loanData.principal) - parseFloat(interestAmount) - parseFloat(loanData.initialDeduction);
         // (principal) / installmentAmount
         loanData.installmentAmount = parseFloat(loanData.principal / collectionPeriod).toFixed(2); // Simple equal installment calculation
         // totalAmount = principal (interest already deducted)
         loanData.totalAmount = parseFloat(loanData.principal);
       } else {
         // If false: 
         // principal - initialDeduction = disbursedAmount
         loanData.disbursedAmount = parseFloat(loanData.principal) - parseFloat(loanData.initialDeduction);
         // (principal + interest) / installmentAmount
         loanData.installmentAmount = parseFloat((parseFloat(loanData.principal) + parseFloat(loanData.interest)) / collectionPeriod).toFixed(2); // Simple equal installment calculation
         // totalAmount = principal + interest
         loanData.totalAmount = parseFloat(loanData.principal) + parseFloat(interestAmount);
       }
       
       // Get existing balance or set to totalAmount
       const existingLoan = await LoanModel.findById(id);
       if (existingLoan) {
         // Keep existing balanceAmount during update unless recalculating
         loanData.balanceAmount = existingLoan.balanceAmount;
       } else {
         loanData.balanceAmount = loanData.totalAmount;
       }
      }
      
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

