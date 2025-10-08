const JWTUtils = require('../utils/jwtUtils');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const result = JWTUtils.verifyAccessToken(token);

    if (!result.valid) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        error: result.error
      });
    }

    // Attach user information to request
    req.user = {
      userId: result.decoded.userId,
      tenantId: result.decoded.tenantId,
      roleId: result.decoded.roleId,
      roleName: result.decoded.roleName || null,
      name: result.decoded.name,
      email: result.decoded.email
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user belongs to specific tenant
 */
const checkTenantAccess = (req, res, next) => {
  try {
    const tenantIdFromParams = req.params.tenantId || req.body.tenantId;
    
    if (tenantIdFromParams && parseInt(tenantIdFromParams) !== req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have access to this tenant'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Tenant access check error',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user has specific role (by ID)
 * @param {Array} allowedRoleIds - Array of role IDs that are allowed
 */
const checkRole = (allowedRoleIds) => {
  return (req, res, next) => {
    try {
      if (!allowedRoleIds.includes(req.user.roleId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role check error',
        error: error.message
      });
    }
  };
};

/**
 * Middleware to check if user has specific role (by name)
 * @param {Array} allowedRoleNames - Array of role names that are allowed (e.g., ['admin', 'monsters'])
 */
const checkRoleByName = (allowedRoleNames) => {
  return (req, res, next) => {
    try {
      // Convert role names to lowercase for case-insensitive comparison
      const normalizedAllowedRoles = allowedRoleNames.map(role => role.toLowerCase());
      const userRoleName = req.user.roleName ? req.user.roleName.toLowerCase() : null;

      if (!userRoleName || !normalizedAllowedRoles.includes(userRoleName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: This endpoint requires one of the following roles: ${allowedRoleNames.join(', ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role check error',
        error: error.message
      });
    }
  };
};

/**
 * Optional authentication - doesn't fail if token is missing
 * but attaches user info if token is valid
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const result = JWTUtils.verifyAccessToken(token);

    if (result.valid) {
      req.user = {
        userId: result.decoded.userId,
        tenantId: result.decoded.tenantId,
        roleId: result.decoded.roleId,
        roleName: result.decoded.roleName || null,
        name: result.decoded.name,
        email: result.decoded.email
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  checkTenantAccess,
  checkRole,
  checkRoleByName,
  optionalAuth
};

