const RoleModel = require('../models/roleModel');

class RoleService {
  // Get all roles
  async getAllRoles() {
    try {
      const roles = await RoleModel.findAll();
      return {
        success: true,
        data: roles
      };
    } catch (error) {
      throw new Error(`Error fetching roles: ${error.message}`);
    }
  }

  // Get active roles only
  async getActiveRoles() {
    try {
      const roles = await RoleModel.findActive();
      return {
        success: true,
        data: roles
      };
    } catch (error) {
      throw new Error(`Error fetching active roles: ${error.message}`);
    }
  }

  // Get role by ID
  async getRoleById(id) {
    try {
      const role = await RoleModel.findById(id);
      
      if (!role) {
        return {
          success: false,
          message: 'Role not found'
        };
      }

      return {
        success: true,
        data: role
      };
    } catch (error) {
      throw new Error(`Error fetching role: ${error.message}`);
    }
  }

  // Get role by name
  async getRoleByName(name) {
    try {
      const role = await RoleModel.findByName(name);
      
      if (!role) {
        return {
          success: false,
          message: 'Role not found'
        };
      }

      return {
        success: true,
        data: role
      };
    } catch (error) {
      throw new Error(`Error fetching role: ${error.message}`);
    }
  }

  // Create new role
  async createRole(roleData) {
    try {
      // Validate required fields
      if (!roleData.name) {
        return {
          success: false,
          message: 'Role name is required'
        };
      }

      // Check if role name already exists
      const nameExists = await RoleModel.nameExists(roleData.name);
      if (nameExists) {
        return {
          success: false,
          message: 'Role name already exists'
        };
      }

      const roleId = await RoleModel.create(roleData);
      const newRole = await RoleModel.findById(roleId);

      return {
        success: true,
        message: 'Role created successfully',
        data: newRole
      };
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  // Update role
  async updateRole(id, roleData) {
    try {
      // Check if role exists
      const existingRole = await RoleModel.findById(id);
      if (!existingRole) {
        return {
          success: false,
          message: 'Role not found'
        };
      }

      // Check if new name already exists
      if (roleData.name && roleData.name !== existingRole.name) {
        const nameExists = await RoleModel.nameExists(roleData.name, id);
        if (nameExists) {
          return {
            success: false,
            message: 'Role name already exists'
          };
        }
      }

      const affectedRows = await RoleModel.update(id, roleData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedRole = await RoleModel.findById(id);

      return {
        success: true,
        message: 'Role updated successfully',
        data: updatedRole
      };
    } catch (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }

  // Soft delete role (set isActive to 0)
  async deactivateRole(id) {
    try {
      const existingRole = await RoleModel.findById(id);
      if (!existingRole) {
        return {
          success: false,
          message: 'Role not found'
        };
      }

      await RoleModel.softDelete(id);

      return {
        success: true,
        message: 'Role deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating role: ${error.message}`);
    }
  }

  // Hard delete role
  async deleteRole(id) {
    try {
      const existingRole = await RoleModel.findById(id);
      if (!existingRole) {
        return {
          success: false,
          message: 'Role not found'
        };
      }

      await RoleModel.delete(id);

      return {
        success: true,
        message: 'Role deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }
}

module.exports = new RoleService();

