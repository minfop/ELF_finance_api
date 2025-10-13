const { pool } = require('../config/database');

class LoanTypeModel {
  // Get all loan types
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.tenantId, lt.collectionType, lt.collectionPeriod, lt.interest, 
              lt.initialDeduction, lt.nilCalculation, lt.isActive,
              t.name as tenantName
       FROM loanType lt
       LEFT JOIN tenants t ON lt.tenantId = t.id`
    );
    return rows;
  }

  // Get loan type by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.tenantId, lt.collectionType, lt.collectionPeriod, lt.interest, 
              lt.initialDeduction, lt.nilCalculation, lt.isActive,
              t.name as tenantName
       FROM loanType lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       WHERE lt.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get loan types by tenant ID
  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.tenantId, lt.collectionType, lt.collectionPeriod, lt.interest, 
              lt.initialDeduction, lt.nilCalculation, lt.isActive,
              t.name as tenantName
       FROM loanType lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       WHERE lt.tenantId = ?`,
      [tenantId]
    );
    return rows;
  }

  // Get active loan types
  static async findActive() {
    const [rows] = await pool.query(
      `SELECT lt.id, lt.tenantId, lt.collectionType, lt.collectionPeriod, lt.interest, 
              lt.initialDeduction, lt.nilCalculation, lt.isActive,
              t.name as tenantName
       FROM loanType lt
       LEFT JOIN tenants t ON lt.tenantId = t.id
       WHERE lt.isActive = 1`
    );
    return rows;
  }

  // Create new loan type
  static async create(loanTypeData) {
    const { tenantId, collectionType, collectionPeriod, interest, initialDeduction, nilCalculation, isActive = 1 } = loanTypeData;
    const [result] = await pool.query(
      'INSERT INTO loanType (tenantId, collectionType, collectionPeriod, interest, initialDeduction, nilCalculation, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tenantId, collectionType, collectionPeriod, interest, initialDeduction, nilCalculation, isActive]
    );
    return result.insertId;
  }

  // Update loan type
  static async update(id, loanTypeData) {
    const { tenantId, collectionType, collectionPeriod, interest, initialDeduction, nilCalculation, isActive } = loanTypeData;
    const [result] = await pool.query(
      'UPDATE loanType SET tenantId = ?, collectionType = ?, collectionPeriod = ?, interest = ?, initialDeduction = ?, nilCalculation = ?, isActive = ? WHERE id = ?',
      [tenantId, collectionType, collectionPeriod, interest, initialDeduction, nilCalculation, isActive, id]
    );
    return result.affectedRows;
  }

  // Soft delete loan type
  static async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE loanType SET isActive = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Hard delete loan type
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM loanType WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = LoanTypeModel;

