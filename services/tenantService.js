const TenantModel = require('../models/tenantModel');
const UserModel = require('../models/userModel');

class TenantService {
  // Get all tenants
  async getAllTenants() {
    try {
      const tenants = await TenantModel.findAll();
      return {
        success: true,
        data: tenants
      };
    } catch (error) {
      throw new Error(`Error fetching tenants: ${error.message}`);
    }
  }

  // Get active tenants only
  async getActiveTenants() {
    try {
      const tenants = await TenantModel.findActive();
      return {
        success: true,
        data: tenants
      };
    } catch (error) {
      throw new Error(`Error fetching active tenants: ${error.message}`);
    }
  }

  // Get tenant by ID
  async getTenantById(id) {
    try {
      const tenant = await TenantModel.findById(id);
      
      if (!tenant) {
        return {
          success: false,
          message: 'Tenant not found'
        };
      }

      return {
        success: true,
        data: tenant
      };
    } catch (error) {
      throw new Error(`Error fetching tenant: ${error.message}`);
    }
  }

  // Create new tenant
  async createTenant(tenantData) {
    try {
      // Validate required fields for tenant
      if (!tenantData.name) {
        return {
          success: false,
          message: 'Tenant name is required'
        };
      }

      // Validate admin user data
      if (!tenantData.adminName) {
        return {
          success: false,
          message: 'Admin user name is required'
        };
      }

      if (!tenantData.adminEmail) {
        return {
          success: false,
          message: 'Admin email is required'
        };
      }

      if (!tenantData.adminPassword) {
        return {
          success: false,
          message: 'Admin password is required'
        };
      }

      // Check if admin email already exists
      const existingUser = await UserModel.findByEmail(tenantData.adminEmail);
      if (existingUser) {
        return {
          success: false,
          message: 'Admin email already exists'
        };
      }

      // Create tenant
      const tenantId = await TenantModel.create(tenantData);
      
      // Create admin user for the tenant
      const adminUserData = {
        tenantId: tenantId,
        name: tenantData.adminName,
        roleId: 1, // Admin role ID
        email: tenantData.adminEmail,
        password: tenantData.adminPassword,
        phoneNumber: tenantData.adminPhone || null,
        isActive: 1
      };

      try {
        const adminUserId = await UserModel.create(adminUserData);
        const adminUser = await UserModel.findById(adminUserId);

        // Get the created tenant
        const newTenant = await TenantModel.findById(tenantId);

        return {
          success: true,
          message: 'Tenant and admin user created successfully',
          data: {
            tenant: newTenant,
            adminUser: {
              id: adminUser.id,
              name: adminUser.name,
              email: adminUser.email,
              roleId: adminUser.roleId,
              roleName: adminUser.roleName
            }
          }
        };
      } catch (userError) {
        // If user creation fails, rollback tenant creation
        await TenantModel.delete(tenantId);
        throw new Error(`Failed to create admin user: ${userError.message}`);
      }
    } catch (error) {
      throw new Error(`Error creating tenant: ${error.message}`);
    }
  }

  // Update tenant
  async updateTenant(id, tenantData) {
    try {
      // Check if tenant exists
      const existingTenant = await TenantModel.findById(id);
      if (!existingTenant) {
        return {
          success: false,
          message: 'Tenant not found'
        };
      }

      const affectedRows = await TenantModel.update(id, tenantData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedTenant = await TenantModel.findById(id);

      return {
        success: true,
        message: 'Tenant updated successfully',
        data: updatedTenant
      };
    } catch (error) {
      throw new Error(`Error updating tenant: ${error.message}`);
    }
  }

  // Soft delete tenant (set isActive to 0)
  async deactivateTenant(id) {
    try {
      const existingTenant = await TenantModel.findById(id);
      if (!existingTenant) {
        return {
          success: false,
          message: 'Tenant not found'
        };
      }

      await TenantModel.softDelete(id);

      return {
        success: true,
        message: 'Tenant deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating tenant: ${error.message}`);
    }
  }

  // Hard delete tenant
  async deleteTenant(id) {
    try {
      const existingTenant = await TenantModel.findById(id);
      if (!existingTenant) {
        return {
          success: false,
          message: 'Tenant not found'
        };
      }

      await TenantModel.delete(id);

      return {
        success: true,
        message: 'Tenant deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting tenant: ${error.message}`);
    }
  }
}

module.exports = new TenantService();
