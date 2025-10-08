const { pool } = require('../config/database');

class AuthModel {
  /**
   * Store refresh token in database
   * @param {Number} userId - User ID
   * @param {String} token - Refresh token
   * @param {Date} expiresAt - Token expiration date
   */
  static async storeRefreshToken(userId, token, expiresAt) {
    const [result] = await pool.query(
      'INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    return result.insertId;
  }

  /**
   * Find refresh token by token string
   * @param {String} token - Refresh token
   */
  static async findRefreshToken(token) {
    const [rows] = await pool.query(
      `SELECT id, userId, token, expiresAt, isRevoked, createdAt 
       FROM refresh_tokens 
       WHERE token = ? AND isRevoked = 0`,
      [token]
    );
    return rows[0];
  }

  /**
   * Find all active refresh tokens for a user
   * @param {Number} userId - User ID
   */
  static async findUserRefreshTokens(userId) {
    const [rows] = await pool.query(
      `SELECT id, userId, token, expiresAt, isRevoked, createdAt 
       FROM refresh_tokens 
       WHERE userId = ? AND isRevoked = 0 AND expiresAt > NOW()
       ORDER BY createdAt DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Revoke a specific refresh token
   * @param {String} token - Refresh token to revoke
   */
  static async revokeRefreshToken(token) {
    const [result] = await pool.query(
      'UPDATE refresh_tokens SET isRevoked = 1 WHERE token = ?',
      [token]
    );
    return result.affectedRows;
  }

  /**
   * Revoke all refresh tokens for a user
   * @param {Number} userId - User ID
   */
  static async revokeAllUserTokens(userId) {
    const [result] = await pool.query(
      'UPDATE refresh_tokens SET isRevoked = 1 WHERE userId = ? AND isRevoked = 0',
      [userId]
    );
    return result.affectedRows;
  }

  /**
   * Delete expired refresh tokens (cleanup)
   */
  static async deleteExpiredTokens() {
    const [result] = await pool.query(
      'DELETE FROM refresh_tokens WHERE expiresAt < NOW() OR isRevoked = 1'
    );
    return result.affectedRows;
  }

  /**
   * Check if refresh token is valid
   * @param {String} token - Refresh token
   */
  static async isTokenValid(token) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM refresh_tokens 
       WHERE token = ? AND isRevoked = 0 AND expiresAt > NOW()`,
      [token]
    );
    return rows[0].count > 0;
  }

  /**
   * Get token count for user (for rate limiting)
   * @param {Number} userId - User ID
   */
  static async getUserTokenCount(userId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM refresh_tokens 
       WHERE userId = ? AND isRevoked = 0 AND expiresAt > NOW()`,
      [userId]
    );
    return rows[0].count;
  }
}

module.exports = AuthModel;

