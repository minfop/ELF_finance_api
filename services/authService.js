const UserModel = require('../models/userModel');
const AuthModel = require('../models/authModel');
const OtpModel = require('../models/otpModel');
const JWTUtils = require('../utils/jwtUtils');
const OtpUtils = require('../utils/otpUtils');
const SmsService = require('../utils/smsService');

class AuthService {
  /**
   * Login user with email and password
   * @param {String} phoneNumber - User email
   * @param {String} password - User password
   */
  async login(phoneNumber, password) {
    try {
      // Validate input
      if (!phoneNumber || !password) {
        return {
          success: false,
          message: 'phoneNumber and password are required'
        };
      }

      // Find user by phoneNumber with password
      const user = await UserModel.findByEmailWithPassword(phoneNumber);

      if (!user) {
        return {
          success: false,
          message: 'Invalid phoneNumber or password'
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
        email: user.email,
        phoneNumber: user.phoneNumber
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
            phoneNumber: user.phoneNumber,
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
   * Request OTP for phoneNumber
   * @param {String} phoneNumber
   */
  async requestOtp(phoneNumber) {
    try {
      if (!phoneNumber) {
        return { success: false, message: 'phoneNumber is required' };
      }

      const user = await UserModel.findByPhoneNumber(phoneNumber);
      if (!user) {
        // Avoid user enumeration
        return { success: true, message: 'If the number exists, an OTP has been sent' };
      }

      if (!user.isActive) {
        return { success: false, message: 'Account is deactivated. Please contact administrator.' };
      }

      const otpLength = parseInt(process.env.OTP_LENGTH || '6', 10);
      const otpTtlMin = parseInt(process.env.OTP_EXP_MINUTES || '5', 10);
      const channel = process.env.OTP_CHANNEL || 'sms';

      const otp = OtpUtils.generateNumericOtp(otpLength);
      const otpHash = await OtpUtils.hashOtp(otp);
      const expiresAt = OtpUtils.getExpiryDate(otpTtlMin);

      await OtpModel.upsertActiveOtpForUser(user.id, otpHash, expiresAt, channel);

      const delivery = process.env.OTP_DELIVERY || 'console';
      if (delivery === 'console') {
        console.log(`[OTP] Sending OTP to ${phoneNumber}: ${otp} (expires in ${otpTtlMin} min)`);
      } else if (delivery === 'sms') {
        try {
          const message = `Your verification code is ${otp}. It expires in ${otpTtlMin} minutes.`;
          await SmsService.sendSms(phoneNumber, message);
        } catch (e) {
          console.error('Failed to send OTP via SMS:', e.message);
          return { success: false, message: `Failed to send OTP: ${e.message}` };
        }
      }

      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      throw new Error(`Error requesting OTP: ${error.message}`);
    }
  }

  /**
   * Verify OTP and login
   * @param {String} phoneNumber
   * @param {String} otp
   */
  async verifyOtp(phoneNumber, otp) {
    try {
      if (!phoneNumber || !otp) {
        return { success: false, message: 'phoneNumber and otp are required' };
      }

      const user = await UserModel.findByPhoneNumber(phoneNumber);
      if (!user) {
        return { success: false, message: 'Invalid OTP or phone number' };
      }

      if (!user.isActive) {
        return { success: false, message: 'Account is deactivated. Please contact administrator.' };
      }

      const record = await OtpModel.findActiveOtpForUser(user.id);
      if (!record) {
        return { success: false, message: 'OTP expired or not found' };
      }

      const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);

      const isValid = await OtpUtils.compareOtp(otp, record.otpHash);
      if (!isValid) {
        await OtpModel.incrementAttempts(record.id);
        if ((record.attempts + 1) >= maxAttempts) {
          await OtpModel.markUsed(record.id);
          return { success: false, message: 'Too many attempts. Request a new OTP.' };
        }
        return { success: false, message: 'Invalid OTP' };
      }

      // Mark OTP as used
      await OtpModel.markUsed(record.id);

      const tokenPayload = {
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId,
        roleName: user.roleName || null,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      };

      const tokens = JWTUtils.generateTokenPair(tokenPayload);

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
            phoneNumber: user.phoneNumber,
            tenantName: user.tenantName,
            roleName: user.roleName
          },
          tokens
        }
      };
    } catch (error) {
      throw new Error(`Error verifying OTP: ${error.message}`);
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

      // // Check if token exists in database and is not revoked
      // const storedToken = await AuthModel.findRefreshToken(refreshToken);

      // if (!storedToken) {
      //   return {
      //     success: false,
      //     message: 'Refresh token not found or has been revoked'
      //   };
      // }

      // Check if token is expired
      if (new Date(verification.decoded.expiresAt) < new Date()) {
        return {
          success: false,
          message: 'Refresh token has expired'
        };
      }

      // Get user information
      const user = await UserModel.findById(verification.decoded.userId);
      console.log('user', user);
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
        email: user.email,
        phoneNumber: user.phoneNumber
      };

      const accessToken = JWTUtils.generateAccessToken(tokenPayload);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            tenantId: user.tenantId,
            name: user.name,
            roleId: user.roleId,
            email: user.email,
            phoneNumber: user.phoneNumber,
            tenantName: user.tenantName,
            roleName: user.roleName
          },
          tokens: {
            accessToken: accessToken,
            tokenType: 'Bearer',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
          }
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
          phoneNumber: verification.decoded.phoneNumber,
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

