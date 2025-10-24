const { pool } = require('../config/database');

class ExpensesModel {
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT e.id, e.expenseId, e.userId, e.tenantId, e.lineTypeId, e.amount, e.isActive, e.createdAt,
              et.name as expenseName, et.maxLimit, et.accessUsersId,
              u.name as userName, lt.name as lineTypeName
       FROM expenses e
       LEFT JOIN expensestype et ON e.expenseId = et.id
       LEFT JOIN users u ON e.userId = u.id
       LEFT JOIN linetype lt ON e.lineTypeId = lt.id
       ORDER BY e.createdAt DESC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT e.id, e.expenseId, e.userId, e.tenantId, e.lineTypeId, e.amount, e.isActive, e.createdAt,
              et.name as expenseName, et.maxLimit, et.accessUsersId,
              u.name as userName, lt.name as lineTypeName
       FROM expenses e
       LEFT JOIN expensestype et ON e.expenseId = et.id
       LEFT JOIN users u ON e.userId = u.id
       LEFT JOIN linetype lt ON e.lineTypeId = lt.id
       WHERE e.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT e.id, e.expenseId, e.userId, e.tenantId, e.lineTypeId, e.amount, e.isActive, e.createdAt,
              et.name as expenseName, et.maxLimit, et.accessUsersId,
              u.name as userName, lt.name as lineTypeName
       FROM expenses e
       LEFT JOIN expensestype et ON e.expenseId = et.id
       LEFT JOIN users u ON e.userId = u.id
       LEFT JOIN linetype lt ON e.lineTypeId = lt.id
       WHERE e.tenantId = ?
       ORDER BY e.createdAt DESC`,
      [tenantId]
    );
    return rows;
  }

  static async getListByDateRange(fromDate, toDate, tenantId = null, lineTypeId = null) {
    const params = [fromDate, toDate];
    let query = `SELECT e.id, e.expenseId, e.userId, e.tenantId, e.lineTypeId, e.amount, e.isActive, e.createdAt,
                        et.name as expenseName, et.maxLimit, et.accessUsersId,
                        u.name as userName, lt.name as lineTypeName
                 FROM expenses e
                 LEFT JOIN expensestype et ON e.expenseId = et.id
                 LEFT JOIN users u ON e.userId = u.id
                 LEFT JOIN linetype lt ON e.lineTypeId = lt.id
                 WHERE DATE(e.createdAt) >= ? AND DATE(e.createdAt) <= ?`;
    if (tenantId) {
      query += ' AND e.tenantId = ?';
      params.push(tenantId);
    }
    if (lineTypeId) {
      query += ' AND e.lineTypeId = ?';
      params.push(lineTypeId);
    }
    query += ' ORDER BY e.createdAt DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async getTotalByDateRange(fromDate, toDate, tenantId = null, lineTypeId = null) {
    const params = [fromDate, toDate];
    let query = `SELECT COALESCE(SUM(e.amount), 0) as totalExpensesAmount
                 FROM expenses e
                 WHERE DATE(e.createdAt) >= ? AND DATE(e.createdAt) <= ?`;
    if (tenantId) {
      query += ' AND e.tenantId = ?';
      params.push(tenantId);
    }
    if (lineTypeId) {
      query += ' AND e.lineTypeId = ?';
      params.push(lineTypeId);
    }
    const [rows] = await pool.query(query, params);
    return rows[0];
  }

  static async create(data) {
    const { expenseId, userId, tenantId, lineTypeId, amount, isActive = 1 } = data;
    const [result] = await pool.query(
      'INSERT INTO expenses (expenseId, userId, tenantId, lineTypeId, amount, isActive) VALUES (?, ?, ?, ?, ?, ?)',
      [expenseId, userId, tenantId, lineTypeId, amount, isActive]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { expenseId, userId, tenantId, lineTypeId, amount, isActive } = data;
    const [result] = await pool.query(
      'UPDATE expenses SET expenseId = ?, userId = ?, tenantId = ?, lineTypeId = ?, amount = ?, isActive = ? WHERE id = ?',
      [expenseId, userId, tenantId, lineTypeId, amount, isActive, id]
    );
    return result.affectedRows;
  }

  static async deactivate(id) {
    const [result] = await pool.query('UPDATE expenses SET isActive = 0 WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async activate(id) {
    const [result] = await pool.query('UPDATE expenses SET isActive = 1 WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = ExpensesModel;


