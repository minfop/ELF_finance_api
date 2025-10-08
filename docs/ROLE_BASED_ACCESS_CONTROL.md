# Role-Based Access Control (RBAC)

## Overview

The ELF Finance API implements Role-Based Access Control (RBAC) to restrict access to specific API endpoints based on user roles. This allows you to control who can access which resources.

## Features

- ✅ Role verification by role ID
- ✅ Role verification by role name
- ✅ Case-insensitive role name matching
- ✅ Multiple roles support per endpoint
- ✅ Clear error messages for unauthorized access
- ✅ Role information included in JWT tokens

## Default Roles

The system comes with 5 predefined roles:

| ID | Role Name | Description |
|----|-----------|-------------|
| 1 | admin | System Administrator - Full access to all resources |
| 2 | monsters | Monsters role - Special access permissions |
| 3 | manager | Manager - Can manage tenant resources |
| 4 | user | Regular User - Limited access |
| 5 | viewer | Viewer - Read-only access |

## Database Setup

### Create Roles Table

Run the following SQL script:

```bash
mysql -u root -p elf_finance < database/roles_schema.sql
```

Or manually execute:

```sql
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  isActive BIT DEFAULT 1,
  createdAt DATE DEFAULT (CURDATE())
);

INSERT INTO roles (name, description, isActive) VALUES
  ('admin', 'System Administrator - Full access to all resources', 1),
  ('monsters', 'Monsters role - Special access permissions', 1),
  ('manager', 'Manager - Can manage tenant resources', 1),
  ('user', 'Regular User - Limited access', 1),
  ('viewer', 'Viewer - Read-only access', 1);
```

## JWT Token Payload with Role

When a user logs in, the JWT token includes their role information:

```json
{
  "userId": 1,
  "tenantId": 1,
  "roleId": 2,
  "roleName": "monsters",
  "name": "John Doe",
  "email": "john@example.com",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Middleware Options

### 1. Check Role by ID

Use when you know the specific role IDs:

```javascript
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// Only allow users with roleId 1 or 2
router.get('/admin-only', 
  authenticateToken, 
  checkRole([1, 2]), 
  controller.method
);
```

### 2. Check Role by Name (Recommended)

Use role names for better readability:

```javascript
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

// Only allow users with 'monsters' role
router.get('/monsters-only', 
  authenticateToken, 
  checkRoleByName(['monsters']), 
  controller.method
);

// Allow multiple roles
router.get('/admin-or-manager', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  controller.method
);
```

## Examples

### Example 1: Protect Single Endpoint

```javascript
// routes/tenantRoutes.js
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

// Only 'monsters' role can access getAllTenants
router.get('/', 
  authenticateToken, 
  checkRoleByName(['monsters']), 
  tenantController.getAllTenants
);
```

### Example 2: Multiple Roles

```javascript
// Only admin and manager can create tenants
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  tenantController.createTenant
);
```

### Example 3: Different Permissions for Different Endpoints

```javascript
// Anyone authenticated can view
router.get('/', authenticateToken, controller.getAll);

// Only admin can create
router.post('/', authenticateToken, checkRoleByName(['admin']), controller.create);

// Admin and manager can update
router.put('/:id', authenticateToken, checkRoleByName(['admin', 'manager']), controller.update);

// Only admin can delete
router.delete('/:id', authenticateToken, checkRoleByName(['admin']), controller.delete);
```

### Example 4: Check in Controller

You can also check roles within the controller:

```javascript
async myMethod(req, res) {
  const { roleName, roleId } = req.user;
  
  if (roleName === 'admin') {
    // Admin-specific logic
  } else if (roleName === 'monsters') {
    // Monsters-specific logic
  } else {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    });
  }
}
```

## Testing Role-Based Access

### 1. Create Test Users with Different Roles

```bash
# Create a user with 'monsters' role (roleId: 2)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Monster User",
    "roleId": 2,
    "email": "monster@example.com",
    "password": "password123"
  }'

# Create a user with 'viewer' role (roleId: 5)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Viewer User",
    "roleId": 5,
    "email": "viewer@example.com",
    "password": "password123"
  }'
```

### 2. Login as Monster User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"monster@example.com","password":"password123"}'
```

Save the `accessToken` from the response.

### 3. Access Protected Endpoint (Success)

```bash
# This should work because user has 'monsters' role
curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer MONSTER_ACCESS_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "data": [/* tenant list */]
}
```

### 4. Login as Viewer User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@example.com","password":"password123"}'
```

### 5. Access Protected Endpoint (Failure)

```bash
# This should fail because user has 'viewer' role, not 'monsters'
curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer VIEWER_ACCESS_TOKEN"
```

Expected Response (403 Forbidden):
```json
{
  "success": false,
  "message": "Access denied: This endpoint requires one of the following roles: monsters"
}
```

## Error Responses

### 401 Unauthorized
User is not authenticated (no token or invalid token):
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 403 Forbidden
User is authenticated but doesn't have the required role:
```json
{
  "success": false,
  "message": "Access denied: This endpoint requires one of the following roles: monsters"
}
```

## Best Practices

### 1. Use Role Names Instead of IDs

✅ **Good:**
```javascript
checkRoleByName(['admin', 'manager'])
```

❌ **Avoid:**
```javascript
checkRole([1, 3])  // What are roles 1 and 3?
```

### 2. Document Required Roles in Swagger

```javascript
/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Get all tenants (Monsters role only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       403:
 *         description: Forbidden - Requires 'monsters' role
 */
```

### 3. Layer Your Permissions

```javascript
// Most restrictive first
router.delete('/:id', authenticateToken, checkRoleByName(['admin']), controller.delete);
router.put('/:id', authenticateToken, checkRoleByName(['admin', 'manager']), controller.update);
router.get('/', authenticateToken, controller.getAll);  // Any authenticated user
```

### 4. Create Custom Middleware for Complex Rules

```javascript
// middleware/customAuth.js
const checkOwnerOrAdmin = async (req, res, next) => {
  const { userId, roleName } = req.user;
  const resourceOwnerId = req.params.userId;
  
  // Admin can access any resource, others only their own
  if (roleName === 'admin' || userId === parseInt(resourceOwnerId)) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
};
```

## Role Management API

### Get All Roles

```bash
GET /api/roles
```

### Get Role by ID

```bash
GET /api/roles/:id
```

### Get Role by Name

```bash
GET /api/roles/name/:name
```

### Create Role

```bash
POST /api/roles
{
  "name": "custom-role",
  "description": "Custom role description",
  "isActive": true
}
```

### Update Role

```bash
PUT /api/roles/:id
{
  "name": "updated-name",
  "description": "Updated description"
}
```

## Common Use Cases

### Use Case 1: Admin-Only Actions

```javascript
router.post('/admin/settings', 
  authenticateToken, 
  checkRoleByName(['admin']), 
  adminController.updateSettings
);
```

### Use Case 2: Manager or Higher

```javascript
router.post('/departments', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  departmentController.create
);
```

### Use Case 3: Special Role Access

```javascript
// Only 'monsters' role can access this special endpoint
router.get('/special-data', 
  authenticateToken, 
  checkRoleByName(['monsters']), 
  specialController.getData
);
```

### Use Case 4: Read vs Write Permissions

```javascript
// Anyone can read
router.get('/reports', authenticateToken, reportController.getAll);

// Only specific roles can create
router.post('/reports', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager', 'monsters']), 
  reportController.create
);
```

## Combining with Tenant Access Control

You can combine role-based and tenant-based access control:

```javascript
const { authenticateToken, checkRoleByName, checkTenantAccess } = require('../middleware/authMiddleware');

// User must have 'manager' role AND belong to the tenant
router.get('/tenant/:tenantId/data', 
  authenticateToken, 
  checkRoleByName(['manager', 'admin']),
  checkTenantAccess,
  controller.getTenantData
);
```

## Troubleshooting

### Issue: "roleName is null in token"

**Solution:** Make sure your users table is properly joined with roles table in the `findByEmailWithPassword` method:

```javascript
// models/userModel.js
static async findByEmailWithPassword(email) {
  const [rows] = await pool.query(
    `SELECT u.id, u.tenantId, u.name, u.roleId, u.email, u.password, u.isActive,
            r.name as roleName
     FROM users u
     LEFT JOIN roles r ON u.roleId = r.id
     WHERE u.email = ?`,
    [email]
  );
  return rows[0];
}
```

### Issue: "Access denied" even with correct role

**Check:**
1. Token is valid and not expired
2. Role name matches exactly (case-insensitive)
3. User's roleId matches an actual role in the database
4. Role is active (isActive = 1)

### Issue: Multiple roles not working

**Verify:**
```javascript
// Correct - array of role names
checkRoleByName(['admin', 'manager'])

// Incorrect - single string
checkRoleByName('admin')  // Wrong!
```

## Summary

Role-Based Access Control is now fully implemented with:

✅ Role table with predefined roles
✅ Role verification by ID or name
✅ Multiple roles per endpoint
✅ Clear error messages
✅ Role information in JWT tokens
✅ Complete API for role management
✅ Example: `getAllTenants` protected by 'monsters' role

## Next Steps

1. Run `database/roles_schema.sql` to create roles table
2. Create users with different roles
3. Test role-based access control
4. Customize roles for your application needs
5. Document required roles in your API documentation

For more information:
- [Authentication Guide](./AUTHENTICATION.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [API Documentation](http://localhost:3000/api-docs)

