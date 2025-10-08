const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the tenant
 *         name:
 *           type: string
 *           description: Tenant name
 *         phoneNumber:
 *           type: string
 *           description: Tenant phone number
 *         isActive:
 *           type: boolean
 *           description: Tenant active status
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the tenant was created
 *       example:
 *         id: 1
 *         name: John Doe
 *         phoneNumber: "+1234567890"
 *         isActive: true
 *         createdAt: "2025-01-08"
 */

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant management API
 */

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Get all tenants (Monsters role only)
 *     tags: [Tenants]
 *     description: Retrieve a list of all tenants from the database. Requires 'monsters' role.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tenants
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
 *                     $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - Insufficient permissions (requires 'monsters' role)
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, checkRoleByName(['monsters']), tenantController.getAllTenants.bind(tenantController));

/**
 * @swagger
 * /api/tenants/active:
 *   get:
 *     summary: Get all active tenants
 *     tags: [Tenants]
 *     description: Retrieve a list of active tenants only
 *     responses:
 *       200:
 *         description: A list of active tenants
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
 *                     $ref: '#/components/schemas/Tenant'
 *       500:
 *         description: Server error
 */
router.get('/active', tenantController.getActiveTenants.bind(tenantController));

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     summary: Get a tenant by ID
 *     tags: [Tenants]
 *     description: Retrieve a single tenant by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The tenant ID
 *     responses:
 *       200:
 *         description: A single tenant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Server error
 */
router.get('/:id', tenantController.getTenantById.bind(tenantController));

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Create a new tenant with admin user
 *     tags: [Tenants]
 *     description: |
 *       Create a new tenant and automatically create an admin user for that tenant.
 *       The admin user will have roleId = 1 (admin role).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - adminName
 *               - adminEmail
 *               - adminPassword
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tenant name
 *                 example: "ABC Corporation"
 *               phoneNumber:
 *                 type: string
 *                 description: Tenant phone number
 *                 example: "+1234567890"
 *               isActive:
 *                 type: boolean
 *                 description: Tenant active status
 *                 example: true
 *               adminName:
 *                 type: string
 *                 description: Admin user's full name
 *                 example: "John Doe"
 *               adminEmail:
 *                 type: string
 *                 description: Admin user's email (must be unique)
 *                 example: "john.doe@abc.com"
 *               adminPassword:
 *                 type: string
 *                 format: password
 *                 description: Admin user's password
 *                 example: "securePassword123"
 *               adminPhone:
 *                 type: string
 *                 description: Admin user's phone number (optional)
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: Tenant and admin user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Tenant and admin user created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tenant:
 *                       $ref: '#/components/schemas/Tenant'
 *                     adminUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         roleId:
 *                           type: integer
 *                         roleName:
 *                           type: string
 *       400:
 *         description: Invalid input or email already exists
 *       500:
 *         description: Server error
 */
router.post('/', tenantController.createTenant.bind(tenantController));

/**
 * @swagger
 * /api/tenants/{id}:
 *   put:
 *     summary: Update a tenant
 *     tags: [Tenants]
 *     description: Update an existing tenant's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The tenant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Server error
 */
router.put('/:id', tenantController.updateTenant.bind(tenantController));

/**
 * @swagger
 * /api/tenants/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a tenant
 *     tags: [Tenants]
 *     description: Soft delete - set tenant's isActive status to false
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The tenant ID
 *     responses:
 *       200:
 *         description: Tenant deactivated successfully
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/deactivate', tenantController.deactivateTenant.bind(tenantController));

/**
 * @swagger
 * /api/tenants/{id}:
 *   delete:
 *     summary: Delete a tenant
 *     tags: [Tenants]
 *     description: Permanently remove a tenant from the database
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The tenant ID
 *     responses:
 *       200:
 *         description: Tenant deleted successfully
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', tenantController.deleteTenant.bind(tenantController));

module.exports = router;
