const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Get all users
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT u.id, u.tenantId, u.name, u.roleId, u.phoneNumber, u.email, u.isActive, u.createdAt,
              t.name as tenantName, r.role as roleName
       FROM users u
       LEFT JOIN tenants t ON u.tenantId = t.id
       LEFT JOIN roles r ON u.roleId = r.id`
    );
    return rows;
  }

  // Get user by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.tenantId, u.name, u.roleId, u.phoneNumber, u.email, u.isActive, u.createdAt,
              t.name as tenantName, r.role as roleName
       FROM users u
       LEFT JOIN tenants t ON u.tenantId = t.id
       LEFT JOIN roles r ON u.roleId = r.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get users by tenant ID
  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT u.id, u.tenantId, u.name, u.roleId, u.phoneNumber, u.email, u.isActive, u.createdAt,
              t.name as tenantName, r.role as roleName
       FROM users u
       LEFT JOIN tenants t ON u.tenantId = t.id
       LEFT JOIN roles r ON u.roleId = r.id
       WHERE u.tenantId = ?`,
      [tenantId]
    );
    return rows;
  }

  // Get users by role ID
  static async findByRoleId(roleId) {
    const [rows] = await pool.query(
      `SELECT u.id, u.tenantId, u.name, u.roleId, u.phoneNumber, u.email, u.isActive, u.createdAt,
              t.name as tenantName, r.role as roleName
       FROM users u
       LEFT JOIN tenants t ON u.tenantId = t.id
       LEFT JOIN roles r ON u.roleId = r.id
       WHERE u.roleId = ?`,
      [roleId]
    );
    return rows;
  }

  // Get active users
  static async findActive() {
    const [rows] = await pool.query(
      `SELECT u.id, u.tenantId, u.name, u.roleId, u.phoneNumber, u.email, u.isActive, u.createdAt,
              t.name as tenantName, r.roles as roleName
       FROM users u
       LEFT JOIN tenants t ON u.tenantId = t.id
       LEFT JOIN roles r ON u.roleId = r.id
       WHERE u.isActive = 1`
    );
    return rows;
  }

  // Check if email exists
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Get user by email with password (for authentication)
  static async findByEmailWithPassword(email) {
    const [rows] = await pool.query(
      `SELECT u.id, u.tenantId, u.name, u.roleId, u.phoneNumber, u.email, u.password, u.isActive, u.createdAt,
              t.name as tenantName, r.role as roleName
       FROM users u
       LEFT JOIN tenants t ON u.tenantId = t.id
       LEFT JOIN roles r ON u.roleId = r.id
       WHERE u.email = ?`,
      [email]
    );
    return rows[0];
  }

  // Hash password
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Compare password with hash
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Create new user
  static async create(userData) {
    const { tenantId, name, roleId, phoneNumber, email, password, isActive = 1 } = userData;
    
    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await this.hashPassword(password);
    }

    const [result] = await pool.query(
      'INSERT INTO users (tenantId, name, roleId, phoneNumber, email, password, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())',
      [tenantId, name, roleId, phoneNumber, email, hashedPassword, isActive]
    );
    return result.insertId;
  }

  // Update user
  static async update(id, userData) {
    const { tenantId, name, roleId, phoneNumber, email, password, isActive } = userData;
    
    // If password is being updated, hash it
    let updateQuery;
    let params;
    
    if (password) {
      const hashedPassword = await this.hashPassword(password);
      updateQuery = 'UPDATE users SET tenantId = ?, name = ?, roleId = ?, phoneNumber = ?, email = ?, password = ?, isActive = ? WHERE id = ?';
      params = [tenantId, name, roleId, phoneNumber, email, hashedPassword, isActive, id];
    } else {
      updateQuery = 'UPDATE users SET tenantId = ?, name = ?, roleId = ?, phoneNumber = ?, email = ?, isActive = ? WHERE id = ?';
      params = [tenantId, name, roleId, phoneNumber, email, isActive, id];
    }
    
    const [result] = await pool.query(updateQuery, params);
    return result.affectedRows;
  }

  // Update user password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await this.hashPassword(newPassword);
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows;
  }

  // Delete user (soft delete by setting isActive to 0)
  static async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE users SET isActive = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Delete user (hard delete)
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = UserModel;

