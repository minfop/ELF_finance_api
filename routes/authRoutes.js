const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - password
 *       properties:
 *         phoneNumber:
 *           type: string
 *           format: number
 *           description: User phoneNumber
 *         password:
 *           type: string
 *           format: password
 *           description: User password
 *       example:
 *         phoneNumber: "+919677669080"
 *         password: "Tester@1"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 tenantId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 roleId:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 tenantName:
 *                   type: string
 *                 roleName:
 *                   type: string
 *             tokens:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 tokenType:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token
 *       example:
 *         refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     TokenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *             tokenType:
 *               type: string
 *             expiresIn:
 *               type: string
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *         newPassword:
 *           type: string
 *           format: password
 *       example:
 *         currentPassword: "oldPassword123"
 *         newPassword: "newPassword456"
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     description: Authenticate user with phoneNumber and password. Returns user info and JWT tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials or account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login.bind(authController));

/**
 * @swagger
 * components:
 *   schemas:
 *     OtpRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: User phone number
 *       example:
 *         phoneNumber: "+919677669080"
 *     OtpVerifyRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - otp
 *       properties:
 *         phoneNumber:
 *           type: string
 *         otp:
 *           type: string
 *           description: 6-digit OTP code
 *       example:
 *         phoneNumber: "+919677669080"
 *         otp: "123456"
 */

/**
 * @swagger
 * /api/auth/otp/request:
 *   post:
 *     summary: Request OTP code
 *     tags: [Authentication]
 *     description: Sends a one-time code to the provided phone number if it exists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpRequest'
 *     responses:
 *       200:
 *         description: OTP was sent (or a generic response to avoid enumeration)
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/otp/request', authController.requestOtp.bind(authController));

/**
 * @swagger
 * /api/auth/otp/verify:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Authentication]
 *     description: Verifies the received OTP and returns JWT tokens on success
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpVerifyRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
 */
router.post('/otp/verify', authController.verifyOtp.bind(authController));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     description: Get a new access token using a valid refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @swagger
 * /api/auth/validate:
 *   post:
 *     summary: Validate access token
 *     tags: [Authentication]
 *     description: Validate if the access token is still valid and get user information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     tenantId:
 *                       type: integer
 *                     roleId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     exp:
 *                       type: integer
 *                       description: Token expiration timestamp
 *                     iat:
 *                       type: integer
 *                       description: Token issued at timestamp
 *       401:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/validate', authController.validateToken.bind(authController));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     description: Revoke the refresh token (logout from current device)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Refresh token not found
 *       500:
 *         description: Server error
 */
router.post('/logout', authController.logout.bind(authController));

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Authentication]
 *     description: Revoke all refresh tokens for the user (logout from all devices)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Logged out from 3 device(s)"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/logout-all', authenticateToken, authController.logoutAll.bind(authController));

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Authentication]
 *     description: Change user password (requires authentication). All sessions will be logged out after password change.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid current password or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/change-password', authenticateToken, authController.changePassword.bind(authController));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     description: Get current authenticated user information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     tenantId:
 *                       type: integer
 *                     roleId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Get active sessions
 *     tags: [Authentication]
 *     description: Get all active sessions (refresh tokens) for the current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeSessions:
 *                       type: integer
 *                       description: Number of active sessions
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/sessions', authenticateToken, authController.getUserSessions.bind(authController));

module.exports = router;

