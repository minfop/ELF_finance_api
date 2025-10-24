const { pool } = require('../config/database');

class TenantSubscriptionModel {
  // Get all subscriptions
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT ts.id, ts.tenantId, ts.subscriptionPlanId, ts.startDate, ts.endDate, ts.status,
              t.name as tenantName, sp.planName, sp.planType, sp.duration, sp.price, sp.features
       FROM tenantsubscriptions ts
       LEFT JOIN tenants t ON ts.tenantId = t.id
       LEFT JOIN subscriptionplans sp ON ts.subscriptionPlanId = sp.id`
    );
    return rows;
  }

  // Get subscription by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT ts.id, ts.tenantId, ts.subscriptionPlanId, ts.startDate, ts.endDate, ts.status,
              t.name as tenantName, sp.planName, sp.planType, sp.duration, sp.price, sp.features
       FROM tenantsubscriptions ts
       LEFT JOIN tenants t ON ts.tenantId = t.id
       LEFT JOIN subscriptionplans sp ON ts.subscriptionPlanId = sp.id
       WHERE ts.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get subscriptions by tenant ID
  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT ts.id, ts.tenantId, ts.subscriptionPlanId, ts.startDate, ts.endDate, ts.status,
              t.name as tenantName, sp.planName, sp.planType, sp.duration, sp.price, sp.features
       FROM tenantsubscriptions ts
       LEFT JOIN tenants t ON ts.tenantId = t.id
       LEFT JOIN subscriptionplans sp ON ts.subscriptionPlanId = sp.id
       WHERE ts.tenantId = ?`,
      [tenantId]
    );
    return rows;
  }

  // Get active subscriptions
  static async findActive() {
    const [rows] = await pool.query(
      `SELECT ts.id, ts.tenantId, ts.subscriptionPlanId, ts.startDate, ts.endDate, ts.status,
              t.name as tenantName, sp.planName, sp.planType, sp.duration, sp.price, sp.features
       FROM tenantsubscriptions ts
       LEFT JOIN tenants t ON ts.tenantId = t.id
       LEFT JOIN subscriptionplans sp ON ts.subscriptionPlanId = sp.id
       WHERE ts.status = 'ACTIVE'`
    );
    return rows;
  }

  // Create new subscription
  static async create(subscriptionData) {
    const { tenantId, subscriptionPlanId, startDate, endDate, status = 'ACTIVE' } = subscriptionData;
    const [result] = await pool.query(
      'INSERT INTO tenantsubscriptions (tenantId, subscriptionPlanId, startDate, endDate, status) VALUES (?, ?, ?, ?, ?)',
      [tenantId, subscriptionPlanId, startDate, endDate, status]
    );
    return result.insertId;
  }

  // Update subscription
  static async update(id, subscriptionData) {
    const { tenantId, subscriptionPlanId, startDate, endDate, status } = subscriptionData;
    const [result] = await pool.query(
      'UPDATE tenantsubscriptions SET tenantId = ?, subscriptionPlanId = ?, startDate = ?, endDate = ?, status = ? WHERE id = ?',
      [tenantId, subscriptionPlanId, startDate, endDate, status, id]
    );
    return result.affectedRows;
  }

  // Cancel subscription
  static async cancel(id) {
    const [result] = await pool.query(
      'UPDATE tenantsubscriptions SET status = ? WHERE id = ?',
      ['CANCELLED', id]
    );
    return result.affectedRows;
  }

  // Expire subscription
  static async expire(id) {
    const [result] = await pool.query(
      'UPDATE tenantsubscriptions SET status = ? WHERE id = ?',
      ['EXPIRED', id]
    );
    return result.affectedRows;
  }

  // Delete subscription
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM tenantsubscriptions WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = TenantSubscriptionModel;

