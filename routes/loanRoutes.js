const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Loan:
 *       type: object
 *       required:
 *         - tenantId
 *         - customerId
 *         - principal
 *         - interest
 *         - disbursedAmount
 *         - loanTypeId
 *         - totalInstallment
 *         - startDate
 *         - endDate
 *         - installmentAmount
 *       properties:
 *         id:
 *           type: integer
 *           description: Loan ID
 *         tenantId:
 *           type: integer
 *           description: Tenant ID
 *         customerId:
 *           type: integer
 *           description: Customer ID
 *         principal:
 *           type: number
 *           format: decimal
 *           description: Principal amount
 *           example: 10000.00
 *         interest:
 *           type: number
 *           format: decimal
 *           description: Interest amount
 *           example: 1500.00
 *         disbursedAmount:
 *           type: number
 *           format: decimal
 *           description: Total disbursed amount (principal + interest)
 *           example: 11500.00
 *         loanTypeId:
 *           type: integer
 *           description: Loan type ID
 *         lineTypeId:
 *           type: integer
 *           description: Line type ID
 *         totalInstallment:
 *           type: integer
 *           description: Total number of installments
 *           example: 30
 *         startDate:
 *           type: string
 *           format: date
 *           description: Loan start date
 *         endDate:
 *           type: string
 *           format: date
 *           description: Loan end date
 *         installmentAmount:
 *           type: number
 *           format: decimal
 *           description: Installment amount
 *           example: 383.33
 *         initialDeduction:
 *           type: integer
 *           description: Initial deduction amount
 *           example: 500
 *         isActive:
 *           type: boolean
 *           description: Active status
 *         status:
 *           type: string
 *           enum: [ONGOING, COMPLETED, PENDING, NIL]
 *           description: Loan status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         tenantName:
 *           type: string
 *           description: Tenant name (from join)
 *         customerName:
 *           type: string
 *           description: Customer name (from join)
 *         customerPhone:
 *           type: string
 *           description: Customer phone (from join)
 *         collectionType:
 *           type: string
 *           description: Collection type (from join)
 *         collectionPeriod:
 *           type: integer
 *           description: Collection period (from join)
 *         lineTypeName:
 *           type: string
 *           description: Line type name (from join)
 */

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Loan management API
 */

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Loans]
 *     description: |
 *       Get loans for the user's tenant.
 *       - Admin/Manager/Collectioner: See only their tenant's loans
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of loans
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
 *                     $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanController.getAllLoans.bind(loanController)
);

/**
 * @swagger
 * /api/loans/active:
 *   get:
 *     summary: Get active loans
 *     tags: [Loans]
 *     description: Get only active loans for the user's tenant
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active loans
 *       403:
 *         description: Forbidden
 */
router.get('/active', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanController.getActiveLoans.bind(loanController)
);

/**
 * @swagger
 * /api/loans/status/{status}:
 *   get:
 *     summary: Get loans by status
 *     tags: [Loans]
 *     description: Get loans filtered by status (ONGOING, COMPLETED, PENDING, NIL)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ONGOING, COMPLETED, PENDING, NIL]
 *     responses:
 *       200:
 *         description: List of loans with specified status
 *       403:
 *         description: Forbidden
 */
router.get('/status/:status', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanController.getLoansByStatus.bind(loanController)
);

/**
 * @swagger
 * /api/loans/customer/{customerId}:
 *   get:
 *     summary: Get loans by customer
 *     tags: [Loans]
 *     description: Get all loans for a specific customer
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
 *         description: List of customer's loans
 *       403:
 *         description: Forbidden
 */
router.get('/customer/:customerId', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanController.getLoansByCustomer.bind(loanController)
);

/**
 * @swagger
 * /api/loans/stats:
 *   get:
 *     summary: Get loan statistics
 *     tags: [Loans]
 *     description: Get loan statistics for the user's tenant
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Loan statistics
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
 *                     totalLoans:
 *                       type: integer
 *                     ongoingLoans:
 *                       type: integer
 *                     completedLoans:
 *                       type: integer
 *                     pendingLoans:
 *                       type: integer
 *                     totalPrincipal:
 *                       type: number
 *                     totalInterest:
 *                       type: number
 *                     totalDisbursed:
 *                       type: number
 */
router.get('/stats', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanController.getLoanStats.bind(loanController)
);

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
 *     description: Get a specific loan (tenant-restricted)
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
 *         description: Loan details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Loan'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Loan not found
 */
router.get('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanController.getLoanById.bind(loanController)
);

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Create loan
 *     tags: [Loans]
 *     description: Create a new loan (Admin/Manager only, NOT collectioner)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - principal
 *               - interest
 *               - disbursedAmount
 *               - loanTypeId
 *               - lineTypeId
 *               - startDate
 *               - endDate
 *               - installmentAmount
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 1
 *               principal:
 *                 type: number
 *                 example: 10000.00
 *               interest:
 *                 type: number
 *                 example: 1200.00
 *               loanTypeId:
 *                 type: integer
 *                 example: 1
 *               lineTypeId:
 *                 type: integer
 *                 description: Line type ID
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-12"
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, PENDING, NIL]
 *                 example: "ONGOING"
 *     responses:
 *       201:
 *         description: Loan created
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Collectioner cannot create loans
 */
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanController.createLoan.bind(loanController)
);

/**
 * @swagger
 * /api/loans/{id}:
 *   put:
 *     summary: Update loan
 *     tags: [Loans]
 *     description: Update loan details (Admin/Manager only, NOT collectioner)
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
 *               principal:
 *                 type: number
 *               interest:
 *                 type: number
 *               loanTypeId:
 *                 type: integer
 *                 example: 1
 *               lineTypeId:
 *                 type: integer
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-12"
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, PENDING, NIL]
 *     responses:
 *       200:
 *         description: Loan updated
 *       403:
 *         description: Forbidden - Collectioner cannot edit loans
 *       404:
 *         description: Loan not found
 */
router.put('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanController.updateLoan.bind(loanController)
);

/**
 * @swagger
 * /api/loans/{id}/status:
 *   patch:
 *     summary: Update loan status
 *     tags: [Loans]
 *     description: Update the status of a loan (Admin/Manager only)
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, PENDING, NIL]
 *                 example: "COMPLETED"
 *     responses:
 *       200:
 *         description: Loan status updated
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Loan not found
 */
router.patch('/:id/status', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanController.updateLoanStatus.bind(loanController)
);

/**
 * @swagger
 * /api/loans/{id}/deactivate:
 *   patch:
 *     summary: Deactivate loan
 *     tags: [Loans]
 *     description: Deactivate a loan (Admin/Manager only)
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
 *         description: Loan deactivated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Loan not found
 */
router.patch('/:id/deactivate', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanController.deactivateLoan.bind(loanController)
);

/**
 * @swagger
 * /api/loans/{id}:
 *   delete:
 *     summary: Delete loan
 *     tags: [Loans]
 *     description: Delete loan permanently (Admin/Manager only, NOT collectioner)
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
 *         description: Loan deleted
 *       403:
 *         description: Forbidden - Collectioner cannot delete loans
 *       404:
 *         description: Loan not found
 */
router.delete('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanController.deleteLoan.bind(loanController)
);

module.exports = router;

