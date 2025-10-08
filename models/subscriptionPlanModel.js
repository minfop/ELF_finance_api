const { pool } = require('../config/database');

class SubscriptionPlanModel {
  // Get all subscription plans
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, planName, planType, duration, price, features, isActive, createdAt FROM subscriptionPlans'
    );
    return rows;
  }

  // Get subscription plan by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, planName, planType, duration, price, features, isActive, createdAt FROM subscriptionPlans WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get active subscription plans
  static async findActive() {
    const [rows] = await pool.query(
      'SELECT id, planName, planType, duration, price, features, isActive, createdAt FROM subscriptionPlans WHERE isActive = 1'
    );
    return rows;
  }

  // Create new subscription plan
  static async create(planData) {
    const { planName, planType, duration, price, features, isActive = 1 } = planData;
    const [result] = await pool.query(
      'INSERT INTO subscriptionPlans (planName, planType, duration, price, features, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, CURDATE())',
      [planName, planType, duration, price, features, isActive]
    );
    return result.insertId;
  }

  // Update subscription plan
  static async update(id, planData) {
    const { planName, planType, duration, price, features, isActive } = planData;
    const [result] = await pool.query(
      'UPDATE subscriptionPlans SET planName = ?, planType = ?, duration = ?, price = ?, features = ?, isActive = ? WHERE id = ?',
      [planName, planType, duration, price, features, isActive, id]
    );
    return result.affectedRows;
  }

  // Soft delete subscription plan
  static async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE subscriptionPlans SET isActive = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Hard delete subscription plan
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM subscriptionPlans WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = SubscriptionPlanModel;

