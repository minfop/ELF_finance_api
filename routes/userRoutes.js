const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - tenantId
 *         - name
 *         - roleId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         tenantId:
 *           type: integer
 *           description: The tenant ID (foreign key)
 *         name:
 *           type: string
 *           description: User name
 *         roleId:
 *           type: integer
 *           description: The role ID (foreign key)
 *         phoneNumber:
 *           type: string
 *           description: User phone number
 *         email:
 *           type: string
 *           description: User email address
 *         isActive:
 *           type: boolean
 *           description: User active status
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the user was created
 *         tenantName:
 *           type: string
 *           description: Tenant name (from join)
 *         roleName:
 *           type: string
 *           description: Role name (from join)
 *       example:
 *         id: 1
 *         tenantId: 1
 *         name: John Doe
 *         roleId: 2
 *         phoneNumber: "+1234567890"
 *         email: "john.doe@example.com"
 *         isActive: true
 *         createdAt: "2025-01-08"
 *         tenantName: "ABC Company"
 *         roleName: "Admin"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin/Manager only)
 *     tags: [Users]
 *     description: |
 *       Retrieve users based on role:
 *       - Admin/Manager: See only their tenant's users
 *       - Monsters: See all users
 *       - Collectioner: CANNOT access this endpoint
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - Requires admin, manager, or monsters role (NOT collectioner)
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, checkRoleByName(['admin', 'manager']), userController.getAllUsers.bind(userController));

/**
 * @swagger
 * /api/users/active:
 *   get:
 *     summary: Get all active users
 *     tags: [Users]
 *     description: Retrieve a list of active users only
 *     responses:
 *       200:
 *         description: A list of active users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.get('/active', authenticateToken, checkRoleByName(['admin', 'manager', 'collectioner']), userController.getActiveUsers.bind(userController));

/**
 * @swagger
 * /api/users/my-tenant:
 *   get:
 *     summary: Get users in my tenant
 *     tags: [Users]
 *     description: Retrieve all users belonging to the logged-in user's tenant (from JWT token)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users for the tenant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/my-tenant', authenticateToken, checkRoleByName(['admin', 'manager']), userController.getUsersByTenantId.bind(userController));

/**
 * @swagger
 * /api/users/role/{roleId}:
 *   get:
 *     summary: Get users by role ID
 *     tags: [Users]
 *     description: Retrieve all users with a specific role
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The role ID
 *     responses:
 *       200:
 *         description: A list of users with the role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.get('/role/:roleId', authenticateToken, checkRoleByName(['admin', 'manager', 'collectioner']), userController.getUsersByRoleId.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     description: Retrieve a single user by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', userController.getUserById.bind(userController));

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin/Manager only)
 *     tags: [Users]
 *     description: |
 *       Add a new user to the database.
 *       Collectioner CANNOT create users.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - roleId
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               roleId:
 *                 type: integer
 *                 example: 2
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Collectioner cannot create users
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, checkRoleByName(['admin', 'manager']), userController.createUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (Admin/Manager only)
 *     tags: [Users]
 *     description: Update an existing user's information. Collectioner CANNOT edit users.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               roleId:
 *                 type: integer
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden - Collectioner cannot edit users
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, checkRoleByName(['admin', 'manager']), userController.updateUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     tags: [Users]
 *     description: Soft delete - set user's isActive status to false
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/deactivate', authenticateToken, checkRoleByName(['admin', 'manager']), userController.deactivateUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin/Manager only)
 *     tags: [Users]
 *     description: Permanently remove a user from the database. Collectioner CANNOT delete users.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden - Collectioner cannot delete users
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, checkRoleByName(['admin', 'manager']), userController.deleteUser.bind(userController));

module.exports = router;

