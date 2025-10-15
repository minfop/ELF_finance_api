const { pool } = require('../config/database');

class CustomerModel {
  // Get all customers
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT c.id, c.tenantId, c.name, c.phoneNumber, c.email, c.photo, c.documents, 
              c.longitude, c.latitude, c.place, c.identifyNumber, c.addidtionalMobile, 
              c.address, c.referenceById, c.isActive, c.createdAt,
              t.name as tenantName,
              ref.name as referenceByName
       FROM customers c
       LEFT JOIN tenants t ON c.tenantId = t.id
       LEFT JOIN customers ref ON c.referenceById = ref.id`
    );
    return rows;
  }

  // Get customer by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.id, c.tenantId, c.name, c.phoneNumber, c.email, c.photo, c.documents, 
              c.longitude, c.latitude, c.place, c.identifyNumber, c.addidtionalMobile, 
              c.address, c.referenceById, c.isActive, c.createdAt,
              t.name as tenantName,
              ref.name as referenceByName
       FROM customers c
       LEFT JOIN tenants t ON c.tenantId = t.id
       LEFT JOIN customers ref ON c.referenceById = ref.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get customers by tenant ID
  static async findByTenantId(tenantId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.tenantId, c.name, c.phoneNumber, c.email, c.photo, c.documents, 
              c.longitude, c.latitude, c.place, c.identifyNumber, c.addidtionalMobile, 
              c.address, c.referenceById, c.isActive, c.createdAt,
              t.name as tenantName,
              ref.name as referenceByName
       FROM customers c
       LEFT JOIN tenants t ON c.tenantId = t.id
       LEFT JOIN customers ref ON c.referenceById = ref.id
       WHERE c.tenantId = ?`,
      [tenantId]
    );
    return rows;
  }

  // Get active customers
  static async findActive() {
    const [rows] = await pool.query(
      `SELECT c.id, c.tenantId, c.name, c.phoneNumber, c.email, c.photo, c.documents, 
              c.longitude, c.latitude, c.place, c.identifyNumber, c.addidtionalMobile, 
              c.address, c.referenceById, c.isActive, c.createdAt,
              t.name as tenantName,
              ref.name as referenceByName
       FROM customers c
       LEFT JOIN tenants t ON c.tenantId = t.id
       LEFT JOIN customers ref ON c.referenceById = ref.id
       WHERE c.isActive = 1`
    );
    return rows;
  }

  // Create new customer
  static async create(customerData) {
    const { 
      tenantId, name, phoneNumber, email, photo, documents, 
      longitude, latitude, place, identifyNumber, addidtionalMobile, 
      address, referenceById, isActive = 1 
    } = customerData;
    
    // Convert isActive to 0 or 1 for BIT type
    const isActiveBit = isActive ? 1 : 0;
    
    const [result] = await pool.query(
      `INSERT INTO customers 
       (tenantId, name, phoneNumber, email, photo, documents, longitude, latitude, place, 
        identifyNumber, addidtionalMobile, address, referenceById, isActive, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [tenantId, name, phoneNumber, email, photo, documents, longitude, latitude, place, 
       identifyNumber, addidtionalMobile, address, referenceById, isActiveBit]
    );
    return result.insertId;
  }

  // Update customer
  static async update(id, customerData) {
    const { 
      tenantId, name, phoneNumber, email, photo, documents, 
      longitude, latitude, place, identifyNumber, addidtionalMobile, 
      address, referenceById, isActive 
    } = customerData;
    
    // Convert isActive to 0 or 1 for BIT type
    const isActiveBit = isActive !== undefined ? (isActive ? 1 : 0) : undefined;
    
    const [result] = await pool.query(
      `UPDATE customers SET 
       tenantId = ?, name = ?, phoneNumber = ?, email = ?, photo = ?, documents = ?, 
       longitude = ?, latitude = ?, place = ?, identifyNumber = ?, addidtionalMobile = ?, 
       address = ?, referenceById = ?, isActive = ? 
       WHERE id = ?`,
      [tenantId, name, phoneNumber, email, photo, documents, longitude, latitude, place, 
       identifyNumber, addidtionalMobile, address, referenceById, isActiveBit, id]
    );
    return result.affectedRows;
  }

  // Soft delete customer
  static async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE customers SET isActive = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Hard delete customer
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM customers WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Get count of new customers by date range
  static async getNewCustomersCountByDateRange(fromDate, toDate, tenantId = null) {
    let query = `SELECT COUNT(*) as newCustomerCount
       FROM customers
       WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ?`;
    
    let params = [fromDate, toDate];
    
    if (tenantId) {
      query += ' AND tenantId = ?';
      params.push(tenantId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0];
  }
}

module.exports = CustomerModel;

