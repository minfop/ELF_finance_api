const { pool } = require('../config/database');

class TenantModel {
  // Get all tenants
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, name, phoneNumber, isActive, createdAt FROM tenants'
    );
    return rows;
  }

  // Get tenant by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, phoneNumber, isActive, createdAt FROM tenants WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get active tenants
  static async findActive() {
    const [rows] = await pool.query(
      'SELECT id, name, phoneNumber, isActive, createdAt FROM tenants WHERE isActive = 1'
    );
    return rows;
  }

  // Create new tenant
  static async create(tenantData) {
    const { name, phoneNumber, isActive = 1 } = tenantData;
    const [result] = await pool.query(
      'INSERT INTO tenants (name, phoneNumber, isActive, createdAt) VALUES (?, ?, ?, CURDATE())',
      [name, phoneNumber, isActive]
    );
    return result.insertId;
  }

  // Update tenant
  static async update(id, tenantData) {
    const { name, phoneNumber, isActive } = tenantData;
    const [result] = await pool.query(
      'UPDATE tenants SET name = ?, phoneNumber = ?, isActive = ? WHERE id = ?',
      [name, phoneNumber, isActive, id]
    );
    return result.affectedRows;
  }

  // Delete tenant (soft delete by setting isActive to 0)
  static async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE tenants SET isActive = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Delete tenant (hard delete)
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM tenants WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = TenantModel;
