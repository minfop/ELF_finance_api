const { pool } = require('../config/database');

class RoleModel {
  // Get all roles
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, name, description, isActive, createdAt FROM roles'
    );
    return rows;
  }

  // Get role by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, description, isActive, createdAt FROM roles WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get role by name
  static async findByName(name) {
    const [rows] = await pool.query(
      'SELECT id, name, description, isActive, createdAt FROM roles WHERE name = ?',
      [name]
    );
    return rows[0];
  }

  // Get active roles
  static async findActive() {
    const [rows] = await pool.query(
      'SELECT id, name, description, isActive, createdAt FROM roles WHERE isActive = 1'
    );
    return rows;
  }

  // Create new role
  static async create(roleData) {
    const { name, description, isActive = 1 } = roleData;
    const [result] = await pool.query(
      'INSERT INTO roles (name, description, isActive, createdAt) VALUES (?, ?, ?, CURDATE())',
      [name, description, isActive]
    );
    return result.insertId;
  }

  // Update role
  static async update(id, roleData) {
    const { name, description, isActive } = roleData;
    const [result] = await pool.query(
      'UPDATE roles SET name = ?, description = ?, isActive = ? WHERE id = ?',
      [name, description, isActive, id]
    );
    return result.affectedRows;
  }

  // Delete role (soft delete by setting isActive to 0)
  static async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE roles SET isActive = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Delete role (hard delete)
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM roles WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Check if role name exists
  static async nameExists(name, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM roles WHERE name = ?';
    let params = [name];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }
}

module.exports = RoleModel;

