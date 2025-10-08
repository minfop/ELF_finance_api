const tenantSubscriptionService = require('../services/tenantSubscriptionService');

class TenantSubscriptionController {
  // Get all subscriptions
  async getAllSubscriptions(req, res) {
    try {
      const { tenantId, roleName } = req.user;
      const result = await tenantSubscriptionService.getAllSubscriptions(tenantId, roleName);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get subscription by ID
  async getSubscriptionById(req, res) {
    try {
      const { id } = req.params;
      const { tenantId, roleName } = req.user;
      const result = await tenantSubscriptionService.getSubscriptionById(id, tenantId, roleName);

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

  // Get subscriptions by tenant
  async getSubscriptionsByTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const result = await tenantSubscriptionService.getSubscriptionsByTenant(tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create subscription
  async createSubscription(req, res) {
    try {
      const result = await tenantSubscriptionService.createSubscription(req.body);

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

  // Update subscription
  async updateSubscription(req, res) {
    try {
      const { id } = req.params;
      const result = await tenantSubscriptionService.updateSubscription(id, req.body);

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

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const { id } = req.params;
      const result = await tenantSubscriptionService.cancelSubscription(id);

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

  // Expire subscription
  async expireSubscription(req, res) {
    try {
      const { id } = req.params;
      const result = await tenantSubscriptionService.expireSubscription(id);

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

  // Delete subscription
  async deleteSubscription(req, res) {
    try {
      const { id } = req.params;
      const result = await tenantSubscriptionService.deleteSubscription(id);

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

module.exports = new TenantSubscriptionController();

