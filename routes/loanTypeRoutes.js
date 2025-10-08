const express = require('express');
const router = express.Router();
const loanTypeController = require('../controllers/loanTypeController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoanType:
 *       type: object
 *       required:
 *         - tenantId
 *         - collectionType
 *         - collectionPeriod
 *       properties:
 *         id:
 *           type: integer
 *           description: Loan type ID
 *         tenantId:
 *           type: integer
 *           description: Tenant ID
 *         collectionType:
 *           type: string
 *           description: Type of collection (e.g., Daily, Weekly, Monthly)
 *           example: "Daily"
 *         collectionPeriod:
 *           type: integer
 *           description: Collection period in days
 *           example: 1
 *         isActive:
 *           type: boolean
 *           description: Active status
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Creation date
 *         tenantName:
 *           type: string
 *           description: Tenant name (from join)
 *       example:
 *         id: 1
 *         tenantId: 1
 *         collectionType: "Daily"
 *         collectionPeriod: 1
 *         isActive: true
 *         createdAt: "2025-01-08"
 *         tenantName: "ABC Company"
 */

/**
 * @swagger
 * tags:
 *   name: Loan Types
 *   description: Loan type management API
 */

/**
 * @swagger
 * /api/loan-types:
 *   get:
 *     summary: Get all loan types
 *     tags: [Loan Types]
 *     description: |
 *       Get loan types based on role:
 *       - Admin/Manager/Collectioner: See only their tenant's loan types
 *       - Monsters: See all loan types
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of loan types
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
 *                     $ref: '#/components/schemas/LoanType'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanTypeController.getAllLoanTypes.bind(loanTypeController)
);

/**
 * @swagger
 * /api/loan-types/active:
 *   get:
 *     summary: Get active loan types
 *     tags: [Loan Types]
 *     description: Get only active loan types (tenant-restricted except for monsters)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active loan types
 *       403:
 *         description: Forbidden
 */
router.get('/active', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanTypeController.getActiveLoanTypes.bind(loanTypeController)
);

/**
 * @swagger
 * /api/loan-types/{id}:
 *   get:
 *     summary: Get loan type by ID
 *     tags: [Loan Types]
 *     description: Get a specific loan type (tenant-restricted except for monsters)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Loan type ID
 *     responses:
 *       200:
 *         description: Loan type details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LoanType'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Loan type not found
 */
router.get('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  loanTypeController.getLoanTypeById.bind(loanTypeController)
);

/**
 * @swagger
 * /api/loan-types:
 *   post:
 *     summary: Create loan type
 *     tags: [Loan Types]
 *     description: Create a new loan type (Admin/Manager only, NOT collectioner)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collectionType
 *               - collectionPeriod
 *             properties:
 *               tenantId:
 *                 type: integer
 *                 description: Tenant ID (optional, defaults to user's tenant)
 *               collectionType:
 *                 type: string
 *                 description: Type of collection
 *                 example: "Daily"
 *               collectionPeriod:
 *                 type: integer
 *                 description: Collection period in days
 *                 example: 1
 *     responses:
 *       201:
 *         description: Loan type created
 *       403:
 *         description: Forbidden - Requires admin or manager role (collectioner cannot create)
 */
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanTypeController.createLoanType.bind(loanTypeController)
);

/**
 * @swagger
 * /api/loan-types/{id}:
 *   put:
 *     summary: Update loan type
 *     tags: [Loan Types]
 *     description: Update loan type (Admin/Manager only, NOT collectioner)
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
 *               collectionType:
 *                 type: string
 *               collectionPeriod:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Loan type updated
 *       403:
 *         description: Forbidden - Requires admin or manager role (collectioner cannot edit)
 */
router.put('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanTypeController.updateLoanType.bind(loanTypeController)
);

/**
 * @swagger
 * /api/loan-types/{id}/deactivate:
 *   patch:
 *     summary: Deactivate loan type
 *     tags: [Loan Types]
 *     description: Deactivate loan type (Admin/Manager only)
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
 *         description: Loan type deactivated
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/deactivate', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanTypeController.deactivateLoanType.bind(loanTypeController)
);

/**
 * @swagger
 * /api/loan-types/{id}:
 *   delete:
 *     summary: Delete loan type
 *     tags: [Loan Types]
 *     description: Delete loan type permanently (Admin/Manager only, NOT collectioner)
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
 *         description: Loan type deleted
 *       403:
 *         description: Forbidden - Requires admin or manager role (collectioner cannot delete)
 */
router.delete('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  loanTypeController.deleteLoanType.bind(loanTypeController)
);

module.exports = router;

