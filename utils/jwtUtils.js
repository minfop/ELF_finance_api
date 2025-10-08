const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class JWTUtils {
  /**
   * Generate access token with user information
   * @param {Object} payload - { userId, tenantId, roleId, roleName, name, email }
   * @returns {String} JWT access token
   */
  static generateAccessToken(payload) {
    const tokenPayload = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      roleId: payload.roleId,
      roleName: payload.roleName || null,
      name: payload.name,
      email: payload.email,
      type: 'access'
    };

    return jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'elf-finance-api',
      audience: 'elf-finance-client'
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - { userId }
   * @returns {String} JWT refresh token
   */
  static generateRefreshToken(payload) {
    const tokenPayload = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      roleId: payload.roleId,
      roleName: payload.roleName || null,
      name: payload.name,
      email: payload.email,
      type: 'refresh'
    };

    return jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'elf-finance-api',
      audience: 'elf-finance-client'
    });
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} payload - User information
   * @returns {Object} { accessToken, refreshToken, expiresIn }
   */
  static generateTokenPair(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT_EXPIRES_IN
    };
  }

  /**
   * Verify access token
   * @param {String} token - JWT access token
   * @returns {Object} Decoded token payload
   */
  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'elf-finance-api',
        audience: 'elf-finance-client'
      });

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return {
        valid: true,
        decoded
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Verify refresh token
   * @param {String} token - JWT refresh token
   * @returns {Object} Decoded token payload
   */
  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'elf-finance-api',
        audience: 'elf-finance-client'
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return {
        valid: true,
        decoded
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Decode token without verification (for inspection)
   * @param {String} token - JWT token
   * @returns {Object} Decoded token payload
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration date
   * @param {String} expiresIn - Expiration string (e.g., '1h', '7d')
   * @returns {Date} Expiration date
   */
  static getExpirationDate(expiresIn) {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    
    if (!match) {
      throw new Error('Invalid expiration format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        now.setSeconds(now.getSeconds() + value);
        break;
      case 'm':
        now.setMinutes(now.getMinutes() + value);
        break;
      case 'h':
        now.setHours(now.getHours() + value);
        break;
      case 'd':
        now.setDate(now.getDate() + value);
        break;
    }

    return now;
  }

  /**
   * Get refresh token expiration date
   * @returns {Date} Refresh token expiration date
   */
  static getRefreshTokenExpiration() {
    return this.getExpirationDate(JWT_REFRESH_EXPIRES_IN);
  }
}

module.exports = JWTUtils;

