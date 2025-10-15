const LoanTypeModel = require('../models/loanTypeModel');

class LoanTypeService {
  // Get all loan types (with tenant filtering for non-monster roles)
  async getAllLoanTypes(userTenantId = null, userRole = null) {
    try {
      let loanTypes;
      
      // Monster can see all loan types, others only their tenant
      if (userRole === 'monsters') {
        loanTypes = await LoanTypeModel.findAll();
      } else if (userTenantId) {
        loanTypes = await LoanTypeModel.findByTenantId(userTenantId);
      } else {
        loanTypes = await LoanTypeModel.findAll();
      }

      return {
        success: true,
        data: loanTypes
      };
    } catch (error) {
      throw new Error(`Error fetching loan types: ${error.message}`);
    }
  }

  // Get active loan types only
  async getActiveLoanTypes(userTenantId = null, userRole = null) {
    try {
      const allActiveLoanTypes = await LoanTypeModel.findActive();
      
      // Filter by tenant if not monster
      let loanTypes;
      if (userRole === 'monsters') {
        loanTypes = allActiveLoanTypes;
      } else if (userTenantId) {
        loanTypes = allActiveLoanTypes.filter(lt => lt.tenantId === userTenantId);
      } else {
        loanTypes = allActiveLoanTypes;
      }

      return {
        success: true,
        data: loanTypes
      };
    } catch (error) {
      throw new Error(`Error fetching active loan types: ${error.message}`);
    }
  }

  // Get loan type by ID
  async getLoanTypeById(id, userTenantId = null, userRole = null) {
    try {
      const loanType = await LoanTypeModel.findById(id);
      
      if (!loanType) {
        return {
          success: false,
          message: 'Loan type not found'
        };
      }

      // Check tenant access (monster can access all)
      if (userRole !== 'monsters' && userTenantId && loanType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan type belongs to different tenant'
        };
      }

      return {
        success: true,
        data: loanType
      };
    } catch (error) {
      throw new Error(`Error fetching loan type: ${error.message}`);
    }
  }

  // Get loan types by tenant
  async getLoanTypesByTenant(tenantId) {
    try {
      const loanTypes = await LoanTypeModel.findByTenantId(tenantId);
      return {
        success: true,
        data: loanTypes
      };
    } catch (error) {
      throw new Error(`Error fetching loan types by tenant: ${error.message}`);
    }
  }

  // Create loan type
  async createLoanType(loanTypeData) {
    try {
      if (!loanTypeData.tenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      if (!loanTypeData.collectionType) {
        return {
          success: false,
          message: 'Collection type is required'
        };
      }

      if (!loanTypeData.collectionPeriod) {
        return {
          success: false,
          message: 'Collection period is required'
        };
      }

      if (loanTypeData.interest === undefined || loanTypeData.interest === null) {
        return {
          success: false,
          message: 'Interest is required'
        };
      }

      if (loanTypeData.initialDeduction === undefined || loanTypeData.initialDeduction === null) {
        return {
          success: false,
          message: 'Initial deduction is required'
        };
      }

      if (loanTypeData.nilCalculation === undefined || loanTypeData.nilCalculation === null) {
        return {
          success: false,
          message: 'Nil calculation is required'
        };
      }

      if (loanTypeData.isInterestPreDetection === undefined || loanTypeData.isInterestPreDetection === null) {
        return {
          success: false,
          message: 'Interest pre-detection flag is required'
        };
      }

      const loanTypeId = await LoanTypeModel.create(loanTypeData);
      const newLoanType = await LoanTypeModel.findById(loanTypeId);

      return {
        success: true,
        message: 'Loan type created successfully',
        data: newLoanType
      };
    } catch (error) {
      throw new Error(`Error creating loan type: ${error.message}`);
    }
  }

  // Update loan type
  async updateLoanType(id, loanTypeData, userTenantId = null, userRole = null) {
    try {
      const existingLoanType = await LoanTypeModel.findById(id);
      
      if (!existingLoanType) {
        return {
          success: false,
          message: 'Loan type not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingLoanType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan type belongs to different tenant'
        };
      }

      // Preserve the original tenantId (prevent changing tenant)
      loanTypeData.tenantId = existingLoanType.tenantId;

      const affectedRows = await LoanTypeModel.update(id, loanTypeData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedLoanType = await LoanTypeModel.findById(id);

      return {
        success: true,
        message: 'Loan type updated successfully',
        data: updatedLoanType
      };
    } catch (error) {
      throw new Error(`Error updating loan type: ${error.message}`);
    }
  }

  // Deactivate loan type
  async deactivateLoanType(id, userTenantId = null, userRole = null) {
    try {
      const existingLoanType = await LoanTypeModel.findById(id);
      
      if (!existingLoanType) {
        return {
          success: false,
          message: 'Loan type not found'
        };
      }

      // Check tenant access
      if (userRole !== 'monsters' && userTenantId && existingLoanType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan type belongs to different tenant'
        };
      }

      await LoanTypeModel.softDelete(id);

      return {
        success: true,
        message: 'Loan type deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating loan type: ${error.message}`);
    }
  }

  // Delete loan type
  async deleteLoanType(id, userTenantId = null, userRole = null) {
    try {
      const existingLoanType = await LoanTypeModel.findById(id);
      
      if (!existingLoanType) {
        return {
          success: false,
          message: 'Loan type not found'
        };
      }

      // Check tenant access
      if (userRole !== 'monsters' && userTenantId && existingLoanType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Loan type belongs to different tenant'
        };
      }

      await LoanTypeModel.delete(id);

      return {
        success: true,
        message: 'Loan type deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting loan type: ${error.message}`);
    }
  }
}

module.exports = new LoanTypeService();

