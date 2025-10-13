const authService = require('../services/authService');

class AuthController {
  /**
   * Login endpoint
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { phoneNumber, password } = req.body;
      const result = await authService.login(phoneNumber, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Refresh token endpoint
   * POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Validate token endpoint
   * POST /api/auth/validate
   */
  async validateToken(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      const result = await authService.validateToken(token);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Logout endpoint
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.logout(refreshToken);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Logout from all devices endpoint
   * POST /api/auth/logout-all
   */
  async logoutAll(req, res) {
    try {
      // User info comes from auth middleware
      const userId = req.user.userId;
      const result = await authService.logoutAll(userId);

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Change password endpoint
   * POST /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  async getCurrentUser(req, res) {
    try {
      // User info comes from auth middleware
      res.json({
        success: true,
        data: {
          userId: req.user.userId,
          tenantId: req.user.tenantId,
          roleId: req.user.roleId,
          name: req.user.name,
          email: req.user.email
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user's active sessions
   * GET /api/auth/sessions
   */
  async getUserSessions(req, res) {
    try {
      const userId = req.user.userId;
      const result = await authService.getUserSessions(userId);

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();

