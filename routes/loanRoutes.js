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
 *           description: Amount actually disbursed to customer (auto-calculated based on isInterestPreDetection)
 *           example: 9500.00
 *         loanTypeId:
 *           type: integer
 *           description: Loan type ID (auto-populated from lineType)
 *         lineTypeId:
 *           type: integer
 *           description: Line type ID (used to fetch loanTypeId)
 *         totalInstallment:
 *           type: integer
 *           description: Total number of installments (auto-calculated from loanType)
 *           example: 30
 *         startDate:
 *           type: string
 *           format: date
 *           description: Loan start date
 *         endDate:
 *           type: string
 *           format: date
 *           description: Loan end date (auto-calculated from loanType)
 *         installmentAmount:
 *           type: number
 *           format: decimal
 *           description: Installment amount (auto-calculated)
 *           example: 383.33
 *         initialDeduction:
 *           type: integer
 *           description: Initial deduction amount (auto-calculated from loanType)
 *           example: 500
 *         totalAmount:
 *           type: number
 *           format: decimal
 *           description: Total amount to be repaid (auto-calculated)
 *           example: 11500.00
 *         balanceAmount:
 *           type: number
 *           format: decimal
 *           description: Remaining balance to be paid (auto-calculated, updated on installment payments)
 *           example: 11500.00
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
 * /api/loans/linetype/{lineTypeId}:
 *   get:
 *     summary: Get loans by line type with recent installments
 *     tags: [Loans]
 *     description: |
 *       Get all loans for a specific line type with access control.
 *       Each loan includes installments from the last 5 days (including today).
 *       
 *       **Access Control:**
 *       - User's tenantId must match the lineType's tenantId
 *       - User's userId must be in the lineType's accessUsersId list
 *       - If accessUsersId is null/empty, access is denied
 *       
 *       **Automatically filtered by:**
 *       - tenantId (from token)
 *       - userId (from token) - checked against lineType.accessUsersId
 *       
 *       **Included Data:**
 *       - Loan details
 *       - Installments array (last 5 days including today)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lineTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Line type ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of loans with installments for the line type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Loan'
 *                       - type: object
 *                         properties:
 *                           installments:
 *                             type: array
 *                             description: Installments from last 5 days (including today)
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 loanId:
 *                                   type: integer
 *                                 dueAt:
 *                                   type: string
 *                                   format: date
 *                                   example: "2025-10-15"
 *                                 amount:
 *                                   type: number
 *                                   format: decimal
 *                                   example: 1000.00
 *                                 remainAmount:
 *                                   type: number
 *                                   format: decimal
 *                                   example: 0.00
 *                                 cashInHand:
 *                                   type: number
 *                                   format: decimal
 *                                   example: 600.00
 *                                 cashInOnline:
 *                                   type: number
 *                                   format: decimal
 *                                   example: 400.00
 *                                 status:
 *                                   type: string
 *                                   enum: [PAID, MISSED, PARTIALLY]
 *                                   example: "PAID"
 *                                 customerName:
 *                                   type: string
 *                                 collectedByName:
 *                                   type: string
 *       403:
 *         description: |
 *           Access denied - User does not have permission to access this line type.
 *           Possible reasons:
 *           - User's tenantId doesn't match lineType's tenantId
 *           - User's userId is not in lineType's accessUsersId list
 *           - No users are authorized for this line type
 *       404:
 *         description: Line type not found
 */
router.get('/linetype/:lineTypeId', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanController.getLoansByLineType.bind(loanController)
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
 * /api/loans/analytics:
 *   get:
 *     summary: Get analytics data by date range
 *     tags: [Loans]
 *     description: |
 *       Get comprehensive analytics data for a specified date range.
 *       
 *       **Provides:**
 *       - Total disbursed amount
 *       - Total initial deduction amount
 *       - Total interest amount
 *       - New loan count
 *       - New customer count
 *       - Total installment amount collected (cash in hand + cash online)
 *       
 *       **Automatically filtered by:**
 *       - tenantId (from token)
 *       - userId (from token)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2025-10-01"
 *       - in: query
 *         name: toDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2025-10-15"
 *     responses:
 *       200:
 *         description: Analytics data for the date range
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
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         fromDate:
 *                           type: string
 *                           format: date
 *                           example: "2025-10-01"
 *                         toDate:
 *                           type: string
 *                           format: date
 *                           example: "2025-10-15"
 *                     loans:
 *                       type: object
 *                       properties:
 *                         newLoanCount:
 *                           type: integer
 *                           description: Number of loans created in the date range
 *                           example: 15
 *                         totalDisbursedAmount:
 *                           type: number
 *                           format: decimal
 *                           description: Total amount disbursed
 *                           example: 150000.00
 *                         totalInitialDeduction:
 *                           type: number
 *                           format: decimal
 *                           description: Total initial deduction
 *                           example: 7500.00
 *                         totalInterest:
 *                           type: number
 *                           format: decimal
 *                           description: Total interest amount
 *                           example: 22500.00
 *                     customers:
 *                       type: object
 *                       properties:
 *                         newCustomerCount:
 *                           type: integer
 *                           description: Number of customers created in the date range
 *                           example: 8
 *                     installments:
 *                       type: object
 *                       properties:
 *                         totalCashInHand:
 *                           type: number
 *                           format: decimal
 *                           description: Total cash collected in hand
 *                           example: 45000.00
 *                         totalCashInOnline:
 *                           type: number
 *                           format: decimal
 *                           description: Total cash collected online
 *                           example: 30000.00
 *                         totalCollected:
 *                           type: number
 *                           format: decimal
 *                           description: Total amount collected (cash in hand + online)
 *                           example: 75000.00
 *       400:
 *         description: Invalid request (missing dates, invalid format, fromDate after toDate)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires admin, manager, or collectioner role
 */
router.get('/analytics', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanController.getDateRangeAnalytics.bind(loanController)
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
 *     description: |
 *       Create a new loan (Admin/Manager only, NOT collectioner)
 *       
 *       **User provides:**
 *       - customerId (required)
 *       - principal (required)
 *       - lineTypeId (required)
 *       - startDate (required)
 *       - status (optional, defaults to ONGOING)
 *       
 *       **Auto-generated/calculated:**
 *       - tenantId (from token)
 *       - loanTypeId (fetched from lineType table)
 *       - interest (calculated from loanType.interest)
 *       - initialDeduction (calculated from loanType.initialDeduction)
 *       - disbursedAmount (principal - initialDeduction OR principal - interest - initialDeduction, based on isInterestPreDetection)
 *       - totalInstallment (from loanType.collectionPeriod)
 *       - endDate (calculated from startDate + loanType collectionType & period)
 *       - installmentAmount (calculated based on isInterestPreDetection)
 *       - totalAmount (principal OR principal + interest, based on isInterestPreDetection)
 *       - balanceAmount (initially equals totalAmount)
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
 *               - lineTypeId
 *               - startDate
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: Customer ID
 *                 example: 1
 *               principal:
 *                 type: number
 *                 format: decimal
 *                 description: Principal amount
 *                 example: 10000.00
 *               lineTypeId:
 *                 type: integer
 *                 description: Line type ID (loanTypeId will be auto-fetched from lineType)
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Loan start date
 *                 example: "2025-10-12"
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, PENDING, NIL]
 *                 example: "ONGOING"
 *                 description: Loan status (optional, defaults to ONGOING)
 *     responses:
 *       201:
 *         description: Loan created
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
 *                   $ref: '#/components/schemas/Loan'
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
 *     description: |
 *       Update loan details (Admin/Manager only, NOT collectioner)
 *       
 *       **User can update:**
 *       - principal (optional)
 *       - lineTypeId (optional)
 *       - startDate (optional)
 *       - status (optional)
 *       - customerId (optional)
 *       
 *       **Auto-recalculated on update:**
 *       - loanTypeId (if lineTypeId changes)
 *       - interest (from loanType)
 *       - initialDeduction (from loanType)
 *       - disbursedAmount (based on isInterestPreDetection)
 *       - totalInstallment (from loanType)
 *       - endDate (from startDate + loanType)
 *       - installmentAmount (based on isInterestPreDetection)
 *       - totalAmount (based on isInterestPreDetection)
 *       
 *       **Note:** balanceAmount is NOT recalculated on update to preserve payment history
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
 *               customerId:
 *                 type: integer
 *                 description: Customer ID
 *                 example: 1
 *               principal:
 *                 type: number
 *                 format: decimal
 *                 description: Principal amount
 *                 example: 10000.00
 *               lineTypeId:
 *                 type: integer
 *                 description: Line type ID (loanTypeId will be auto-fetched)
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Loan start date
 *                 example: "2025-10-12"
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, PENDING, NIL]
 *                 description: Loan status
 *                 example: "ONGOING"
 *     responses:
 *       200:
 *         description: Loan updated
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
 *                   $ref: '#/components/schemas/Loan'
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

