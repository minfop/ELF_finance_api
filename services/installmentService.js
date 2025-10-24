const InstallmentModel = require('../models/installmentModel');
const LoanModel = require('../models/loanModel');
const LoanTypeModel = require('../models/loanTypeModel');

class InstallmentService {
  // Get all installments (with tenant filtering)
  async getAllInstallments(userTenantId = null) {
    try {
      let installments;
      
      if (userTenantId) {
        installments = await InstallmentModel.findByTenantId(userTenantId);
      } else {
        installments = await InstallmentModel.findAll();
      }

      return {
        success: true,
        data: installments
      };
    } catch (error) {
      throw new Error(`Error fetching installments: ${error.message}`);
    }
  }

  // Get installment by ID
  async getInstallmentById(id, userTenantId = null) {
    try {
      const installment = await InstallmentModel.findById(id);
      
      if (!installment) {
        return {
          success: false,
          message: 'Installment not found'
        };
      }

      // Check tenant access
      if (userTenantId && installment.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Installment belongs to different tenant'
        };
      }

      return {
        success: true,
        data: installment
      };
    } catch (error) {
      throw new Error(`Error fetching installment: ${error.message}`);
    }
  }

  // Get installments by loan
  async getInstallmentsByLoan(loanId, userTenantId = null) {
    try {
      const installments = await InstallmentModel.findByLoanId(loanId);
      console.log('installments', installments);
      // Filter by tenant if specified
      let filteredInstallments;
      if (userTenantId) {
        filteredInstallments = installments.filter(i => i.tenantId === userTenantId);
      } else {
        filteredInstallments = installments;
      }

      return {
        success: true,
        data: filteredInstallments
      };
    } catch (error) {
      throw new Error(`Error fetching installments by loan: ${error.message}`);
    }
  }

  // Get installments by customer
  async getInstallmentsByCustomer(customerId, userTenantId = null) {
    try {
      const installments = await InstallmentModel.findByCustomerId(customerId, userTenantId);

      return {
        success: true,
        data: installments
      };
    } catch (error) {
      throw new Error(`Error fetching installments by customer: ${error.message}`);
    }
  }

  // Get installments by status
  async getInstallmentsByStatus(status, userTenantId = null) {
    try {
      const installments = await InstallmentModel.findByStatus(status, userTenantId);

      return {
        success: true,
        data: installments
      };
    } catch (error) {
      throw new Error(`Error fetching installments by status: ${error.message}`);
    }
  }

  // Get pending installments
  async getPendingInstallments(userTenantId = null) {
    try {
      const installments = await InstallmentModel.findPending(userTenantId);

      return {
        success: true,
        data: installments
      };
    } catch (error) {
      throw new Error(`Error fetching pending installments: ${error.message}`);
    }
  }

  // Get today's installments
  async getTodayInstallments(userTenantId = null) {
    try {
      const installments = await InstallmentModel.findToday(userTenantId);

      return {
        success: true,
        data: installments
      };
    } catch (error) {
      throw new Error(`Error fetching today's installments: ${error.message}`);
    }
  }

  // Get installment statistics
  async getInstallmentStats(userTenantId) {
    try {
      if (!userTenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      const stats = await InstallmentModel.getStatsByTenant(userTenantId);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new Error(`Error fetching installment statistics: ${error.message}`);
    }
  }

  // Create installment
  async createInstallment(installmentData) {
    try {
      // Validate required fields (from user input)
      if (!installmentData.loanId) {
        return {
          success: false,
          message: 'Loan ID is required'
        };
      }

      if (!installmentData.amount) {
        return {
          success: false,
          message: 'Amount is required'
        };
      }

      if (installmentData.amount != (installmentData.cashInHand + installmentData.cashInOnline || 0)) {
        return {
          success: false,
          message: 'Amount is be equal to sum of cashInHand and cashInOnline'
        };
      }

      // cashInHand and cashInOnline are optional, default to 0
      const cashInHand = parseFloat(installmentData.cashInHand || 0);
      const cashInOnline = parseFloat(installmentData.cashInOnline || 0);
      const amount = parseFloat(installmentData.amount);

      // Calculate remainAmount: amount - (cashInHand + cashInOnline)
      const totalPaid = cashInHand + cashInOnline;
      const remainAmount = amount - totalPaid;

      // Set dueAt to current date (system date)
      const today = new Date();
      const dueAt = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Get loan details to calculate nextDue
      const loan = await LoanModel.findById(installmentData.loanId);
      if (!loan) {
        return {
          success: false,
          message: 'Loan not found'
        };
      }

      // Verify tenant access
      if (installmentData.tenantId && loan.tenantId !== installmentData.tenantId) {
        return {
          success: false,
          message: 'Loan does not belong to this tenant'
        };
      }

      // Get loan type to determine collection period
      const loanType = await LoanTypeModel.findById(loan.loanTypeId);
      if (!loanType) {
        return {
          success: false,
          message: 'Loan type not found'
        };
      }

      // Calculate nextDue based on collection type
      const nextDueDate = new Date(today);
      const collectionType = loanType.collectionType.toUpperCase();
      const collectionPeriod = parseInt(loanType.collectionPeriod);

      if (collectionType === 'DAILY') {
        nextDueDate.setDate(nextDueDate.getDate() + collectionPeriod);
      } else if (collectionType === 'WEEKLY') {
        nextDueDate.setDate(nextDueDate.getDate() + (collectionPeriod * 7));
      } else if (collectionType === 'MONTHLY') {
        nextDueDate.setMonth(nextDueDate.getMonth() + collectionPeriod);
      }

      const nextDue = nextDueDate.toISOString().slice(0, 19).replace('T', ' '); // MySQL TIMESTAMP format

      // Determine status based on payment
      let status;
      if (amount >= loan.installmentAmount) {
        status = 'PAID';
      } else if (amount > 0) {
        status = 'PARTIALLY';
      } else {
        status = 'MISSED';
      }

      // Check if installment already exists for this loan and date
      const existingInstallments = await InstallmentModel.findByLoanId(installmentData.loanId);
      const existingInstallment = existingInstallments.find(inst => inst.dueAt === dueAt);

      // Calculate total amount paid across all installments for this loan
      let totalInstallmentsPaid = 0;
      
      if (existingInstallment) {
        // If updating existing installment, exclude its previous payment from total
        totalInstallmentsPaid = existingInstallments
          .filter(inst => inst.id !== existingInstallment.id)
          .reduce((sum, inst) => {
            const paid = parseFloat(inst.cashInHand || 0) + parseFloat(inst.cashInOnline || 0);
            return sum + paid;
          }, 0);
        // Add current payment
        totalInstallmentsPaid += totalPaid;
      } else {
        // For new installment, sum all existing payments + current payment
        totalInstallmentsPaid = existingInstallments.reduce((sum, inst) => {
          const paid = parseFloat(inst.cashInHand || 0) + parseFloat(inst.cashInOnline || 0);
          return sum + paid;
        }, 0);
        totalInstallmentsPaid += totalPaid;
      }

      // Update loan's balanceAmount: totalAmount - total of all installments paid
      const newBalanceAmount = parseFloat(loan.totalAmount) - totalInstallmentsPaid;
      await LoanModel.update(loan.id, {
        ...loan,
        balanceAmount: newBalanceAmount > 0 ? newBalanceAmount : 0
      });

      // Build complete installment data
      const completeInstallmentData = {
        loanId: installmentData.loanId,
        tenantId: installmentData.tenantId,
        dueAt: dueAt,
        amount: amount,
        remainAmount: newBalanceAmount > 0 ? newBalanceAmount : 0,
        cashInHand: cashInHand,
        cashInOnline: cashInOnline,
        status: status,
        collectedBy: installmentData.collectedBy,
        nextDue: nextDue
      };

      let installmentId;
      let message;
      
      if (existingInstallment) {
        // Update existing installment
        await InstallmentModel.update(existingInstallment.id, completeInstallmentData);
        installmentId = existingInstallment.id;
        message = 'Installment updated successfully';
      } else {
        // Create new installment
        installmentId = await InstallmentModel.create(completeInstallmentData);
        message = 'Installment created successfully';
      }

      const resultInstallment = await InstallmentModel.findById(installmentId);

      return {
        success: true,
        message: message,
        data: resultInstallment
      };
    } catch (error) {
      throw new Error(`Error creating installment: ${error.message}`);
    }
  }

  // Update installment
  async updateInstallment(id, installmentData, userTenantId = null) {
    try {
      const existingInstallment = await InstallmentModel.findById(id);
      
      if (!existingInstallment) {
        return {
          success: false,
          message: 'Installment not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingInstallment.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Installment belongs to different tenant'
        };
      }

      // Preserve the original tenantId and loanId (prevent changes)
      installmentData.tenantId = existingInstallment.tenantId;
      installmentData.loanId = existingInstallment.loanId;

      const affectedRows = await InstallmentModel.update(id, installmentData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedInstallment = await InstallmentModel.findById(id);

      return {
        success: true,
        message: 'Installment updated successfully',
        data: updatedInstallment
      };
    } catch (error) {
      throw new Error(`Error updating installment: ${error.message}`);
    }
  }

  // Mark installment as paid
  async markAsPaid(id, cashInHand, cashInOnline, userId, userTenantId = null) {
    try {
      const existingInstallment = await InstallmentModel.findById(id);
      
      if (!existingInstallment) {
        return {
          success: false,
          message: 'Installment not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingInstallment.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Installment belongs to different tenant'
        };
      }

      if (existingInstallment.status === 'PAID') {
        return {
          success: false,
          message: 'Installment is already marked as paid'
        };
      }

      // Update loan balance - recalculate from totalAmount
      const loan = await LoanModel.findById(existingInstallment.loanId);
      if (loan) {
        // Get all installments for this loan
        const allInstallments = await InstallmentModel.findByLoanId(loan.id);
        
        // Calculate total paid across all installments (excluding current one, will add new payment)
        const totalInstallmentsPaid = allInstallments
          .filter(inst => inst.id !== id)
          .reduce((sum, inst) => {
            const paid = parseFloat(inst.cashInHand || 0) + parseFloat(inst.cashInOnline || 0);
            return sum + paid;
          }, 0);
        
        // Add current payment
        const currentPayment = parseFloat(cashInHand) + parseFloat(cashInOnline);
        const newBalanceAmount = parseFloat(loan.totalAmount) - (totalInstallmentsPaid + currentPayment);
        
        await LoanModel.update(loan.id, {
          ...loan,
          balanceAmount: newBalanceAmount > 0 ? newBalanceAmount : 0
        });
      }

      await InstallmentModel.markAsPaid(id, cashInHand, cashInOnline, userId);
      const updatedInstallment = await InstallmentModel.findById(id);

      return {
        success: true,
        message: 'Installment marked as paid successfully',
        data: updatedInstallment
      };
    } catch (error) {
      throw new Error(`Error marking installment as paid: ${error.message}`);
    }
  }

  // Mark installment as partially paid
  async markAsPartiallyPaid(id, cashInHand, cashInOnline, userId, userTenantId = null) {
    try {
      const existingInstallment = await InstallmentModel.findById(id);
      
      if (!existingInstallment) {
        return {
          success: false,
          message: 'Installment not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingInstallment.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Installment belongs to different tenant'
        };
      }

      const totalPaid = parseFloat(cashInHand) + parseFloat(cashInOnline);
      const remainAmount = parseFloat(existingInstallment.amount) - totalPaid;

      if (remainAmount <= 0) {
        return {
          success: false,
          message: 'Payment amount equals or exceeds installment amount. Use markAsPaid instead.'
        };
      }

      // Update loan balance - recalculate from totalAmount
      const loan = await LoanModel.findById(existingInstallment.loanId);
      if (loan) {
        // Get all installments for this loan
        const allInstallments = await InstallmentModel.findByLoanId(loan.id);
        
        // Calculate total paid across all installments (excluding current one, will add new payment)
        const totalInstallmentsPaid = allInstallments
          .filter(inst => inst.id !== id)
          .reduce((sum, inst) => {
            const paid = parseFloat(inst.cashInHand || 0) + parseFloat(inst.cashInOnline || 0);
            return sum + paid;
          }, 0);
        
        // Add current payment
        const currentPayment = parseFloat(cashInHand) + parseFloat(cashInOnline);
        const newBalanceAmount = parseFloat(loan.totalAmount) - (totalInstallmentsPaid + currentPayment);
        
        await LoanModel.update(loan.id, {
          ...loan,
          balanceAmount: newBalanceAmount > 0 ? newBalanceAmount : 0
        });
      }

      await InstallmentModel.markAsPartiallyPaid(id, cashInHand, cashInOnline, remainAmount, userId);
      const updatedInstallment = await InstallmentModel.findById(id);

      return {
        success: true,
        message: 'Installment marked as partially paid successfully',
        data: updatedInstallment
      };
    } catch (error) {
      throw new Error(`Error marking installment as partially paid: ${error.message}`);
    }
  }

  // Mark installment as missed (creates new installment row with MISSED status)
  async markAsMissed(installmentData) {
    try {
      // Validate required fields
      if (!installmentData.loanId) {
        return {
          success: false,
          message: 'Loan ID is required'
        };
      }

      // Get loan details
      const loan = await LoanModel.findById(installmentData.loanId);
      if (!loan) {
        return {
          success: false,
          message: 'Loan not found'
        };
      }

      // Check tenant access
      if (installmentData.tenantId && loan.tenantId !== installmentData.tenantId) {
        return {
          success: false,
          message: 'Access denied: Loan belongs to different tenant'
        };
      }

      // Get loan type for nextDue calculation
      const loanType = await LoanTypeModel.findById(loan.loanTypeId);
      if (!loanType) {
        return {
          success: false,
          message: 'Loan type not found'
        };
      }

      const today = new Date();
      const dueAt = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Calculate nextDue based on collection type
      const nextDueDate = new Date(today);
      const collectionType = loanType.collectionType.toUpperCase();
      const collectionPeriod = parseInt(loanType.collectionPeriod);
      
      if (collectionType === 'DAILY') {
        nextDueDate.setDate(nextDueDate.getDate() + collectionPeriod);
      } else if (collectionType === 'WEEKLY') {
        nextDueDate.setDate(nextDueDate.getDate() + (collectionPeriod * 7));
      } else if (collectionType === 'MONTHLY') {
        nextDueDate.setMonth(nextDueDate.getMonth() + collectionPeriod);
      }
      
      const nextDue = nextDueDate.toISOString().slice(0, 19).replace('T', ' '); // MySQL TIMESTAMP format

      // Get installment amount from loan
      const amount = 0;
      const cashInHand = 0;
      const cashInOnline = 0;
      //const remainAmount = amount; // No payment made, so remain equals amount
      const totalPaid = cashInHand + cashInOnline;
      // Check if installment already exists for this loan and date
      const existingInstallments = await InstallmentModel.findByLoanId(installmentData.loanId);
      const existingInstallment = existingInstallments.find(inst => inst.dueAt === dueAt);

      // Calculate total amount paid across all installments for this loan
      let totalInstallmentsPaid = 0;
      
      if (existingInstallment) {
        // If updating existing installment, exclude its previous payment from total
        totalInstallmentsPaid = existingInstallments
          .filter(inst => inst.id !== existingInstallment.id)
          .reduce((sum, inst) => {
            const paid = parseFloat(inst.cashInHand || 0) + parseFloat(inst.cashInOnline || 0);
            return sum + paid;
          }, 0);
        // Add current payment
        totalInstallmentsPaid += totalPaid;
      } else {
        // For new installment, sum all existing payments + current payment
        totalInstallmentsPaid = existingInstallments.reduce((sum, inst) => {
          const paid = parseFloat(inst.cashInHand || 0) + parseFloat(inst.cashInOnline || 0);
          return sum + paid;
        }, 0);
        totalInstallmentsPaid += totalPaid;
      }

      // Update loan's balanceAmount: totalAmount - total of all installments paid
      const newBalanceAmount = parseFloat(loan.totalAmount) - totalInstallmentsPaid;
      await LoanModel.update(loan.id, {
        ...loan,
        balanceAmount: newBalanceAmount > 0 ? newBalanceAmount : 0
      });

      const completeInstallmentData = {
        loanId: installmentData.loanId,
        tenantId: installmentData.tenantId,
        dueAt: dueAt,
        amount: amount,
        remainAmount: newBalanceAmount > 0 ? newBalanceAmount : 0,
        cashInHand: cashInHand,
        cashInOnline: cashInOnline,
        status: 'MISSED',
        collectedBy: installmentData.collectedBy,
        nextDue: nextDue
      };

      let installmentId;
      let message;
      
      if (existingInstallment) {
        // Update existing installment to MISSED status
        await InstallmentModel.update(existingInstallment.id, completeInstallmentData);
        installmentId = existingInstallment.id;
        message = 'Installment updated to MISSED status';
      } else {
        // Create new installment with MISSED status
        installmentId = await InstallmentModel.create(completeInstallmentData);
        message = 'Installment created with MISSED status';
      }

      const resultInstallment = await InstallmentModel.findById(installmentId);
      
      return {
        success: true,
        message: message,
        data: resultInstallment
      };
    } catch (error) {
      throw new Error(`Error marking installment as missed: ${error.message}`);
    }
  }

  // Delete installment
  async deleteInstallment(id, userTenantId = null) {
    try {
      const existingInstallment = await InstallmentModel.findById(id);
      
      if (!existingInstallment) {
        return {
          success: false,
          message: 'Installment not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingInstallment.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Installment belongs to different tenant'
        };
      }

      await InstallmentModel.delete(id);

      return {
        success: true,
        message: 'Installment deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting installment: ${error.message}`);
    }
  }

  // Get last 7 period totals by line type, respecting line type's collectionType
  async getLast7TotalsByLineType(lineTypeId, userId, userTenantId) {
    try {
      if (!lineTypeId) {
        return { success: false, message: 'lineTypeId is required' };
      }

      // Validate line type, tenant, and (if required) access users
      const LineTypeModel = require('../models/lineTypeModel');
      const LoanTypeModel = require('../models/loanTypeModel');
      const lineType = await LineTypeModel.findById(lineTypeId);
      if (!lineType) {
        return { success: false, message: 'Line type not found' };
      }
      if (lineType.tenantId !== userTenantId) {
        return { success: false, message: 'Access denied: Line type belongs to different tenant' };
      }
      // If accessUsersId is provided, enforce membership
      if (lineType.accessUsersId && String(lineType.accessUsersId).trim().length > 0) {
        const accessUserIds = String(lineType.accessUsersId)
          .split(',')
          .map(id => parseInt(id.trim()))
          .filter(n => !Number.isNaN(n));
        if (accessUserIds.length > 0 && !accessUserIds.includes(userId)) {
          return { success: false, message: 'Access denied: You are not authorized for this line type' };
        }
      }

      // Determine collection type from loan type
      const loanType = await LoanTypeModel.findById(lineType.loanTypeId);
      if (!loanType) {
        return { success: false, message: 'Associated loan type not found' };
      }
      const collectionType = String(loanType.collectionType || '').toUpperCase();

      let series = [];
      if (collectionType === 'DAILY') {
        series = await InstallmentModel.getDailyTotalsByLineTypeForLastNDays(lineTypeId, userTenantId, 7);
        // Normalize to 7 entries (day -6 ... today), filling zeros when no data
        const map = new Map(series.map(r => [r.periodDate, parseFloat(r.totalCollected) || 0]));
        const today = new Date();
        const result = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          result.push({ label: key, total: map.get(key) || 0 });
        }
        return { success: true, data: { collectionType: 'DAILY', periods: result } };
      } else if (collectionType === 'WEEKLY') {
        series = await InstallmentModel.getWeeklyTotalsByLineTypeForLastNWeeks(lineTypeId, userTenantId, 7);
        // Expect ascending oldest->newest; format label as weekStart..weekEnd
        const result = series.map(r => ({
          label: `${r.weekStart}..${r.weekEnd}`,
          total: parseFloat(r.totalCollected) || 0
        }));
        return { success: true, data: { collectionType: 'WEEKLY', periods: result } };
      } else if (collectionType === 'MONTHLY') {
        series = await InstallmentModel.getMonthlyTotalsByLineTypeForLastNMonths(lineTypeId, userTenantId, 7);
        const result = series.map(r => ({
          label: r.monthStart,
          total: parseFloat(r.totalCollected) || 0
        }));
        return { success: true, data: { collectionType: 'MONTHLY', periods: result } };
      }

      return { success: false, message: `Unsupported collection type: ${loanType.collectionType}` };
    } catch (error) {
      throw new Error(`Error fetching last 7 totals: ${error.message}`);
    }
  }
}

module.exports = new InstallmentService();

