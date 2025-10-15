const express = require('express');
const router = express.Router();
const expensesTypeController = require('../controllers/expensesTypeController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     ExpensesType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         maxLimit:
 *           type: number
 *           format: float
 *         tenantId:
 *           type: integer
 *           description: Filled from token
 *         isActive:
 *           type: boolean
 *         accessUsersId:
 *           type: string
 *           description: Comma-separated user IDs who can access
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   - name: Expenses Types
 *     description: Expenses type management API
 */
/**
 * @swagger
 * /api/expenses-types:
 *   get:
 *     summary: Get all expenses types (tenant scoped)
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses types
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
 *                     $ref: '#/components/schemas/ExpensesType'
 */
// Get all (tenant-scoped)
router.get('/',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesTypeController.getAll.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types/{id}:
 *   get:
 *     summary: Get expenses type by ID
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expenses type
 *       404:
 *         description: Not found
 */
// Get by id
router.get('/:id',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesTypeController.getById.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types:
 *   post:
 *     summary: Create expenses type
 *     tags: [Expenses Types]
 *     description: tenantId is taken from token. name, isActive, accessUsersId are required. maxLimit is optional.
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
 *               - isActive
 *               - accessUsersId
 *             properties:
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               accessUsersId:
 *                 type: string
 *                 description: Comma-separated user IDs
 *                 example: "1,2,3"
 *               maxLimit:
 *                 type: number
 *                 format: float
 *                 example: 10000.50
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid input
 */
// Create
router.post('/',
  authenticateToken,
  checkRoleByName(['admin', 'manager']),
  expensesTypeController.create.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types/{id}:
 *   put:
 *     summary: Update expenses type
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               accessUsersId:
 *                 type: string
 *               maxLimit:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Invalid input
 */
// Update
router.put('/:id',
  authenticateToken,
  checkRoleByName(['admin', 'manager']),
  expensesTypeController.update.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types/{id}/activate:
 *   patch:
 *     summary: Activate expenses type
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Activated
 *       404:
 *         description: Not found
 */
// Activate
router.patch('/:id/activate',
  authenticateToken,
  checkRoleByName(['admin', 'manager']),
  expensesTypeController.activate.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types/{id}/deactivate:
 *   patch:
 *     summary: Deactivate expenses type
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deactivated
 *       404:
 *         description: Not found
 */
// Deactivate
router.patch('/:id/deactivate',
  authenticateToken,
  checkRoleByName(['admin', 'manager']),
  expensesTypeController.deactivate.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types/{id}:
 *   delete:
 *     summary: Delete expenses type
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
// Delete
router.delete('/:id',
  authenticateToken,
  checkRoleByName(['admin', 'manager']),
  expensesTypeController.delete.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types/by-user/list:
 *   get:
 *     summary: List expenses types accessible by current user within tenant
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses types
 */
// List by user and tenant
router.get('/by-user/list',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesTypeController.getByUserAndTenant.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types/by-tenant/list:
 *   get:
 *     summary: List expenses types by tenant
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses types
 */
// List by tenant
router.get('/by-tenant/list',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesTypeController.getByTenant.bind(expensesTypeController)
);

/**
 * @swagger
 * /api/expenses-types/by-user-line/{lineTypeId}/list:
 *   get:
 *     summary: List expenses types by user, line and tenant
 *     tags: [Expenses Types]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lineTypeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of expenses types
 */
// List by user, line and tenant
router.get('/by-user-line/:lineTypeId/list',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesTypeController.getByUserTenantAndLine.bind(expensesTypeController)
);

module.exports = router;


