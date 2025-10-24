const express = require('express');
const router = express.Router();
const lineTypeController = require('../controllers/lineTypeController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     LineType:
 *       type: object
 *       required:
 *         - name
 *         - loanTypeId
 *       properties:
 *         id:
 *           type: integer
 *           description: Line type ID
 *         name:
 *           type: string
 *           description: Name of the line type
 *           example: "Line Type A"
 *         tenantId:
 *           type: integer
 *           description: Tenant ID (auto-filled from token)
 *         loanTypeId:
 *           type: integer
 *           description: Loan type ID
 *           example: 1
 *         investmentAmount:
 *           type: number
 *           format: decimal
 *           description: Investment amount allocated to this line type
 *           example: 100000.00
 *         isActive:
 *           type: boolean
 *           description: Active status
 *         accessUsersId:
 *           type: string
 *           description: Comma-separated user IDs with access
 *           example: "1,2,3"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         tenantName:
 *           type: string
 *           description: Tenant name (from join)
 *         collectionType:
 *           type: string
 *           description: Collection type from loan type (from join)
 *         collectionPeriod:
 *           type: integer
 *           description: Collection period from loan type (from join)
 *       example:
 *         id: 1
 *         name: "Line Type A"
 *         tenantId: 1
 *         loanTypeId: 1
 *         investmentAmount: 100000.00
 *         isActive: true
 *         accessUsersId: "1,2,3"
 *         createdAt: "2025-10-12T10:00:00Z"
 *         tenantName: "ABC Company"
 *         collectionType: "Daily"
 *         collectionPeriod: 100
 */

/**
 * @swagger
 * tags:
 *   name: Line Types
 *   description: Line type management API
 */

/**
 * @swagger
 * /api/line-types:
 *   get:
 *     summary: Get all line types
 *     tags: [Line Types]
 *     description: |
 *       Get line types for the user's tenant.
 *       - Admin/Manager/Collectioner: See only their tenant's line types
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of line types
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
 *                     $ref: '#/components/schemas/LineType'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  lineTypeController.getAllLineTypes.bind(lineTypeController)
);

/**
 * @swagger
 * /api/line-types/active:
 *   get:
 *     summary: Get active line types
 *     tags: [Line Types]
 *     description: Get only active line types for the user's tenant
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active line types
 *       403:
 *         description: Forbidden
 */
router.get('/active', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  lineTypeController.getActiveLineTypes.bind(lineTypeController)
);

/**
 * @swagger
 * /api/line-types/by-user:
 *   get:
 *     summary: Get line types accessible by the current user within their tenant
 *     tags: [Line Types]
 *     description: Returns line types only when accessUsersId contains current userId. If accessUsersId is null/empty, the line type is NOT returned.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of accessible line types
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
 *                     $ref: '#/components/schemas/LineType'
 *       401:
 *         description: Unauthorized
 */
router.get('/by-user',
  authenticateToken,
  checkRoleByName(['admin', 'manager', 'collectioner']),
  lineTypeController.getLineTypesByUser.bind(lineTypeController)
);

/**
 * @swagger
 * /api/line-types/{id}:
 *   get:
 *     summary: Get line type by ID
 *     tags: [Line Types]
 *     description: Get a specific line type (tenant-restricted)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Line type ID
 *     responses:
 *       200:
 *         description: Line type details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LineType'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Line type not found
 */
router.get('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  lineTypeController.getLineTypeById.bind(lineTypeController)
);

/**
 * @swagger
 * /api/line-types:
 *   post:
 *     summary: Create line type
 *     tags: [Line Types]
 *     description: Create a new line type (Admin/Manager only, NOT collectioner)
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
 *               - loanTypeId
 *               - investmentAmount
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the line type
 *                 example: "Line Type A"
 *               loanTypeId:
 *                 type: integer
 *                 description: Loan type ID
 *                 example: 1
 *               investmentAmount:
 *                 type: number
 *                 format: decimal
 *                 description: Investment amount allocated to this line type
 *                 example: 100000.00
 *               isActive:
 *                 type: boolean
 *                 description: Active status (default true)
 *                 example: true
 *               accessUsersId:
 *                 type: string
 *                 description: Comma-separated user IDs with access
 *                 example: "1,2,3"
 *     responses:
 *       201:
 *         description: Line type created
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Collectioner cannot create
 */
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  lineTypeController.createLineType.bind(lineTypeController)
);

/**
 * @swagger
 * /api/line-types/{id}:
 *   put:
 *     summary: Update line type
 *     tags: [Line Types]
 *     description: Update line type details (Admin/Manager only, NOT collectioner)
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
 *               loanTypeId:
 *                 type: integer
 *               investmentAmount:
 *                 type: number
 *                 format: decimal
 *               isActive:
 *                 type: boolean
 *               accessUsersId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Line type updated
 *       403:
 *         description: Forbidden - Collectioner cannot edit
 *       404:
 *         description: Line type not found
 */
router.put('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  lineTypeController.updateLineType.bind(lineTypeController)
);

/**
 * @swagger
 * /api/line-types/{id}/deactivate:
 *   patch:
 *     summary: Deactivate line type
 *     tags: [Line Types]
 *     description: Deactivate line type (Admin/Manager only)
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
 *         description: Line type deactivated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Line type not found
 */
router.patch('/:id/deactivate', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  lineTypeController.deactivateLineType.bind(lineTypeController)
);

/**
 * @swagger
 * /api/line-types/{id}:
 *   delete:
 *     summary: Delete line type
 *     tags: [Line Types]
 *     description: Delete line type permanently (Admin/Manager only, NOT collectioner)
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
 *         description: Line type deleted
 *       403:
 *         description: Forbidden - Collectioner cannot delete
 *       404:
 *         description: Line type not found
 */
router.delete('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  lineTypeController.deleteLineType.bind(lineTypeController)
);

module.exports = router;

