const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionPlan:
 *       type: object
 *       required:
 *         - planName
 *         - planType
 *         - duration
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *         planName:
 *           type: string
 *         planType:
 *           type: string
 *         duration:
 *           type: integer
 *           description: Duration in days
 *         price:
 *           type: number
 *         features:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * tags:
 *   name: Subscription Plans
 *   description: Subscription plan management API
 */

// Get all plans - Anyone authenticated can view
router.get('/', authenticateToken, subscriptionPlanController.getAllPlans.bind(subscriptionPlanController));

// Get active plans - Anyone authenticated can view
router.get('/active', authenticateToken, subscriptionPlanController.getActivePlans.bind(subscriptionPlanController));

// Get plan by ID
router.get('/:id', authenticateToken, subscriptionPlanController.getPlanById.bind(subscriptionPlanController));

// Create plan - Admin/Monsters only
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  subscriptionPlanController.createPlan.bind(subscriptionPlanController)
);

// Update plan - Admin/Monsters only
router.put('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  subscriptionPlanController.updatePlan.bind(subscriptionPlanController)
);

// Deactivate plan - Admin/Monsters only
router.patch('/:id/deactivate', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  subscriptionPlanController.deactivatePlan.bind(subscriptionPlanController)
);

// Delete plan - Admin/Monsters only
router.delete('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  subscriptionPlanController.deletePlan.bind(subscriptionPlanController)
);

module.exports = router;

