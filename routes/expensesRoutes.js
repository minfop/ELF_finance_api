const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Expenses
 *     description: Expenses management API
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses (tenant scoped)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get('/',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesController.getAll.bind(expensesController)
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
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
 *         description: Expense details
 *       404:
 *         description: Not found
 */
router.get('/:id',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesController.getById.bind(expensesController)
);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create expense
 *     tags: [Expenses]
 *     description: |
 *       tenantId and userId are taken from token.
 *       Required fields: expenseId, amount, isActive, lineTypeId.
 *       amount must be <= expensesType.maxLimit and user must be in expensesType.accessUsersId.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expenseId
 *               - amount
 *               - isActive
 *               - lineTypeId
 *             properties:
 *               expenseId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 format: float
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               lineTypeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid input or access denied
 */
router.post('/',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesController.create.bind(expensesController)
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
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
 *               expenseId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 format: float
 *               isActive:
 *                 type: boolean
 *               lineTypeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Invalid input
 */
router.put('/:id',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  expensesController.update.bind(expensesController)
);

/**
 * @swagger
 * /api/expenses/{id}/activate:
 *   patch:
 *     summary: Activate expense
 *     tags: [Expenses]
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
router.patch('/:id/activate',
  authenticateToken,
  checkRoleByName(['admin', 'manager']),
  expensesController.activate.bind(expensesController)
);

/**
 * @swagger
 * /api/expenses/{id}/deactivate:
 *   patch:
 *     summary: Deactivate expense
 *     tags: [Expenses]
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
router.patch('/:id/deactivate',
  authenticateToken,
  checkRoleByName(['admin', 'manager']),
  expensesController.deactivate.bind(expensesController)
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
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
router.delete('/:id',
  authenticateToken,
  checkRoleByName(['admin', 'manager']),
  expensesController.delete.bind(expensesController)
);

module.exports = router;


