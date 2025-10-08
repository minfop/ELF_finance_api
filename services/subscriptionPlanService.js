const SubscriptionPlanModel = require('../models/subscriptionPlanModel');

class SubscriptionPlanService {
  // Get all subscription plans
  async getAllPlans() {
    try {
      const plans = await SubscriptionPlanModel.findAll();
      return {
        success: true,
        data: plans
      };
    } catch (error) {
      throw new Error(`Error fetching subscription plans: ${error.message}`);
    }
  }

  // Get active plans only
  async getActivePlans() {
    try {
      const plans = await SubscriptionPlanModel.findActive();
      return {
        success: true,
        data: plans
      };
    } catch (error) {
      throw new Error(`Error fetching active plans: ${error.message}`);
    }
  }

  // Get plan by ID
  async getPlanById(id) {
    try {
      const plan = await SubscriptionPlanModel.findById(id);
      
      if (!plan) {
        return {
          success: false,
          message: 'Subscription plan not found'
        };
      }

      return {
        success: true,
        data: plan
      };
    } catch (error) {
      throw new Error(`Error fetching subscription plan: ${error.message}`);
    }
  }

  // Create subscription plan
  async createPlan(planData) {
    try {
      if (!planData.planName) {
        return {
          success: false,
          message: 'Plan name is required'
        };
      }

      if (!planData.planType) {
        return {
          success: false,
          message: 'Plan type is required'
        };
      }

      if (!planData.duration) {
        return {
          success: false,
          message: 'Duration is required'
        };
      }

      if (!planData.price) {
        return {
          success: false,
          message: 'Price is required'
        };
      }

      const planId = await SubscriptionPlanModel.create(planData);
      const newPlan = await SubscriptionPlanModel.findById(planId);

      return {
        success: true,
        message: 'Subscription plan created successfully',
        data: newPlan
      };
    } catch (error) {
      throw new Error(`Error creating subscription plan: ${error.message}`);
    }
  }

  // Update subscription plan
  async updatePlan(id, planData) {
    try {
      const existingPlan = await SubscriptionPlanModel.findById(id);
      
      if (!existingPlan) {
        return {
          success: false,
          message: 'Subscription plan not found'
        };
      }

      const affectedRows = await SubscriptionPlanModel.update(id, planData);
      
      if (affectedRows === 0) {
        return {
          success: false,
          message: 'No changes made'
        };
      }

      const updatedPlan = await SubscriptionPlanModel.findById(id);

      return {
        success: true,
        message: 'Subscription plan updated successfully',
        data: updatedPlan
      };
    } catch (error) {
      throw new Error(`Error updating subscription plan: ${error.message}`);
    }
  }

  // Deactivate plan
  async deactivatePlan(id) {
    try {
      const existingPlan = await SubscriptionPlanModel.findById(id);
      
      if (!existingPlan) {
        return {
          success: false,
          message: 'Subscription plan not found'
        };
      }

      await SubscriptionPlanModel.softDelete(id);

      return {
        success: true,
        message: 'Subscription plan deactivated successfully'
      };
    } catch (error) {
      throw new Error(`Error deactivating subscription plan: ${error.message}`);
    }
  }

  // Delete plan
  async deletePlan(id) {
    try {
      const existingPlan = await SubscriptionPlanModel.findById(id);
      
      if (!existingPlan) {
        return {
          success: false,
          message: 'Subscription plan not found'
        };
      }

      await SubscriptionPlanModel.delete(id);

      return {
        success: true,
        message: 'Subscription plan deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting subscription plan: ${error.message}`);
    }
  }
}

module.exports = new SubscriptionPlanService();

