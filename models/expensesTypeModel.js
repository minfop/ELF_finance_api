const { pool } = require('../config/database');

class ExpensesTypeModel {
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT et.id, et.name, et.maxLimit, et.tenantId, et.isActive, et.createdAt, et.accessUsersId,
              t.name as tenantName
       FROM expensestype et
       LEFT JOIN tenants t ON et.tenantId = t.id
       ORDER BY et.createdAt DESC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT et.id, et.name, et.maxLimit, et.tenantId, et.isActive, et.createdAt, et.accessUsersId,
              t.name as tenantName
       FROM expensestype et
       LEFT JOIN tenants t ON et.tenantId = t.id
       WHERE et.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT et.id, et.name, et.maxLimit, et.tenantId, et.isActive, et.createdAt, et.accessUsersId,
              t.name as tenantName
       FROM expensestype et
       LEFT JOIN tenants t ON et.tenantId = t.id
       WHERE et.tenantId = ?
       ORDER BY et.createdAt DESC`,
      [tenantId]
    );
    return rows;
  }

  static async findByTenantAndUserAccess(tenantId, userId) {
    const [rows] = await pool.query(
      `SELECT et.id, et.name, et.maxLimit, et.tenantId, et.isActive, et.createdAt, et.accessUsersId,
              t.name as tenantName
       FROM expensestype et
       LEFT JOIN tenants t ON et.tenantId = t.id
       WHERE et.tenantId = ?
         AND et.accessUsersId IS NOT NULL
         AND et.accessUsersId <> ''
         AND FIND_IN_SET(?, et.accessUsersId)
       ORDER BY et.createdAt DESC`,
      [tenantId, userId]
    );
    return rows;
  }

  // Optional: filter by lineId if needed (placeholder for requested route)
  static async findByTenantUserAndLine(tenantId, userId, lineTypeId) {
    const [rows] = await pool.query(
      `SELECT et.id, et.name, et.maxLimit, et.tenantId, et.isActive, et.createdAt, et.accessUsersId,
              t.name as tenantName
       FROM expensestype et
       LEFT JOIN tenants t ON et.tenantId = t.id
       WHERE et.tenantId = ?
         AND et.accessUsersId IS NOT NULL
         AND et.accessUsersId <> ''
         AND FIND_IN_SET(?, et.accessUsersId)
       ORDER BY et.createdAt DESC`,
      [tenantId, userId]
    );
    return rows;
  }

  static async create(data) {
    const { name, maxLimit = null, tenantId, isActive = 1, accessUsersId = null } = data;
    const [result] = await pool.query(
      'INSERT INTO expensestype (name, maxLimit, tenantId, isActive, accessUsersId) VALUES (?, ?, ?, ?, ?)',
      [name, maxLimit, tenantId, isActive, accessUsersId]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { name, maxLimit = null, tenantId, isActive, accessUsersId } = data;
    const [result] = await pool.query(
      'UPDATE expensestype SET name = ?, maxLimit = ?, tenantId = ?, isActive = ?, accessUsersId = ? WHERE id = ?',
      [name, maxLimit, tenantId, isActive, accessUsersId, id]
    );
    return result.affectedRows;
  }

  static async activate(id) {
    const [result] = await pool.query('UPDATE expensestype SET isActive = 1 WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async deactivate(id) {
    const [result] = await pool.query('UPDATE expensestype SET isActive = 0 WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM expensestype WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = ExpensesTypeModel;


