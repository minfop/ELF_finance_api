# RBAC Quick Start Guide

## 🚀 Setup in 5 Steps

### Step 1: Create Roles Table

```bash
mysql -u root -p elf_finance < database/roles_schema.sql
```

This creates the roles table with 5 default roles:
- `admin` - Full access
- `monsters` - Special permissions ⭐
- `manager` - Management access
- `user` - Regular user
- `viewer` - Read-only

### Step 2: Create Test Users

```bash
# Create a user with 'monsters' role (roleId: 2)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Monster User",
    "roleId": 2,
    "email": "monster@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890"
  }'

# Create a user with 'viewer' role (roleId: 5)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Viewer User",
    "roleId": 5,
    "email": "viewer@example.com",
    "password": "password123",
    "phoneNumber": "+0987654321"
  }'
```

### Step 3: Login and Get Token

```bash
# Login as monster user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"monster@example.com","password":"password123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "tenantId": 1,
      "name": "Monster User",
      "roleId": 2,
      "roleName": "monsters"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "...",
      "tokenType": "Bearer"
    }
  }
}
```

### Step 4: Test Protected Endpoint

```bash
# SUCCESS - Monster user can access getAllTenants
curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer YOUR_MONSTER_ACCESS_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [/* tenant list */]
}
```

### Step 5: Test Unauthorized Access

```bash
# Login as viewer
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@example.com","password":"password123"}'

# FAILURE - Viewer cannot access getAllTenants
curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer YOUR_VIEWER_ACCESS_TOKEN"
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied: This endpoint requires one of the following roles: monsters"
}
```

## 🛡️ Protecting Your Routes

### Single Role Protection

```javascript
const { authenticateToken, checkRoleByName } = require('../middleware/authMiddleware');

// Only 'monsters' role
router.get('/special', 
  authenticateToken, 
  checkRoleByName(['monsters']), 
  controller.method
);
```

### Multiple Roles Protection

```javascript
// 'admin' or 'manager' roles
router.post('/create', 
  authenticateToken, 
  checkRoleByName(['admin', 'manager']), 
  controller.create
);
```

### Example: Different Permissions

```javascript
// Anyone authenticated can view
router.get('/', authenticateToken, controller.getAll);

// Only specific roles can modify
router.post('/', 
  authenticateToken, 
  checkRoleByName(['admin', 'monsters']), 
  controller.create
);

router.put('/:id', 
  authenticateToken, 
  checkRoleByName(['admin']), 
  controller.update
);

router.delete('/:id', 
  authenticateToken, 
  checkRoleByName(['admin']), 
  controller.delete
);
```

## 📋 Current Implementation

The `getAllTenants` endpoint is now protected:

```javascript
// routes/tenantRoutes.js
router.get('/', 
  authenticateToken,                    // Must be logged in
  checkRoleByName(['monsters']),        // Must have 'monsters' role
  tenantController.getAllTenants
);
```

## 🔍 Checking User Role in Code

Access the user's role in your controller:

```javascript
async myMethod(req, res) {
  const { userId, roleId, roleName, tenantId, name, email } = req.user;
  
  console.log(`User ${name} (${roleName}) is accessing this endpoint`);
  
  // Custom logic based on role
  if (roleName === 'admin') {
    // Admin-specific logic
  } else if (roleName === 'monsters') {
    // Monsters-specific logic
  }
}
```

## 🎯 Common Patterns

### Pattern 1: Admin Only

```javascript
checkRoleByName(['admin'])
```

### Pattern 2: Admin or Manager

```javascript
checkRoleByName(['admin', 'manager'])
```

### Pattern 3: Special Role

```javascript
checkRoleByName(['monsters'])
```

### Pattern 4: Everyone Except Viewer

```javascript
checkRoleByName(['admin', 'manager', 'user', 'monsters'])
```

## ⚙️ Role Management

### View All Roles

```bash
GET http://localhost:3000/api/roles
```

### Get Role by Name

```bash
GET http://localhost:3000/api/roles/name/monsters
```

### Create Custom Role

```bash
POST http://localhost:3000/api/roles
{
  "name": "supervisor",
  "description": "Supervisor role with elevated permissions",
  "isActive": true
}
```

## 📊 JWT Token Structure

When you login, your token includes:

```json
{
  "userId": 1,
  "tenantId": 1,
  "roleId": 2,
  "roleName": "monsters",  ⭐ Role name included!
  "name": "Monster User",
  "email": "monster@example.com"
}
```

## ✅ Verification Checklist

- [ ] Roles table created
- [ ] Test users created with different roles
- [ ] Monster user can access `/api/tenants`
- [ ] Viewer user gets 403 when accessing `/api/tenants`
- [ ] JWT token includes `roleName` field
- [ ] Swagger docs show role requirements

## 📚 More Information

- [Full RBAC Documentation](./ROLE_BASED_ACCESS_CONTROL.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Quick Reference](./QUICK_REFERENCE.md)

## 🎉 You're Done!

Your API now has role-based access control! The `getAllTenants` endpoint requires the `monsters` role as requested.

### Test It Now:

1. Login with monster user → Access granted ✅
2. Login with viewer user → Access denied ❌

Perfect! Your role-based security is working! 🔐

