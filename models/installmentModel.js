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
  static async getTotalCollectedByDateRange(fromDate, toDate, tenantId = null, lineTypeId = null) {
    let query = `SELECT 
              COALESCE(SUM(i.cashInHand), 0) as totalCashInHand,
              COALESCE(SUM(i.cashInOnline), 0) as totalCashInOnline,
              COALESCE(SUM(i.cashInHand + i.cashInOnline), 0) as totalCollected
       FROM installments i
       LEFT JOIN loans l ON i.loanId = l.id
       WHERE DATE(i.dueAt) >= ? AND DATE(i.dueAt) <= ?`;
    
    let params = [fromDate, toDate];
    
    if (tenantId) {
      query += ' AND i.tenantId = ?';
      params.push(tenantId);
    }
    if (lineTypeId) {
      query += ' AND l.lineTypeId = ?';
      params.push(lineTypeId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0];
  }

	// Get daily totals by line type for the last N days (including today)
	static async getDailyTotalsByLineTypeForLastNDays(lineTypeId, tenantId, days = 7) {
		// include today and previous (days-1) days
		const lookbackDays = Math.max(1, days - 1);
		const [rows] = await pool.query(
			`SELECT DATE(i.dueAt) as periodDate,
					COALESCE(SUM(i.cashInHand + i.cashInOnline), 0) as totalCollected
			 FROM installments i
			 JOIN loans l ON i.loanId = l.id
			 WHERE i.tenantId = ?
			   AND l.lineTypeId = ?
			   AND i.dueAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
			   AND i.dueAt <= CURDATE()
			 GROUP BY DATE(i.dueAt)
			 ORDER BY periodDate ASC`,
			[tenantId, lineTypeId, lookbackDays]
		);
		return rows;
	}

	// Get weekly totals by line type for the last N weeks (including current week, ISO week)
	static async getWeeklyTotalsByLineTypeForLastNWeeks(lineTypeId, tenantId, weeks = 7) {
		const [rows] = await pool.query(
			`SELECT YEARWEEK(i.dueAt, 1) as yearWeek,
					MIN(DATE(i.dueAt)) as weekStart,
					MAX(DATE(i.dueAt)) as weekEnd,
					COALESCE(SUM(i.cashInHand + i.cashInOnline), 0) as totalCollected
			 FROM installments i
			 JOIN loans l ON i.loanId = l.id
			 WHERE i.tenantId = ?
			   AND l.lineTypeId = ?
			   AND YEARWEEK(i.dueAt, 1) BETWEEN YEARWEEK(DATE_SUB(CURDATE(), INTERVAL ? WEEK), 1) AND YEARWEEK(CURDATE(), 1)
			 GROUP BY YEARWEEK(i.dueAt, 1)
			 ORDER BY yearWeek ASC`,
			[tenantId, lineTypeId, Math.max(0, weeks - 1)]
		);
		return rows;
	}

	// Get monthly totals by line type for the last N months (including current month)
	static async getMonthlyTotalsByLineTypeForLastNMonths(lineTypeId, tenantId, months = 7) {
		const [rows] = await pool.query(
			`SELECT DATE_FORMAT(i.dueAt, '%Y-%m-01') as monthStart,
					COALESCE(SUM(i.cashInHand + i.cashInOnline), 0) as totalCollected
			 FROM installments i
			 JOIN loans l ON i.loanId = l.id
			 WHERE i.tenantId = ?
			   AND l.lineTypeId = ?
			   AND i.dueAt >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ? MONTH), '%Y-%m-01')
			   AND i.dueAt < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
			 GROUP BY DATE_FORMAT(i.dueAt, '%Y-%m-01')
			 ORDER BY monthStart ASC`,
			[tenantId, lineTypeId, Math.max(0, months - 1)]
		);
		return rows;
	}

	// Get last N installments per loan for a set of loanIds (no date filter)
	static async findLastNByLoanIds(loanIds, n = 5) {
		if (!loanIds || loanIds.length === 0) {
			return [];
		}
		const placeholders = loanIds.map(() => '?').join(',');
		const query = `
			SELECT * FROM (
				SELECT 
					i.id, i.loanId, i.tenantId,
					DATE_FORMAT(i.dueAt, '%Y-%m-%d') as dueAt,
					i.amount, i.remainAmount, i.cashInHand, i.cashInOnline, i.status,
					i.collectedBy, i.nextDue, i.createdAt,
					t.name as tenantName, l.principal as loanPrincipal,
					c.name as customerName, c.phoneNumber as customerPhone,
					u.name as collectedByName,
					ROW_NUMBER() OVER (PARTITION BY i.loanId ORDER BY i.dueAt DESC, i.id DESC) as rn
				FROM installments i
				LEFT JOIN tenants t ON i.tenantId = t.id
				LEFT JOIN loans l ON i.loanId = l.id
				LEFT JOIN customers c ON l.customerId = c.id
				LEFT JOIN users u ON i.collectedBy = u.id
				WHERE i.loanId IN (${placeholders})
			) ranked
			WHERE rn <= ?
			ORDER BY loanId, dueAt DESC, id DESC`;
		const params = [...loanIds, n];
		const [rows] = await pool.query(query, params);
		return rows;
	}
}

module.exports = InstallmentModel;

