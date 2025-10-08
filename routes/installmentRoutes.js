const express = require('express');
const router = express.Router();
const installmentController = require('../controllers/installmentController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Installment:
 *       type: object
 *       required:
 *         - loanId
 *         - tenantId
 *         - date
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: Installment ID
 *         loanId:
 *           type: integer
 *           description: Loan ID
 *         tenantId:
 *           type: integer
 *           description: Tenant ID
 *         date:
 *           type: string
 *           format: date
 *           description: Installment due date
 *           example: "2025-01-08"
 *         amount:
 *           type: number
 *           format: decimal
 *           description: Installment amount
 *           example: 383.33
 *         status:
 *           type: string
 *           enum: [PENDING, PAID, MISSED]
 *           description: Installment status
 *         collectedBy:
 *           type: integer
 *           description: User ID who collected payment
 *         collectedAt:
 *           type: string
 *           format: date-time
 *           description: Payment collection timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         tenantName:
 *           type: string
 *           description: Tenant name
 *         customerName:
 *           type: string
 *           description: Customer name
 *         customerPhone:
 *           type: string
 *           description: Customer phone
 *         collectedByName:
 *           type: string
 *           description: Collector name
 *       example:
 *         id: 1
 *         loanId: 1
 *         tenantId: 1
 *         date: "2025-01-08"
 *         amount: 383.33
 *         status: "PAID"
 *         collectedBy: 1
 *         collectedAt: "2025-01-08T10:00:00"
 *         tenantName: "ABC Company"
 *         customerName: "John Doe"
 */

/**
 * @swagger
 * tags:
 *   name: Installments
 *   description: Installment management API
 */

/**
 * @swagger
 * /api/installments:
 *   get:
 *     summary: Get all installments
 *     tags: [Installments]
 *     description: |
 *       Get installments for the user's tenant.
 *       All roles (admin, manager, collectioner) can access.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of installments
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
 *                     $ref: '#/components/schemas/Installment'
 */
router.get('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getAllInstallments.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/pending:
 *   get:
 *     summary: Get pending installments
 *     tags: [Installments]
 *     description: Get all pending installments for the user's tenant
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending installments
 */
router.get('/pending', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getPendingInstallments.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/today:
 *   get:
 *     summary: Get today's installments
 *     tags: [Installments]
 *     description: Get all installments due today for the user's tenant
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of today's installments
 */
router.get('/today', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getTodayInstallments.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/stats:
 *   get:
 *     summary: Get installment statistics
 *     tags: [Installments]
 *     description: Get installment statistics for the user's tenant
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Installment statistics
 */
router.get('/stats', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getInstallmentStats.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/status/{status}:
 *   get:
 *     summary: Get installments by status
 *     tags: [Installments]
 *     description: Get installments filtered by status (PENDING, PAID, MISSED)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, MISSED]
 *     responses:
 *       200:
 *         description: List of installments
 */
router.get('/status/:status', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getInstallmentsByStatus.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/loan/{loanId}:
 *   get:
 *     summary: Get installments by loan
 *     tags: [Installments]
 *     description: Get all installments for a specific loan
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of loan installments
 */
router.get('/loan/:loanId', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getInstallmentsByLoan.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/customer/{customerId}:
 *   get:
 *     summary: Get installments by customer
 *     tags: [Installments]
 *     description: Get all installments for a specific customer's loans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of customer installments
 */
router.get('/customer/:customerId', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getInstallmentsByCustomer.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/{id}:
 *   get:
 *     summary: Get installment by ID
 *     tags: [Installments]
 *     description: Get a specific installment
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
 *         description: Installment details
 *       404:
 *         description: Installment not found
 */
router.get('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getInstallmentById.bind(installmentController)
);

/**
 * @swagger
 * /api/installments:
 *   post:
 *     summary: Create installment
 *     tags: [Installments]
 *     description: Create a new installment (Admin/Manager/Collectioner can create)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loanId
 *               - date
 *               - amount
 *             properties:
 *               loanId:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-08"
 *               amount:
 *                 type: number
 *                 example: 383.33
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, MISSED]
 *                 example: "PENDING"
 *     responses:
 *       201:
 *         description: Installment created
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 */
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.createInstallment.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/{id}:
 *   put:
 *     summary: Update installment
 *     tags: [Installments]
 *     description: Update installment details (Admin/Manager/Collectioner can edit)
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
 *               date:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, MISSED]
 *     responses:
 *       200:
 *         description: Installment updated
 *       404:
 *         description: Installment not found
 */
router.put('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.updateInstallment.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/{id}/pay:
 *   patch:
 *     summary: Mark installment as paid
 *     tags: [Installments]
 *     description: Mark an installment as paid (Admin/Manager/Collectioner can mark)
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
 *         description: Installment marked as paid
 *       400:
 *         description: Already paid or invalid status
 *       404:
 *         description: Installment not found
 */
router.patch('/:id/pay', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.markAsPaid.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/{id}/missed:
 *   patch:
 *     summary: Mark installment as missed
 *     tags: [Installments]
 *     description: Mark an installment as missed (Admin/Manager/Collectioner can mark)
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
 *         description: Installment marked as missed
 *       404:
 *         description: Installment not found
 */
router.patch('/:id/missed', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.markAsMissed.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/{id}:
 *   delete:
 *     summary: Delete installment
 *     tags: [Installments]
 *     description: Delete installment permanently (Admin/Manager/Collectioner can delete)
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
 *         description: Installment deleted
 *       404:
 *         description: Installment not found
 */
router.delete('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.deleteInstallment.bind(installmentController)
);

module.exports = router;

