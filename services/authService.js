const UserModel = require('../models/userModel');
const AuthModel = require('../models/authModel');
const JWTUtils = require('../utils/jwtUtils');

class AuthService {
  /**
   * Login user with email and password
   * @param {String} email - User email
   * @param {String} password - User password
   */
  async login(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Find user by email with password
      const user = await UserModel.findByEmailWithPassword(email);

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        };
      }

      // Verify password
      const isPasswordValid = await UserModel.comparePassword(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId,
        roleName: user.roleName || null,  // roleName comes from the JOIN with roles table
        name: user.name,
        email: user.email
      };

      const tokens = JWTUtils.generateTokenPair(tokenPayload);

      // Store refresh token in database
      const refreshTokenExpiry = JWTUtils.getRefreshTokenExpiration();
      
      //await AuthModel.storeRefreshToken(user.id, tokens.refreshToken, refreshTokenExpiry);

      // Remove password from user object
      delete user.password;

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            tenantId: user.tenantId,
            name: user.name,
            roleId: user.roleId,
            email: user.email,
            tenantName: user.tenantName,
            roleName: user.roleName
          },
          tokens: tokens
        }
      };
    } catch (error) {
      throw new Error(`Error during login: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {String} refreshToken - Refresh token
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return {
          success: false,
          message: 'Refresh token is required'
        };
      }

      // Verify refresh token
      const verification = JWTUtils.verifyRefreshToken(refreshToken);

      if (!verification.valid) {
        return {
          success: false,
          message: 'Invalid or expired refresh token',
          error: verification.error
        };
      }

      // Check if token exists in database and is not revoked
      const storedToken = await AuthModel.findRefreshToken(refreshToken);

      if (!storedToken) {
        return {
          success: false,
          message: 'Refresh token not found or has been revoked'
        };
      }

      // Check if token is expired
      if (new Date(storedToken.expiresAt) < new Date()) {
        return {
          success: false,
          message: 'Refresh token has expired'
        };
      }

      // Get user information
      const user = await UserModel.findById(storedToken.userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      // Generate new access token
      const tokenPayload = {
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId,
        roleName: user.roleName || null,  // roleName comes from the JOIN with roles table
        name: user.name,
        email: user.email
      };

      const accessToken = JWTUtils.generateAccessToken(tokenPayload);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: accessToken,
          tokenType: 'Bearer',
          expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
      };
    } catch (error) {
      throw new Error(`Error refreshing token: ${error.message}`);
    }
  }

  /**
   * Validate access token
   * @param {String} accessToken - Access token
   */
  async validateToken(accessToken) {
    try {
      if (!accessToken) {
        return {
          success: false,
          message: 'Access token is required'
        };
      }

      // Verify token
      const verification = JWTUtils.verifyAccessToken(accessToken);

      if (!verification.valid) {
        return {
          success: false,
          message: 'Invalid or expired token',
          error: verification.error
        };
      }

      // Get user to verify still exists and is active
      const user = await UserModel.findById(verification.decoded.userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      return {
        success: true,
        message: 'Token is valid',
        data: {
          userId: verification.decoded.userId,
          tenantId: verification.decoded.tenantId,
          roleId: verification.decoded.roleId,
          name: verification.decoded.name,
          email: verification.decoded.email,
          exp: verification.decoded.exp,
          iat: verification.decoded.iat
        }
      };
    } catch (error) {
      throw new Error(`Error validating token: ${error.message}`);
    }
  }

  /**
   * Logout user by revoking refresh token
   * @param {String} refreshToken - Refresh token to revoke
   */
  async logout(refreshToken) {
    try {
      if (!refreshToken) {
        return {
          success: false,
          message: 'Refresh token is required'
        };
      }

      // Revoke the refresh token
      const affectedRows = await AuthModel.revokeRefreshToken(refreshToken);

      if (affectedRows === 0) {
        return {
          success: false,
          message: 'Refresh token not found'
        };
      }

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      throw new Error(`Error during logout: ${error.message}`);
    }
  }

  /**
   * Logout from all devices by revoking all user tokens
   * @param {Number} userId - User ID
   */
  async logoutAll(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required'
        };
      }

      // Revoke all user tokens
      const affectedRows = await AuthModel.revokeAllUserTokens(userId);

      return {
        success: true,
        message: `Logged out from ${affectedRows} device(s)`
      };
    } catch (error) {
      throw new Error(`Error during logout all: ${error.message}`);
    }
  }

  /**
   * Change user password
   * @param {Number} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Validate input
      if (!userId || !currentPassword || !newPassword) {
        return {
          success: false,
          message: 'User ID, current password, and new password are required'
        };
      }

      // Get user with password
      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Get user password
      const userWithPassword = await UserModel.findByEmailWithPassword(user.email);

      // Verify current password
      const isPasswordValid = await UserModel.comparePassword(currentPassword, userWithPassword.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Update password
      await UserModel.updatePassword(userId, newPassword);

      // Revoke all existing refresh tokens for security
      await AuthModel.revokeAllUserTokens(userId);

      return {
        success: true,
        message: 'Password changed successfully. Please login again.'
      };
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  /**
   * Get user's active sessions (refresh tokens)
   * @param {Number} userId - User ID
   */
  async getUserSessions(userId) {
    try {
      const tokens = await AuthModel.findUserRefreshTokens(userId);

      return {
        success: true,
        data: {
          activeSessions: tokens.length,
          sessions: tokens.map(token => ({
            id: token.id,
            createdAt: token.createdAt,
            expiresAt: token.expiresAt
          }))
        }
      };
    } catch (error) {
      throw new Error(`Error fetching user sessions: ${error.message}`);
    }
  }
}

module.exports = new AuthService();

