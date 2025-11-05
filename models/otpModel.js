const { pool } = require('../config/database');

class OtpModel {
  static async invalidateAllForUser(userId) {
    const [result] = await pool.query(
      'UPDATE otp_codes SET isUsed = 1 WHERE userId = ? AND isUsed = 0',
      [userId]
    );
    return result.affectedRows;
  }

  static async createOtp(userId, otpHash, expiresAt, channel = 'sms') {
    const [result] = await pool.query(
      'INSERT INTO otp_codes (userId, otpHash, channel, expiresAt) VALUES (?, ?, ?, ?)',
      [userId, otpHash, channel, expiresAt]
    );
    return result.insertId;
  }

  static async upsertActiveOtpForUser(userId, otpHash, expiresAt, channel = 'sms') {
    await this.invalidateAllForUser(userId);
    return await this.createOtp(userId, otpHash, expiresAt, channel);
  }

  static async findActiveOtpForUser(userId) {
    const [rows] = await pool.query(
      `SELECT id, userId, otpHash, attempts, expiresAt, isUsed, createdAt
       FROM otp_codes
       WHERE userId = ? AND isUsed = 0 AND expiresAt > NOW()
       ORDER BY createdAt DESC
       LIMIT 1`,
      [userId]
    );
    return rows[0];
  }

  static async incrementAttempts(id) {
    const [result] = await pool.query(
      'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  static async markUsed(id) {
    const [result] = await pool.query(
      'UPDATE otp_codes SET isUsed = 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = OtpModel;


