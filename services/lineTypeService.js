const LineTypeModel = require('../models/lineTypeModel');

class LineTypeService {
  // Get all line types (with tenant filtering)
  async getAllLineTypes(userTenantId = null, userRole = null) {
    try {
      let lineTypes;
      
      // Filter by tenant for non-monster roles
      if (userTenantId) {
        lineTypes = await LineTypeModel.findByTenantId(userTenantId);
      } else {
        lineTypes = await LineTypeModel.findAll();
      }

      return {
        success: true,
        data: lineTypes
      };
    } catch (error) {
      throw new Error(`Error fetching line types: ${error.message}`);
    }
  }

  // Get active line types only
  async getActiveLineTypes(userTenantId = null) {
    try {
      let lineTypes;
      
      if (userTenantId) {
        lineTypes = await LineTypeModel.findActiveByTenant(userTenantId);
      } else {
        lineTypes = await LineTypeModel.findActive();
      }

      return {
        success: true,
        data: lineTypes
      };
    } catch (error) {
      throw new Error(`Error fetching active line types: ${error.message}`);
    }
  }

  // Get line types accessible by user within tenant
  async getLineTypesByUser(tenantId, userId) {
    try {
      if (!tenantId || !userId) {
        return {
          success: false,
          message: 'tenantId and userId are required'
        };
      }

      const lineTypes = await LineTypeModel.findByTenantAndUserAccess(tenantId, userId);

      return {
        success: true,
        data: lineTypes
      };
    } catch (error) {
      throw new Error(`Error fetching line types by user: ${error.message}`);
    }
  }

  // Get line type by ID
  async getLineTypeById(id, userTenantId = null) {
    try {
      const lineType = await LineTypeModel.findById(id);
      
      if (!lineType) {
        return {
          success: false,
          message: 'Line type not found'
        };
      }

      // Check tenant access
      if (userTenantId && lineType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Line type belongs to different tenant'
        };
      }

      return {
        success: true,
        data: lineType
      };
    } catch (error) {
      throw new Error(`Error fetching line type: ${error.message}`);
    }
  }

  // Create line type
  async createLineType(lineTypeData) {
    try {
      // Validate required fields
      if (!lineTypeData.tenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      if (!lineTypeData.name) {
        return {
          success: false,
          message: 'Name is required'
        };
      }

      if (!lineTypeData.loanTypeId) {
        return {
          success: false,
          message: 'Loan type ID is required'
        };
      }

      const lineTypeId = await LineTypeModel.create(lineTypeData);
      const newLineType = await LineTypeModel.findById(lineTypeId);

      return {
        success: true,
        message: 'Line type created successfully',
        data: newLineType
      };
    } catch (error) {
      throw new Error(`Error creating line type: ${error.message}`);
    }
  }

  // Update line type
  async updateLineType(id, lineTypeData, userTenantId = null) {
    try {
      const existingLineType = await LineTypeModel.findById(id);
      
      if (!existingLineType) {
        return {
          success: false,
          message: 'Line type not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingLineType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Line type belongs to different tenant'
        };
      }

      // Preserve the original tenantId (prevent changing tenant)
      lineTypeData.tenantId = existingLineType.tenantId;

      const affectedRows = await LineTypeModel.update(id, lineTypeData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedLineType = await LineTypeModel.findById(id);

      return {
        success: true,
        message: 'Line type updated successfully',
        data: updatedLineType
      };
    } catch (error) {
      throw new Error(`Error updating line type: ${error.message}`);
    }
  }

  // Deactivate line type
  async deactivateLineType(id, userTenantId = null) {
    try {
      const existingLineType = await LineTypeModel.findById(id);
      
      if (!existingLineType) {
        return {
          success: false,
          message: 'Line type not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingLineType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Line type belongs to different tenant'
        };
      }

      await LineTypeModel.softDelete(id);

      return {
        success: true,
        message: 'Line type deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating line type: ${error.message}`);
    }
  }

  // Delete line type
  async deleteLineType(id, userTenantId = null) {
    try {
      const existingLineType = await LineTypeModel.findById(id);
      
      if (!existingLineType) {
        return {
          success: false,
          message: 'Line type not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingLineType.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Line type belongs to different tenant'
        };
      }

      await LineTypeModel.delete(id);

      return {
        success: true,
        message: 'Line type deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting line type: ${error.message}`);
    }
  }
}

module.exports = new LineTypeService();

