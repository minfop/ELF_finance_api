const lineTypeService = require('../services/lineTypeService');

class LineTypeController {
  // Get all line types
  async getAllLineTypes(req, res) {
    try {
      const { tenantId, roleName } = req.user;
      const result = await lineTypeService.getAllLineTypes(tenantId, roleName);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get active line types
  async getActiveLineTypes(req, res) {
    try {
      const { tenantId } = req.user;
      const result = await lineTypeService.getActiveLineTypes(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get line type by ID
  async getLineTypeById(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await lineTypeService.getLineTypeById(id, tenantId);

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

  // Get line types by user access within tenant
  async getLineTypesByUser(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const result = await lineTypeService.getLineTypesByUser(tenantId, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create line type
  async createLineType(req, res) {
    try {
      const { tenantId } = req.user;
      
      // Always use tenantId from token, ignore from body
      req.body.tenantId = tenantId;

      const result = await lineTypeService.createLineType(req.body);

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

  // Update line type
  async updateLineType(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      
      // Remove tenantId from body to prevent changing line type's tenant
      delete req.body.tenantId;
      
      const result = await lineTypeService.updateLineType(id, req.body, tenantId);

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

  // Deactivate line type
  async deactivateLineType(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await lineTypeService.deactivateLineType(id, tenantId);

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

  // Delete line type
  async deleteLineType(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const result = await lineTypeService.deleteLineType(id, tenantId);

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

module.exports = new LineTypeController();

