const express = require('express');
const router = express.Router();
const tenantSubscriptionController = require('../controllers/tenantSubscriptionController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     TenantSubscription:
 *       type: object
 *       required:
 *         - tenantId
 *         - subscriptionPlanId
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: integer
 *         tenantId:
 *           type: integer
 *         subscriptionPlanId:
 *           type: integer
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [ACTIVE, EXPIRED, CANCELLED]
 *         tenantName:
 *           type: string
 *         planName:
 *           type: string
 *         planType:
 *           type: string
 *         duration:
 *           type: integer
 *         price:
 *           type: number
 *         features:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Tenant Subscriptions
 *   description: Tenant subscription management API
 */

/**
 * @swagger
 * /api/tenant-subscriptions:
 *   get:
 *     summary: Get all tenant subscriptions
 *     tags: [Tenant Subscriptions]
 *     description: |
 *       Get subscriptions based on role:
 *       - Monsters: See all tenant subscriptions
 *       - Admin/Manager: See only their tenant's subscriptions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscriptions
 *       403:
 *         description: Forbidden - Requires admin, manager, or monsters role
 */
router.get('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'monsters']), 
  tenantSubscriptionController.getAllSubscriptions.bind(tenantSubscriptionController)
);

/**
 * @swagger
 * /api/tenant-subscriptions/{id}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Tenant Subscriptions]
 *     description: Get a specific subscription (tenant-restricted except for monsters)
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
 *         description: Subscription details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subscription not found
 */
router.get('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'monsters']), 
  tenantSubscriptionController.getSubscriptionById.bind(tenantSubscriptionController)
);

/**
 * @swagger
 * /api/tenant-subscriptions:
 *   post:
 *     summary: Create subscription
 *     tags: [Tenant Subscriptions]
 *     description: Create a new subscription (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - subscriptionPlanId
 *               - startDate
 *               - endDate
 *             properties:
 *               tenantId:
 *                 type: integer
 *               subscriptionPlanId:
 *                 type: integer
 *                 description: Reference to subscription plan ID
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, EXPIRED, CANCELLED]
 *     responses:
 *       201:
 *         description: Subscription created
 *       403:
 *         description: Forbidden - Requires admin or monsters role
 */
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  tenantSubscriptionController.createSubscription.bind(tenantSubscriptionController)
);

/**
 * @swagger
 * /api/tenant-subscriptions/{id}:
 *   put:
 *     summary: Update subscription
 *     tags: [Tenant Subscriptions]
 *     description: Update subscription (Admin only)
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
 *         description: Subscription updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  tenantSubscriptionController.updateSubscription.bind(tenantSubscriptionController)
);

/**
 * @swagger
 * /api/tenant-subscriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel subscription
 *     tags: [Tenant Subscriptions]
 *     description: Cancel subscription (Admin only)
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
 *         description: Subscription cancelled
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/cancel', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  tenantSubscriptionController.cancelSubscription.bind(tenantSubscriptionController)
);

/**
 * @swagger
 * /api/tenant-subscriptions/{id}/expire:
 *   patch:
 *     summary: Expire subscription
 *     tags: [Tenant Subscriptions]
 *     description: Mark subscription as expired (Admin only)
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
 *         description: Subscription expired
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/expire', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  tenantSubscriptionController.expireSubscription.bind(tenantSubscriptionController)
);

/**
 * @swagger
 * /api/tenant-subscriptions/{id}:
 *   delete:
 *     summary: Delete subscription
 *     tags: [Tenant Subscriptions]
 *     description: Delete subscription permanently (Admin only)
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
 *         description: Subscription deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  tenantSubscriptionController.deleteSubscription.bind(tenantSubscriptionController)
);

module.exports = router;

