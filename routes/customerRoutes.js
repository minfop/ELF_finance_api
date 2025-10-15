const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: Customer ID
 *         tenantId:
 *           type: integer
 *           description: Tenant ID (auto-set from token)
 *         name:
 *           type: string
 *           description: Customer name
 *         phoneNumber:
 *           type: string
 *           description: Customer phone number
 *         email:
 *           type: string
 *           description: Customer email
 *         photo:
 *           type: string
 *           description: Customer photo (base64 or URL)
 *         documents:
 *           type: string
 *           description: Customer documents (JSON string or base64)
 *         longitude:
 *           type: number
 *           format: decimal
 *           description: Longitude coordinate (optional)
 *         latitude:
 *           type: number
 *           format: decimal
 *           description: Latitude coordinate (optional)
 *         place:
 *           type: string
 *           description: Place/location name (optional)
 *         identifyNumber:
 *           type: string
 *           description: Identification number (optional)
 *         addidtionalMobile:
 *           type: string
 *           description: Additional mobile number (optional)
 *         address:
 *           type: string
 *           description: Customer address (optional)
 *         referenceById:
 *           type: integer
 *           description: Reference customer ID (optional, foreign key to customers.id)
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
 *         referenceByName:
 *           type: string
 *           description: Reference customer name (from join)
 *       example:
 *         id: 1
 *         tenantId: 1
 *         name: "John Doe"
 *         phoneNumber: "+1234567890"
 *         email: "john@example.com"
 *         photo: "base64_encoded_image_or_url"
 *         documents: "{\"id_card\":\"base64_string\",\"contract\":\"base64_string\"}"
 *         longitude: 80.12345678
 *         latitude: 6.12345678
 *         place: "Colombo"
 *         identifyNumber: "123456789V"
 *         addidtionalMobile: "+9876543210"
 *         address: "123 Main Street, Colombo"
 *         referenceById: 2
 *         isActive: true
 *         createdAt: "2025-01-08"
 *         tenantName: "ABC Company"
 *         referenceByName: "Jane Doe"
 */

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management API
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     description: |
 *       Get customers based on role:
 *       - Admin/Manager/Collectioner: See only their tenant's customers
 *       - Monsters: See all customers
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires admin, manager, collectioner, or monsters role
 */
router.get('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  customerController.getAllCustomers.bind(customerController)
);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     description: Get a specific customer (tenant-restricted except for monsters)
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
 *         description: Customer details
 *       403:
 *         description: Forbidden - Requires admin, manager, collectioner, or monsters role
 *       404:
 *         description: Customer not found
 */
router.get('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'collectioner']), 
  customerController.getCustomerById.bind(customerController)
);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create customer
 *     tags: [Customers]
 *     description: Create a new customer (Admin/Manager only, NOT collectioner)
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer name
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 description: Email address
 *                 example: "john@example.com"
 *               photo:
 *                 type: string
 *                 description: Photo (base64 encoded image or URL)
 *                 example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *               documents:
 *                 type: string
 *                 description: Documents (JSON string with document data)
 *                 example: "{\"id_card\":\"base64_data\",\"contract\":\"base64_data\"}"
 *               longitude:
 *                 type: number
 *                 format: decimal
 *                 description: Longitude coordinate (optional)
 *                 example: 80.12345678
 *               latitude:
 *                 type: number
 *                 format: decimal
 *                 description: Latitude coordinate (optional)
 *                 example: 6.12345678
 *               place:
 *                 type: string
 *                 description: Place/location name (optional)
 *                 example: "Colombo"
 *               identifyNumber:
 *                 type: string
 *                 description: Identification number (optional)
 *                 example: "123456789V"
 *               addidtionalMobile:
 *                 type: string
 *                 description: Additional mobile number (optional)
 *                 example: "+9876543210"
 *               address:
 *                 type: string
 *                 description: Customer address (optional)
 *                 example: "123 Main Street, Colombo"
 *               referenceById:
 *                 type: integer
 *                 description: Reference customer ID (optional, foreign key to customers.id)
 *                 example: 2
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       201:
 *         description: Customer created
 *       403:
 *         description: Forbidden - Requires admin or manager role (collectioner cannot create)
 */
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  customerController.createCustomer.bind(customerController)
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     description: Update customer (Admin/Manager only, NOT collectioner)
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
 *                 description: Customer name
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number
 *               email:
 *                 type: string
 *                 description: Email address
 *               photo:
 *                 type: string
 *                 description: Photo (base64 encoded image or URL)
 *               documents:
 *                 type: string
 *                 description: Documents (JSON string)
 *               longitude:
 *                 type: number
 *                 format: decimal
 *                 description: Longitude coordinate (optional)
 *                 example: 80.12345678
 *               latitude:
 *                 type: number
 *                 format: decimal
 *                 description: Latitude coordinate (optional)
 *                 example: 6.12345678
 *               place:
 *                 type: string
 *                 description: Place/location name (optional)
 *                 example: "Colombo"
 *               identifyNumber:
 *                 type: string
 *                 description: Identification number (optional)
 *                 example: "123456789V"
 *               addidtionalMobile:
 *                 type: string
 *                 description: Additional mobile number (optional)
 *                 example: "+9876543210"
 *               address:
 *                 type: string
 *                 description: Customer address (optional)
 *                 example: "123 Main Street, Colombo"
 *               referenceById:
 *                 type: integer
 *                 description: Reference customer ID (optional, foreign key to customers.id)
 *                 example: 2
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Customer updated
 *       403:
 *         description: Forbidden - Requires admin or manager role (collectioner cannot edit)
 */
router.put('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  customerController.updateCustomer.bind(customerController)
);

/**
 * @swagger
 * /api/customers/{id}/deactivate:
 *   patch:
 *     summary: Deactivate customer
 *     tags: [Customers]
 *     description: Deactivate customer (Admin/Manager only, NOT collectioner)
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
 *         description: Customer deactivated
 *       403:
 *         description: Forbidden - Requires admin or manager role
 */
router.patch('/:id/deactivate', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  customerController.deactivateCustomer.bind(customerController)
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
 *     description: Delete customer permanently (Admin/Manager only, NOT collectioner)
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
 *         description: Customer deleted
 *       403:
 *         description: Forbidden - Requires admin or manager role (collectioner cannot delete)
 */
router.delete('/:id', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  customerController.deleteCustomer.bind(customerController)
);

module.exports = router;

