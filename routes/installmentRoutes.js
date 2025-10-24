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
 *         - dueAt
 *         - amount
 *         - remainAmount
 *         - cashInHand
 *         - cashInOnline
 *         - status
 *         - collectedBy
 *       properties:
 *         id:
 *           type: integer
 *           description: Installment ID
 *         loanId:
 *           type: integer
 *           description: Loan ID
 *         tenantId:
 *           type: integer
 *           description: Tenant ID (from token)
 *         dueAt:
 *           type: string
 *           format: date
 *           description: Installment due date (system date)
 *           example: "2025-10-15"
 *         amount:
 *           type: number
 *           format: decimal
 *           description: Installment amount
 *           example: 1000.00
 *         remainAmount:
 *           type: number
 *           format: decimal
 *           description: Remaining amount to be paid (auto-calculated)
 *           example: 0.00
 *         cashInHand:
 *           type: number
 *           format: decimal
 *           description: Cash payment received
 *           example: 600.00
 *         cashInOnline:
 *           type: number
 *           format: decimal
 *           description: Online payment received
 *           example: 400.00
 *         status:
 *           type: string
 *           enum: [PAID, MISSED, PARTIALLY]
 *           description: Installment status (auto-calculated)
 *         collectedBy:
 *           type: integer
 *           description: User ID who collected payment (from token)
 *         nextDue:
 *           type: string
 *           format: date-time
 *           description: Next due date (auto-calculated based on loan type)
 *           example: "2025-10-16T00:00:00"
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
 *         tenantId: 7
 *         dueAt: "2025-10-15"
 *         amount: 1000.00
 *         remainAmount: 0.00
 *         cashInHand: 600.00
 *         cashInOnline: 400.00
 *         status: "PAID"
 *         collectedBy: 9
 *         nextDue: "2025-10-16T00:00:00"
 *         createdAt: "2025-10-15T10:00:00"
 *         tenantName: "ABC Company"
 *         customerName: "John Doe"
 *         customerPhone: "+1234567890"
 *         collectedByName: "Jane Smith"
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
 * /api/installments/last7:
 *   get:
 *     summary: Get last 7 period totals by line type
 *     tags: [Installments]
 *     description: |
 *       Returns totals for the last 7 periods for a given lineTypeId.
 *       The period resolution is determined by the line type's loan type collectionType:
 *       - DAILY: last 7 days (including today)
 *       - WEEKLY: last 7 ISO weeks (including current week)
 *       - MONTHLY: last 7 months (including current month)
 *       
 *       Tenant and user are taken from the token. lineTypeId is required as a query parameter.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lineTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Line type ID to filter installments
 *         example: 1
 *     responses:
 *       200:
 *         description: Last 7 period totals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     collectionType:
 *                       type: string
 *                       enum: [DAILY, WEEKLY, MONTHLY]
 *                     periods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             description: Period label (YYYY-MM-DD for daily, weekStart..weekEnd for weekly, YYYY-MM-01 for monthly)
 *                           total:
 *                             type: number
 *                             format: decimal
 *       400:
 *         description: Invalid request or unauthorized for the line type
 */
router.get('/last7', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.getLast7TotalsByLineType.bind(installmentController)
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
 *     description: |
 *       Create a new installment for a loan. 
 *       
 *       **User provides:**
 *       - loanId (required)
 *       - amount (required) 
 *       - cashInHand (optional, defaults to 0)
 *       - cashInOnline (optional, defaults to 0)
 *       
 *       **Auto-generated/calculated:**
 *       - tenantId (from token)
 *       - collectedBy (from token)
 *       - status (PAID/PARTIALLY/MISSED based on payment)
 *       - dueAt (system date)
 *       - remainAmount (amount - cashInHand - cashInOnline)
 *       - nextDue (calculated from loan type)
 *       
 *       **Note:** Only one installment per loan per date. If installment exists for today, it will be updated.
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
 *               - amount
 *             properties:
 *               loanId:
 *                 type: integer
 *                 description: ID of the loan
 *                 example: 1
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 description: Installment amount
 *                 example: 1000.00
 *               cashInHand:
 *                 type: number
 *                 format: decimal
 *                 description: Cash payment (defaults to 0)
 *                 example: 600.00
 *               cashInOnline:
 *                 type: number
 *                 format: decimal
 *                 description: Online payment (defaults to 0)
 *                 example: 400.00
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
 *     description: |
 *       Update installment payment details.
 *       
 *       **User can update:**
 *       - amount (optional)
 *       - cashInHand (optional)
 *       - cashInOnline (optional)
 *       
 *       **Cannot be updated:**
 *       - status (auto-calculated based on payment)
 *       - tenantId (immutable)
 *       - loanId (immutable)
 *       - collectedBy (immutable)
 *       - dueAt (immutable)
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
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 description: Installment amount
 *                 example: 1000.00
 *               cashInHand:
 *                 type: number
 *                 format: decimal
 *                 description: Cash payment
 *                 example: 700.00
 *               cashInOnline:
 *                 type: number
 *                 format: decimal
 *                 description: Online payment
 *                 example: 300.00
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
 *     description: |
 *       Mark an existing installment as fully paid. Updates status to 'PAID'.
 *       
 *       **User provides:**
 *       - cashInHand (optional, defaults to 0)
 *       - cashInOnline (optional, defaults to 0)
 *       
 *       **Auto-updated:**
 *       - status = 'PAID'
 *       - remainAmount = 0
 *       - collectedBy (from token)
 *       - Loan balanceAmount recalculated
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
 *               cashInHand:
 *                 type: number
 *                 format: decimal
 *                 description: Cash payment received
 *                 example: 600.00
 *               cashInOnline:
 *                 type: number
 *                 format: decimal
 *                 description: Online payment received
 *                 example: 400.00
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
 * /api/installments/{id}/partial:
 *   patch:
 *     summary: Mark installment as partially paid
 *     tags: [Installments]
 *     description: |
 *       Mark an existing installment as partially paid. Updates status to 'PARTIALLY'.
 *       
 *       **User provides:**
 *       - cashInHand (optional, defaults to 0)
 *       - cashInOnline (optional, defaults to 0)
 *       
 *       **Auto-updated:**
 *       - status = 'PARTIALLY'
 *       - remainAmount = amount - (cashInHand + cashInOnline)
 *       - collectedBy (from token)
 *       - Loan balanceAmount recalculated
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
 *               cashInHand:
 *                 type: number
 *                 format: decimal
 *                 description: Cash payment received
 *                 example: 300.00
 *               cashInOnline:
 *                 type: number
 *                 format: decimal
 *                 description: Online payment received
 *                 example: 200.00
 *     responses:
 *       200:
 *         description: Installment marked as partially paid
 *       400:
 *         description: Invalid payment amount or already paid
 *       404:
 *         description: Installment not found
 */
router.patch('/:id/partial', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  installmentController.markAsPartiallyPaid.bind(installmentController)
);

/**
 * @swagger
 * /api/installments/missed:
 *   post:
 *     summary: Create installment with MISSED status
 *     tags: [Installments]
 *     description: Create a new installment row for a missed payment. Amount, cashInHand, cashInOnline will be 0, status will be MISSED (Admin/Manager/Collectioner can create)
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
 *             properties:
 *               loanId:
 *                 type: integer
 *                 description: ID of the loan
 *                 example: 1
 *     responses:
 *       201:
 *         description: Installment created with MISSED status
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
 *                   $ref: '#/components/schemas/Installment'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Loan not found
 */
router.post('/missed', 
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

