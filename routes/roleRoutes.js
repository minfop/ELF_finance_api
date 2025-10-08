const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the role
 *         name:
 *           type: string
 *           description: Role name (unique)
 *         description:
 *           type: string
 *           description: Role description
 *         isActive:
 *           type: boolean
 *           description: Role active status
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the role was created
 *       example:
 *         id: 1
 *         name: "admin"
 *         description: "System Administrator"
 *         isActive: true
 *         createdAt: "2025-01-08"
 */

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management API
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     description: Retrieve a list of all roles from the database
 *     responses:
 *       200:
 *         description: A list of roles
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
 *                     $ref: '#/components/schemas/Role'
 *       500:
 *         description: Server error
 */
router.get('/', roleController.getAllRoles.bind(roleController));

/**
 * @swagger
 * /api/roles/active:
 *   get:
 *     summary: Get all active roles
 *     tags: [Roles]
 *     description: Retrieve a list of active roles only
 *     responses:
 *       200:
 *         description: A list of active roles
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
 *                     $ref: '#/components/schemas/Role'
 *       500:
 *         description: Server error
 */
router.get('/active', roleController.getActiveRoles.bind(roleController));

/**
 * @swagger
 * /api/roles/name/{name}:
 *   get:
 *     summary: Get a role by name
 *     tags: [Roles]
 *     description: Retrieve a single role by its name
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The role name
 *     responses:
 *       200:
 *         description: A single role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.get('/name/:name', roleController.getRoleByName.bind(roleController));

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     description: Retrieve a single role by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The role ID
 *     responses:
 *       200:
 *         description: A single role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.get('/:id', roleController.getRoleById.bind(roleController));

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     description: Add a new role to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "manager"
 *               description:
 *                 type: string
 *                 example: "Manager role"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', roleController.createRole.bind(roleController));

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     description: Update an existing role's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.put('/:id', roleController.updateRole.bind(roleController));

/**
 * @swagger
 * /api/roles/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a role
 *     tags: [Roles]
 *     description: Soft delete - set role's isActive status to false
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The role ID
 *     responses:
 *       200:
 *         description: Role deactivated successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/deactivate', roleController.deactivateRole.bind(roleController));

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     description: Permanently remove a role from the database
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', roleController.deleteRole.bind(roleController));

module.exports = router;

