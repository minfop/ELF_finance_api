const CustomerModel = require('../models/customerModel');

class CustomerService {
  // Get all customers (with tenant filtering for non-monster roles)
  async getAllCustomers(userTenantId = null, userRole = null) {
    try {
      let customers;
      
      // Monster can see all customers, others only their tenant
      if (userRole === 'monsters') {
        customers = await CustomerModel.findAll();
      } else if (userTenantId) {
        customers = await CustomerModel.findByTenantId(userTenantId);
      } else {
        customers = await CustomerModel.findAll();
      }

      return {
        success: true,
        data: customers
      };
    } catch (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }

  // Get customer by ID
  async getCustomerById(id, userTenantId = null, userRole = null) {
    try {
      const customer = await CustomerModel.findById(id);
      
      if (!customer) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      // Check tenant access (monster can access all)
      if (userRole !== 'monsters' && userTenantId && customer.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Customer belongs to different tenant'
        };
      }

      return {
        success: true,
        data: customer
      };
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`);
    }
  }

  // Get customers by tenant
  async getCustomersByTenant(tenantId) {
    try {
      const customers = await CustomerModel.findByTenantId(tenantId);
      return {
        success: true,
        data: customers
      };
    } catch (error) {
      throw new Error(`Error fetching customers by tenant: ${error.message}`);
    }
  }

  // Create customer
  async createCustomer(customerData) {
    try {
      if (!customerData.name) {
        return {
          success: false,
          message: 'Customer name is required'
        };
      }

      if (!customerData.tenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      const customerId = await CustomerModel.create(customerData);
      const newCustomer = await CustomerModel.findById(customerId);

      return {
        success: true,
        message: 'Customer created successfully',
        data: newCustomer
      };
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
  }

  // Update customer
  async updateCustomer(id, customerData, userTenantId = null, userRole = null) {
    try {
      const existingCustomer = await CustomerModel.findById(id);
      
      if (!existingCustomer) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      // Check tenant access
      if (userTenantId && existingCustomer.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Customer belongs to different tenant'
        };
      }

      // Preserve the original tenantId (prevent changing tenant)
      customerData.tenantId = existingCustomer.tenantId;

      const affectedRows = await CustomerModel.update(id, customerData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedCustomer = await CustomerModel.findById(id);

      return {
        success: true,
        message: 'Customer updated successfully',
        data: updatedCustomer
      };
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  // Deactivate customer
  async deactivateCustomer(id, userTenantId = null, userRole = null) {
    try {
      const existingCustomer = await CustomerModel.findById(id);
      
      if (!existingCustomer) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      // Check tenant access
      if (userRole !== 'monsters' && userTenantId && existingCustomer.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Customer belongs to different tenant'
        };
      }

      await CustomerModel.softDelete(id);

      return {
        success: true,
        message: 'Customer deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating customer: ${error.message}`);
    }
  }

  // Delete customer
  async deleteCustomer(id, userTenantId = null, userRole = null) {
    try {
      const existingCustomer = await CustomerModel.findById(id);
      
      if (!existingCustomer) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      // Check tenant access
      if (userRole !== 'monsters' && userTenantId && existingCustomer.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Customer belongs to different tenant'
        };
      }

      await CustomerModel.delete(id);

      return {
        success: true,
        message: 'Customer deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting customer: ${error.message}`);
    }
  }
}

module.exports = new CustomerService();

