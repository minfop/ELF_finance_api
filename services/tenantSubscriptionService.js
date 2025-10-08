const TenantSubscriptionModel = require('../models/tenantSubscriptionModel');

class TenantSubscriptionService {
  // Get all subscriptions (monster can see all)
  async getAllSubscriptions(userTenantId = null, userRole = null) {
    try {
      let subscriptions;
      
      // Monster can see all subscriptions
      if (userRole === 'monsters') {
        subscriptions = await TenantSubscriptionModel.findAll();
      } else if (userTenantId) {
        subscriptions = await TenantSubscriptionModel.findByTenantId(userTenantId);
      } else {
        subscriptions = await TenantSubscriptionModel.findAll();
      }

      return {
        success: true,
        data: subscriptions
      };
    } catch (error) {
      throw new Error(`Error fetching subscriptions: ${error.message}`);
    }
  }

  // Get subscription by ID
  async getSubscriptionById(id, userTenantId = null, userRole = null) {
    try {
      const subscription = await TenantSubscriptionModel.findById(id);
      
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }

      // Check tenant access (monster can access all)
      if (userRole !== 'monsters' && userTenantId && subscription.tenantId !== userTenantId) {
        return {
          success: false,
          message: 'Access denied: Subscription belongs to different tenant'
        };
      }

      return {
        success: true,
        data: subscription
      };
    } catch (error) {
      throw new Error(`Error fetching subscription: ${error.message}`);
    }
  }

  // Get subscriptions by tenant
  async getSubscriptionsByTenant(tenantId) {
    try {
      const subscriptions = await TenantSubscriptionModel.findByTenantId(tenantId);
      return {
        success: true,
        data: subscriptions
      };
    } catch (error) {
      throw new Error(`Error fetching subscriptions by tenant: ${error.message}`);
    }
  }

  // Create subscription
  async createSubscription(subscriptionData) {
    try {
      if (!subscriptionData.tenantId) {
        return {
          success: false,
          message: 'Tenant ID is required'
        };
      }

      if (!subscriptionData.subscriptionPlanId) {
        return {
          success: false,
          message: 'Subscription Plan ID is required'
        };
      }

      if (!subscriptionData.startDate) {
        return {
          success: false,
          message: 'Start date is required'
        };
      }

      if (!subscriptionData.endDate) {
        return {
          success: false,
          message: 'End date is required'
        };
      }

      const subscriptionId = await TenantSubscriptionModel.create(subscriptionData);
      const newSubscription = await TenantSubscriptionModel.findById(subscriptionId);

      return {
        success: true,
        message: 'Subscription created successfully',
        data: newSubscription
      };
    } catch (error) {
      throw new Error(`Error creating subscription: ${error.message}`);
    }
  }

  // Update subscription
  async updateSubscription(id, subscriptionData) {
    try {
      const existingSubscription = await TenantSubscriptionModel.findById(id);
      
      if (!existingSubscription) {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }

      const affectedRows = await TenantSubscriptionModel.update(id, subscriptionData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedSubscription = await TenantSubscriptionModel.findById(id);

      return {
        success: true,
        message: 'Subscription updated successfully',
        data: updatedSubscription
      };
    } catch (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
  }

  // Cancel subscription
  async cancelSubscription(id) {
    try {
      const existingSubscription = await TenantSubscriptionModel.findById(id);
      
      if (!existingSubscription) {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }

      await TenantSubscriptionModel.cancel(id);

      return {
        success: true,
        message: 'Subscription cancelled successfully'
      };
    } catch (error) {
      throw new Error(`Error cancelling subscription: ${error.message}`);
    }
  }

  // Expire subscription
  async expireSubscription(id) {
    try {
      const existingSubscription = await TenantSubscriptionModel.findById(id);
      
      if (!existingSubscription) {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }

      await TenantSubscriptionModel.expire(id);

      return {
        success: true,
        message: 'Subscription expired successfully'
      };
    } catch (error) {
      throw new Error(`Error expiring subscription: ${error.message}`);
    }
  }

  // Delete subscription
  async deleteSubscription(id) {
    try {
      const existingSubscription = await TenantSubscriptionModel.findById(id);
      
      if (!existingSubscription) {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }

      await TenantSubscriptionModel.delete(id);

      return {
        success: true,
        message: 'Subscription deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting subscription: ${error.message}`);
    }
  }
}

module.exports = new TenantSubscriptionService();

