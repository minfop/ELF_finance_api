const { pool } = require('../config/database');

class InstallmentModel {
  // Get all installments
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT i.id, i.loanId, i.tenantId, 
              DATE_FORMAT(i.dueAt, '%Y-%m-%d') as dueAt, 
              i.amount, i.remainAmount, i.cashInHand, i.cashInOnline, i.status,
              i.collectedBy, i.nextDue, i.createdAt,
              t.name as tenantName, l.principal as loanPrincipal,
              c.name as customerName, c.phoneNumber as customerPhone,
              u.name as collectedByName
       FROM installments i
       LEFT JOIN tenants t ON i.tenantId = t.id
       LEFT JOIN loans l ON i.loanId = l.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN users u ON i.collectedBy = u.id
       ORDER BY i.dueAt DESC`
    );
    return rows;
  }

  // Get installment by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT i.id, i.loanId, i.tenantId, 
              DATE_FORMAT(i.dueAt, '%Y-%m-%d') as dueAt, 
              i.amount, i.remainAmount, i.cashInHand, i.cashInOnline, i.status,
              i.collectedBy, i.nextDue, i.createdAt,
              t.name as tenantName, l.principal as loanPrincipal, l.disbursedAmount,
              c.name as customerName, c.phoneNumber as customerPhone, c.email as customerEmail,
              u.name as collectedByName
       FROM installments i
       LEFT JOIN tenants t ON i.tenantId = t.id
       LEFT JOIN loans l ON i.loanId = l.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN users u ON i.collectedBy = u.id
       WHERE i.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get installments by tenant ID
  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT i.id, i.loanId, i.tenantId, 
              DATE_FORMAT(i.dueAt, '%Y-%m-%d') as dueAt, 
              i.amount, i.remainAmount, i.cashInHand, i.cashInOnline, i.status,
              i.collectedBy, i.nextDue, i.createdAt,
              t.name as tenantName, l.principal as loanPrincipal,
              c.name as customerName, c.phoneNumber as customerPhone,
              u.name as collectedByName
       FROM installments i
       LEFT JOIN tenants t ON i.tenantId = t.id
       LEFT JOIN loans l ON i.loanId = l.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN users u ON i.collectedBy = u.id
       WHERE i.tenantId = ?
       ORDER BY i.dueAt DESC`,
      [tenantId]
    );
    return rows;
  }

  // Get installments by loan ID
  static async findByLoanId(loanId) {
    const [rows] = await pool.query(
      `SELECT i.id, i.loanId, i.tenantId, 
              DATE_FORMAT(i.dueAt, '%Y-%m-%d') as dueAt, 
              i.amount, i.remainAmount, i.cashInHand, i.cashInOnline, i.status,
              i.collectedBy, i.nextDue, i.createdAt,
              t.name as tenantName, l.principal as loanPrincipal,
              c.name as customerName, c.phoneNumber as customerPhone,
              u.name as collectedByName
       FROM installments i
       LEFT JOIN tenants t ON i.tenantId = t.id
       LEFT JOIN loans l ON i.loanId = l.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN users u ON i.collectedBy = u.id
       WHERE i.loanId = ?
       ORDER BY i.dueAt ASC`,
      [loanId]
    );
    console.log('rows', rows);
    return rows;
  }

  // Get installments by status
  static async findByStatus(status, tenantId = null) {
    let query = `SELECT i.id, i.loanId, i.tenantId, 
              DATE_FORMAT(i.dueAt, '%Y-%m-%d') as dueAt, 
              i.amount, i.status,
              i.collectedBy, i.createdAt,
              t.name as tenantName, l.principal as loanPrincipal,
              c.name as customerName, c.phoneNumber as customerPhone,
              u.name as collectedByName
       FROM installments i
       LEFT JOIN tenants t ON i.tenantId = t.id
       LEFT JOIN loans l ON i.loanId = l.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN users u ON i.collectedBy = u.id
       WHERE i.status = ?`;
    
    let params = [status];
    
    if (tenantId) {
      query += ' AND i.tenantId = ?';
      params.push(tenantId);
    }
    
    query += ' ORDER BY i.date DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get pending installments
  static async findPending(tenantId = null) {
    return this.findByStatus('PENDING', tenantId);
  }

  // Get today's installments
  static async findToday(tenantId = null) {
    let query = `SELECT i.id, i.loanId, i.tenantId, 
              DATE_FORMAT(i.dueAt, '%Y-%m-%d') as dueAt, 
              i.amount, i.status,
              i.collectedBy, i.createdAt,
              t.name as tenantName, l.principal as loanPrincipal,
              c.name as customerName, c.phoneNumber as customerPhone,
              u.name as collectedByName
       FROM installments i
       LEFT JOIN tenants t ON i.tenantId = t.id
       LEFT JOIN loans l ON i.loanId = l.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN users u ON i.collectedBy = u.id
       WHERE i.dueAt = CURDATE()`;
    
    let params = [];
    
    if (tenantId) {
      query += ' AND i.tenantId = ?';
      params.push(tenantId);
    }
    
    query += ' ORDER BY i.status, c.name';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get installments by loan IDs for last N days (including today)
  static async findByLoanIdsAndDateRange(loanIds, days = 5) {
    if (!loanIds || loanIds.length === 0) {
      return [];
    }

    const placeholders = loanIds.map(() => '?').join(',');
    
    const query = `SELECT i.id, i.loanId, i.tenantId, 
              DATE_FORMAT(i.dueAt, '%Y-%m-%d') as dueAt, 
              i.amount, i.remainAmount, i.cashInHand, i.cashInOnline, i.status,
              i.collectedBy, i.nextDue, i.createdAt,
              t.name as tenantName, l.principal as loanPrincipal,
              c.name as customerName, c.phoneNumber as customerPhone,
              u.name as collectedByName
       FROM installments i
       LEFT JOIN tenants t ON i.tenantId = t.id
       LEFT JOIN loans l ON i.loanId = l.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN users u ON i.collectedBy = u.id
       WHERE i.loanId IN (${placeholders})
       AND i.dueAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       AND i.dueAt <= CURDATE()
       ORDER BY i.dueAt DESC, i.loanId`;
    
    const params = [...loanIds, days - 1]; // days - 1 because we want to include today
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Create new installment
  static async create(installmentData) {
    const { loanId, tenantId, dueAt, amount, remainAmount, cashInHand, cashInOnline, status = 'MISSED', collectedBy, nextDue } = installmentData;
    const [result] = await pool.query(
      'INSERT INTO installments (loanId, tenantId, dueAt, amount, remainAmount, cashInHand, cashInOnline, status, collectedBy, nextDue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [loanId, tenantId, dueAt, amount, remainAmount, cashInHand, cashInOnline, status, collectedBy, nextDue]
    );
    return result.insertId;
  }

  // Update installment
  static async update(id, installmentData) {
    const { loanId, tenantId, dueAt, amount, remainAmount, cashInHand, cashInOnline, status, collectedBy, nextDue } = installmentData;
    const [result] = await pool.query(
      'UPDATE installments SET loanId = ?, tenantId = ?, dueAt = ?, amount = ?, remainAmount = ?, cashInHand = ?, cashInOnline = ?, status = ?, collectedBy = ?, nextDue = ? WHERE id = ?',
      [loanId, tenantId, dueAt, amount, remainAmount, cashInHand, cashInOnline, status, collectedBy, nextDue, id]
    );
    return result.affectedRows;
  }

  // Mark installment as paid
  static async markAsPaid(id, cashInHand, cashInOnline, userId) {
    const [result] = await pool.query(
      'UPDATE installments SET status = ?, cashInHand = ?, cashInOnline = ?, remainAmount = 0, collectedBy = ? WHERE id = ?',
      ['PAID', cashInHand, cashInOnline, userId, id]
    );
    return result.affectedRows;
  }

  // Mark installment as partially paid
  static async markAsPartiallyPaid(id, cashInHand, cashInOnline, remainAmount, userId) {
    const [result] = await pool.query(
      'UPDATE installments SET status = ?, cashInHand = ?, cashInOnline = ?, remainAmount = ?, collectedBy = ? WHERE id = ?',
      ['PARTIALLY', cashInHand, cashInOnline, remainAmount, userId, id]
    );
    return result.affectedRows;
  }

  // Mark installment as missed
  static async markAsMissed(id) {
    const [result] = await pool.query(
      'UPDATE installments SET status = ? WHERE id = ?',
      ['MISSED', id]
    );
    return result.affectedRows;
  }

  // Delete installment
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM installments WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Get installment statistics by tenant
  static async getStatsByTenant(tenantId) {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as totalInstallments,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingInstallments,
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paidInstallments,
        SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missedInstallments,
        SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) as totalCollected,
        SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END) as totalPending,
        SUM(CASE WHEN status = 'MISSED' THEN amount ELSE 0 END) as totalMissed
       FROM installments
       WHERE tenantId = ?`,
      [tenantId]
    );
    return rows[0];
  }

  // Get installments by customer (through loan)
  static async findByCustomerId(customerId, tenantId = null) {
    let query = `SELECT i.id, i.loanId, i.tenantId, 
              DATE_FORMAT(i.date, '%Y-%m-%d') as date, 
              i.amount, i.status,
              i.collectedBy, i.collectedAt, i.createdAt,
              t.name as tenantName, l.principal as loanPrincipal,
              c.name as customerName, c.phoneNumber as customerPhone,
              u.name as collectedByName
       FROM installments i
       LEFT JOIN tenants t ON i.tenantId = t.id
       LEFT JOIN loans l ON i.loanId = l.id
       LEFT JOIN customers c ON l.customerId = c.id
       LEFT JOIN users u ON i.collectedBy = u.id
       WHERE l.customerId = ?`;
    
    let params = [customerId];
    
    if (tenantId) {
      query += ' AND i.tenantId = ?';
      params.push(tenantId);
    }
    
    query += ' ORDER BY i.date DESC';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get total collected amount by date range
  static async getTotalCollectedByDateRange(fromDate, toDate, tenantId = null) {
    let query = `SELECT 
              COALESCE(SUM(cashInHand), 0) as totalCashInHand,
              COALESCE(SUM(cashInOnline), 0) as totalCashInOnline,
              COALESCE(SUM(cashInHand + cashInOnline), 0) as totalCollected
       FROM installments
       WHERE DATE(dueAt) >= ? AND DATE(dueAt) <= ?`;
    
    let params = [fromDate, toDate];
    
    if (tenantId) {
      query += ' AND tenantId = ?';
      params.push(tenantId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0];
  }
}

module.exports = InstallmentModel;

