const { pool } = require('../config/database');

class LoanModel {
  // Get all loans
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT l.id, l.tenantId, l.customerId, l.principal, l.interest, l.disbursedAmount,
              l.loanTypeId, l.lineTypeId, l.totalInstallment, l.startDate, l.endDate, l.installmentAmount,
              l.initialDeduction, l.isActive, l.status, l.createdAt,
              t.name as tenantName, c.name as customerName, c.phoneNumber as customerPhone,
              lt.collectionType, lt.collectionPeriod, lt.interest as loanTypeInterest, 
              lt.initialDeduction as loanTypeInitialDeduction, lt.nilCalculation,
              lnt.name as lineTypeName
       FROM loans l
       LEFT JOIN tenants t ON l.tenantId = t.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN loanType lt ON l.loanTypeId = lt.id
       LEFT JOIN lineType lnt ON l.lineTypeId = lnt.id
       ORDER BY l.createdAt DESC`
    );
    return rows;
  }

  // Get loan by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT l.id, l.tenantId, l.customerId, l.principal, l.interest, l.disbursedAmount,
              l.loanTypeId, l.lineTypeId, l.totalInstallment, l.startDate, l.endDate, l.installmentAmount,
              l.initialDeduction, l.isActive, l.status, l.createdAt,
              t.name as tenantName, c.name as customerName, c.phoneNumber as customerPhone,
              c.email as customerEmail,
              lt.collectionType, lt.collectionPeriod, lt.interest as loanTypeInterest, 
              lt.initialDeduction as loanTypeInitialDeduction, lt.nilCalculation,
              lnt.name as lineTypeName
       FROM loans l
       LEFT JOIN tenants t ON l.tenantId = t.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN loanType lt ON l.loanTypeId = lt.id
       LEFT JOIN lineType lnt ON l.lineTypeId = lnt.id
       WHERE l.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get loans by tenant ID
  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT l.id, l.tenantId, l.customerId, l.principal, l.interest, l.disbursedAmount,
              l.loanTypeId, l.lineTypeId, l.totalInstallment, l.startDate, l.endDate, l.installmentAmount,
              l.initialDeduction, l.isActive, l.status, l.createdAt,
              t.name as tenantName, c.name as customerName, c.phoneNumber as customerPhone,
              lt.collectionType, lt.collectionPeriod, lt.interest as loanTypeInterest, 
              lt.initialDeduction as loanTypeInitialDeduction, lt.nilCalculation,
              lnt.name as lineTypeName
       FROM loans l
       LEFT JOIN tenants t ON l.tenantId = t.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN loanType lt ON l.loanTypeId = lt.id
       LEFT JOIN lineType lnt ON l.lineTypeId = lnt.id
       WHERE l.tenantId = ?
       ORDER BY l.createdAt DESC`,
      [tenantId]
    );
    return rows;
  }

  // Get loans by customer ID
  static async findByCustomerId(customerId) {
    const [rows] = await pool.query(
      `SELECT l.id, l.tenantId, l.customerId, l.principal, l.interest, l.disbursedAmount,
              l.loanTypeId, l.lineTypeId, l.totalInstallment, l.startDate, l.endDate, l.installmentAmount,
              l.initialDeduction, l.isActive, l.status, l.createdAt,
              t.name as tenantName, c.name as customerName, c.phoneNumber as customerPhone,
              lt.collectionType, lt.collectionPeriod, lt.interest as loanTypeInterest, 
              lt.initialDeduction as loanTypeInitialDeduction, lt.nilCalculation,
              lnt.name as lineTypeName
       FROM loans l
       LEFT JOIN tenants t ON l.tenantId = t.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN loanType lt ON l.loanTypeId = lt.id
       LEFT JOIN lineType lnt ON l.lineTypeId = lnt.id
       WHERE l.customerId = ?
       ORDER BY l.createdAt DESC`,
      [customerId]
    );
    return rows;
  }

  // Get loans by status
  static async findByStatus(status, tenantId = null) {
    let query = `SELECT l.id, l.tenantId, l.customerId, l.principal, l.interest, l.disbursedAmount,
              l.loanTypeId, l.lineTypeId, l.totalInstallment, l.startDate, l.endDate, l.installmentAmount,
              l.initialDeduction, l.isActive, l.status, l.createdAt,
              t.name as tenantName, c.name as customerName, c.phoneNumber as customerPhone,
              lt.collectionType, lt.collectionPeriod, lt.interest as loanTypeInterest, 
              lt.initialDeduction as loanTypeInitialDeduction, lt.nilCalculation,
              lnt.name as lineTypeName
       FROM loans l
       LEFT JOIN tenants t ON l.tenantId = t.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN loanType lt ON l.loanTypeId = lt.id
       LEFT JOIN lineType lnt ON l.lineTypeId = lnt.id
       WHERE l.status = ?`;
    
    let params = [status];
    
    if (tenantId) {
      query += ' AND l.tenantId = ?';
      params.push(tenantId);
    }
    
    query += ' ORDER BY l.createdAt DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get active loans
  static async findActive() {
    const [rows] = await pool.query(
      `SELECT l.id, l.tenantId, l.customerId, l.principal, l.interest, l.disbursedAmount,
              l.loanTypeId, l.lineTypeId, l.totalInstallment, l.startDate, l.endDate, l.installmentAmount,
              l.initialDeduction, l.isActive, l.status, l.createdAt,
              t.name as tenantName, c.name as customerName, c.phoneNumber as customerPhone,
              lt.collectionType, lt.collectionPeriod, lt.interest as loanTypeInterest, 
              lt.initialDeduction as loanTypeInitialDeduction, lt.nilCalculation,
              lnt.name as lineTypeName
       FROM loans l
       LEFT JOIN tenants t ON l.tenantId = t.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN loanType lt ON l.loanTypeId = lt.id
       LEFT JOIN lineType lnt ON l.lineTypeId = lnt.id
       WHERE l.isActive = 1
       ORDER BY l.createdAt DESC`
    );
    return rows;
  }

  // Create new loan
  static async create(loanData) {
    const {
      tenantId, customerId, principal, interest, disbursedAmount, loanTypeId, lineTypeId,
      totalInstallment, startDate, endDate, installmentAmount, initialDeduction, isActive = 1, status = 'ONGOING'
    } = loanData;
    
    const [result] = await pool.query(
      `INSERT INTO loans (tenantId, customerId, principal, interest, disbursedAmount, loanTypeId, lineTypeId,
                          totalInstallment, startDate, endDate, installmentAmount, initialDeduction, isActive, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, customerId, principal, interest, disbursedAmount, loanTypeId, lineTypeId,
       totalInstallment, startDate, endDate, installmentAmount, initialDeduction, isActive, status]
    );
    return result.insertId;
  }

  // Update loan
  static async update(id, loanData) {
    const {
      tenantId, customerId, principal, interest, disbursedAmount, loanTypeId, lineTypeId,
      totalInstallment, startDate, endDate, installmentAmount, initialDeduction, isActive, status
    } = loanData;
    
    const [result] = await pool.query(
      `UPDATE loans SET tenantId = ?, customerId = ?, principal = ?, interest = ?,
              disbursedAmount = ?, loanTypeId = ?, lineTypeId = ?, totalInstallment = ?, startDate = ?, endDate = ?,
              installmentAmount = ?, initialDeduction = ?, isActive = ?, status = ?
       WHERE id = ?`,
      [tenantId, customerId, principal, interest, disbursedAmount, loanTypeId, lineTypeId,
       totalInstallment, startDate, endDate, installmentAmount, initialDeduction, isActive, status, id]
    );
    return result.affectedRows;
  }

  // Update loan status
  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE loans SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  }

  // Soft delete loan
  static async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE loans SET isActive = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Hard delete loan
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM loans WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Get loan statistics by tenant
  static async getStatsByTenant(tenantId) {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as totalLoans,
        SUM(CASE WHEN status = 'ONGOING' THEN 1 ELSE 0 END) as ongoingLoans,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedLoans,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingLoans,
        SUM(principal) as totalPrincipal,
        SUM(interest) as totalInterest,
        SUM(disbursedAmount) as totalDisbursed
       FROM loans
       WHERE tenantId = ?`,
      [tenantId]
    );
    return rows[0];
  }
}

module.exports = LoanModel;

