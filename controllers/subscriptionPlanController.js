const subscriptionPlanService = require('../services/subscriptionPlanService');

class SubscriptionPlanController {
  // Get all plans
  async getAllPlans(req, res) {
    try {
      const result = await subscriptionPlanService.getAllPlans();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get active plans
  async getActivePlans(req, res) {
    try {
      const result = await subscriptionPlanService.getActivePlans();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get plan by ID
  async getPlanById(req, res) {
    try {
      const { id } = req.params;
      const result = await subscriptionPlanService.getPlanById(id);

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

  // Create plan
  async createPlan(req, res) {
    try {
      const result = await subscriptionPlanService.createPlan(req.body);

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

  // Update plan
  async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const result = await subscriptionPlanService.updatePlan(id, req.body);

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

  // Deactivate plan
  async deactivatePlan(req, res) {
    try {
      const { id } = req.params;
      const result = await subscriptionPlanService.deactivatePlan(id);

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

  // Delete plan
  async deletePlan(req, res) {
    try {
      const { id } = req.params;
      const result = await subscriptionPlanService.deletePlan(id);

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

module.exports = new SubscriptionPlanController();

