const userService = require('../services/userService');

class UserController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const result = await userService.getAllUsers();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get active users
  async getActiveUsers(req, res) {
    try {
      const result = await userService.getActiveUsers();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.getUserById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get users by tenant ID (from token)
  async getUsersByTenantId(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await userService.getUsersByTenantId(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get users by role ID
  async getUsersByRoleId(req, res) {
    try {
      const { roleId } = req.params;
      const result = await userService.getUsersByRoleId(roleId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const { tenantId } = req.user;
      
      // Always use tenantId from token, ignore from body
      req.body.tenantId = tenantId;

      const result = await userService.createUser(req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      
      // Remove tenantId from body to prevent changing user's tenant
      delete req.body.tenantId;
      
      const result = await userService.updateUser(id, req.body, tenantId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Deactivate user (soft delete)
  async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.deactivateUser(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user (hard delete)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();

