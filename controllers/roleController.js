const roleService = require('../services/roleService');

class RoleController {
  // Get all roles
  async getAllRoles(req, res) {
    try {
      const result = await roleService.getAllRoles();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get active roles
  async getActiveRoles(req, res) {
    try {
      const result = await roleService.getActiveRoles();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get role by ID
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const result = await roleService.getRoleById(id);

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

  // Get role by name
  async getRoleByName(req, res) {
    try {
      const { name } = req.params;
      const result = await roleService.getRoleByName(name);

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

  // Create new role
  async createRole(req, res) {
    try {
      const result = await roleService.createRole(req.body);

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

  // Update role
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const result = await roleService.updateRole(id, req.body);

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

  // Deactivate role (soft delete)
  async deactivateRole(req, res) {
    try {
      const { id } = req.params;
      const result = await roleService.deactivateRole(id);

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

  // Delete role (hard delete)
  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const result = await roleService.deleteRole(id);

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

module.exports = new RoleController();

