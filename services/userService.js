const UserModel = require('../models/userModel');

class UserService {
  // Get all users
  async getAllUsers() {
    try {
      const users = await UserModel.findAll();
      return {
        success: true,
        data: users
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  // Get active users only
  async getActiveUsers() {
    try {
      const users = await UserModel.findActive();
      return {
        success: true,
        data: users
      };
    } catch (error) {
      throw new Error(`Error fetching active users: ${error.message}`);
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const user = await UserModel.findById(id);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Get users by tenant ID
  async getUsersByTenantId(tenantId) {
    try {
      const users = await UserModel.findByTenantId(tenantId);
      return {
        success: true,
        data: users
      };
    } catch (error) {
      throw new Error(`Error fetching users by tenant: ${error.message}`);
    }
  }

  // Get users by role ID
  async getUsersByRoleId(roleId) {
    try {
      const users = await UserModel.findByRoleId(roleId);
      return {
        success: true,
        data: users
      };
    } catch (error) {
      throw new Error(`Error fetching users by role: ${error.message}`);
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      // Validate required fields
      if (!userData.name) {
        return {
          success: false,
          message: 'User name is required'
        };
      }

      if (!userData.tenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      if (!userData.roleId) {
        return {
          success: false,
          message: 'Role ID is required'
        };
      }

      // Check if email already exists (if email is provided)
      if (userData.email) {
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
          return {
            success: false,
            message: 'Email already exists'
          };
        }
      }

      const userId = await UserModel.create(userData);
      const newUser = await UserModel.findById(userId);

      return {
        success: true,
        message: 'User created successfully',
        data: newUser
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Update user
  async updateUser(id, userData, userTenantId = null) {
    try {
      // Check if user exists
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check tenant access - user can only update users in their tenant
      if (userTenantId && existingUser.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Cannot update user from different tenant'
        };
      }

      // Check if email already exists (if email is being updated)
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await UserModel.findByEmail(userData.email);
        if (emailExists) {
          return {
            success: false,
            message: 'Email already exists'
          };
        }
      }

      // Preserve the original tenantId (prevent changing tenant)
      userData.tenantId = existingUser.tenantId;

      const affectedRows = await UserModel.update(id, userData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedUser = await UserModel.findById(id);

      return {
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      };
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Soft delete user (set isActive to 0)
  async deactivateUser(id) {
    try {
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      await UserModel.softDelete(id);

      return {
        success: true,
        message: 'User deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating user: ${error.message}`);
    }
  }

  // Hard delete user
  async deleteUser(id) {
    try {
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      await UserModel.delete(id);

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}

module.exports = new UserService();

