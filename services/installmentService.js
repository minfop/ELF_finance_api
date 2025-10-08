const InstallmentModel = require('../models/installmentModel');

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
      // Validate required fields
      if (!installmentData.loanId) {
        return {
          success: false,
          message: 'Loan ID is required'
        };
      }

      if (!installmentData.tenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      if (!installmentData.date) {
        return {
          success: false,
          message: 'Date is required'
        };
      }

      if (!installmentData.amount) {
        return {
          success: false,
          message: 'Amount is required'
        };
      }

      const installmentId = await InstallmentModel.create(installmentData);
      const newInstallment = await InstallmentModel.findById(installmentId);

      return {
        success: true,
        message: 'Installment created successfully',
        data: newInstallment
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
  async markAsPaid(id, userId, userTenantId = null) {
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

      await InstallmentModel.markAsPaid(id, userId);
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

  // Mark installment as missed
  async markAsMissed(id, userTenantId = null) {
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

      await InstallmentModel.markAsMissed(id);
      const updatedInstallment = await InstallmentModel.findById(id);

      return {
        success: true,
        message: 'Installment marked as missed successfully',
        data: updatedInstallment
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
}

module.exports = new InstallmentService();

