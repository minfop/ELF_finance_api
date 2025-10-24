const { pool } = require('../config/database');

class LineTypeModel {
  // Get all line types
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.name, lt.tenantId, lt.loanTypeId, lt.investmentAmount, lt.isActive, lt.accessUsersId, lt.createdAt,
              t.name as tenantName, ltype.collectionType, ltype.collectionPeriod
       FROM linetype lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       LEFT JOIN loantype ltype ON lt.loanTypeId = ltype.id
       ORDER BY lt.createdAt DESC`
    );
    return formatRowsDates(rows, [], ['createdAt']);
  }

  // Get line type by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.name, lt.tenantId, lt.loanTypeId, lt.investmentAmount, lt.isActive, lt.accessUsersId, lt.createdAt,
              t.name as tenantName, ltype.collectionType, ltype.collectionPeriod
       FROM linetype lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       LEFT JOIN loantype ltype ON lt.loanTypeId = ltype.id
       WHERE lt.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get line types by tenant ID
  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.name, lt.tenantId, lt.loanTypeId, lt.investmentAmount, lt.isActive, lt.accessUsersId, lt.createdAt,
              t.name as tenantName, ltype.collectionType, ltype.collectionPeriod
       FROM linetype lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       LEFT JOIN loantype ltype ON lt.loanTypeId = ltype.id
       WHERE lt.tenantId = ?
       ORDER BY lt.createdAt DESC`,
      [tenantId]
    );
    return rows;
  }

  // Get active line types
  static async findActive() {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.name, lt.tenantId, lt.loanTypeId, lt.investmentAmount, lt.isActive, lt.accessUsersId, lt.createdAt,
              t.name as tenantName, ltype.collectionType, ltype.collectionPeriod
       FROM linetype lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       LEFT JOIN loantype ltype ON lt.loanTypeId = ltype.id
       WHERE lt.isActive = 1
       ORDER BY lt.createdAt DESC`
    );
    return rows;
  }

  // Get active line types by tenant
  static async findActiveByTenant(tenantId) {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.name, lt.tenantId, lt.loanTypeId, lt.investmentAmount, lt.isActive, lt.accessUsersId, lt.createdAt,
              t.name as tenantName, ltype.collectionType, ltype.collectionPeriod
       FROM linetype lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       LEFT JOIN loantype ltype ON lt.loanTypeId = ltype.id
       WHERE lt.isActive = 1 AND lt.tenantId = ?
       ORDER BY lt.createdAt DESC`,
      [tenantId]
    );
    return rows;
  }

  // Get line types by tenant with user access (require membership; null/empty is excluded)
  static async findByTenantAndUserAccess(tenantId, userId) {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.name, lt.tenantId, lt.loanTypeId, lt.investmentAmount, lt.isActive, lt.accessUsersId, lt.createdAt,
              t.name as tenantName, ltype.collectionType, ltype.collectionPeriod
       FROM linetype lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       LEFT JOIN loantype ltype ON lt.loanTypeId = ltype.id
       WHERE lt.tenantId = ?
         AND lt.accessUsersId IS NOT NULL
         AND lt.accessUsersId <> ''
         AND FIND_IN_SET(?, lt.accessUsersId)
       ORDER BY lt.createdAt DESC`,
      [tenantId, userId]
    );
    return rows;
  }

  // Create new line type
  static async create(lineTypeData) {
    const { name, tenantId, loanTypeId, investmentAmount, isActive = 1, accessUsersId = null } = lineTypeData;
    const [result] = await pool.query(
      'INSERT INTO linetype (name, tenantId, loanTypeId, investmentAmount, isActive, accessUsersId) VALUES (?, ?, ?, ?, ?, ?)',
      [name, tenantId, loanTypeId, investmentAmount, isActive, accessUsersId]
    );
    return result.insertId;
  }

  // Update line type
  static async update(id, lineTypeData) {
    const { name, tenantId, loanTypeId, investmentAmount, isActive, accessUsersId } = lineTypeData;
    const [result] = await pool.query(
      'UPDATE linetype SET name = ?, tenantId = ?, loanTypeId = ?, investmentAmount = ?, isActive = ?, accessUsersId = ? WHERE id = ?',
      [name, tenantId, loanTypeId, investmentAmount, isActive, accessUsersId, id]
    );
    return result.affectedRows;
  }

  // Soft delete line type
  static async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE linetype SET isActive = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Hard delete line type
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM linetype WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = LineTypeModel;

