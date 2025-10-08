# Tenant Creation with Auto-Admin User

## Overview

When creating a new tenant, the system **automatically creates an admin user** for that tenant. This ensures every tenant has at least one administrator who can manage the tenant's resources.

---

## 🔄 How It Works

### Automatic Process

1. **Create Tenant** → Tenant record created in database
2. **Create Admin User** → Admin user automatically created with:
   - `tenantId` = newly created tenant's ID
   - `roleId` = 1 (Admin role)
   - Email, password, and name from request
3. **Transaction Safety** → If admin user creation fails, tenant is rolled back

---

## 📝 API Request Format

### Endpoint

```
POST /api/tenants
```

### Request Body (Updated)

```json
{
  "name": "ABC Corporation",
  "phoneNumber": "+1234567890",
  "isActive": true,
  "adminName": "John Doe",
  "adminEmail": "john.doe@abc.com",
  "adminPassword": "securePassword123",
  "adminPhone": "+1234567890"
}
```

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Tenant name |
| `adminName` | string | ✅ Yes | Admin user's full name |
| `adminEmail` | string | ✅ Yes | Admin user's email (must be unique) |
| `adminPassword` | string | ✅ Yes | Admin user's password |
| `phoneNumber` | string | ❌ No | Tenant phone number |
| `adminPhone` | string | ❌ No | Admin user's phone number |
| `isActive` | boolean | ❌ No | Tenant active status (default: true) |

---

## 💡 Usage Examples

### Example 1: Create Tenant with Admin User

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "XYZ Enterprises",
    "phoneNumber": "+1234567890",
    "adminName": "Jane Smith",
    "adminEmail": "jane.smith@xyz.com",
    "adminPassword": "SecurePass123!",
    "adminPhone": "+0987654321"
  }'
```

### Response (Success)

```json
{
  "success": true,
  "message": "Tenant and admin user created successfully",
  "data": {
    "tenant": {
      "id": 4,
      "name": "XYZ Enterprises",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "createdAt": "2025-01-08"
    },
    "adminUser": {
      "id": 15,
      "name": "Jane Smith",
      "email": "jane.smith@xyz.com",
      "roleId": 1,
      "roleName": "admin"
    }
  }
}
```

### Example 2: Admin User Can Login Immediately

```bash
# Login with the newly created admin credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@xyz.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 15,
      "tenantId": 4,
      "name": "Jane Smith",
      "roleId": 1,
      "email": "jane.smith@xyz.com",
      "tenantName": "XYZ Enterprises",
      "roleName": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer"
    }
  }
}
```

---

## ⚠️ Error Handling

### Error 1: Missing Admin Email

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Corp",
    "adminName": "Test User",
    "adminPassword": "password123"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Admin email is required"
}
```

### Error 2: Email Already Exists

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Corp",
    "adminName": "Another User",
    "adminEmail": "existing@email.com",
    "adminPassword": "password123"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Admin email already exists"
}
```

### Error 3: User Creation Fails (Automatic Rollback)

If admin user creation fails for any reason:
1. ✅ Tenant record is automatically deleted (rollback)
2. ❌ Error message returned
3. ✅ Database remains consistent (no orphaned tenant)

**Response (500 Server Error):**
```json
{
  "success": false,
  "message": "Error creating tenant: Failed to create admin user: [error details]"
}
```

---

## 🔒 Security Features

### 1. Email Uniqueness Check
- ✅ Validates admin email doesn't already exist
- ✅ Prevents duplicate user accounts
- ✅ Returns clear error message

### 2. Password Hashing
- ✅ Admin password automatically hashed with bcrypt
- ✅ 10 salt rounds for security
- ✅ Password never stored in plain text

### 3. Transaction Safety
- ✅ If admin user creation fails, tenant is rolled back
- ✅ Maintains database consistency
- ✅ No orphaned tenants without admin users

### 4. Automatic Admin Role
- ✅ Admin user always gets roleId = 1 (admin role)
- ✅ Cannot be changed during tenant creation
- ✅ Ensures tenant has proper administrator

---

## 🎯 Benefits

### 1. **Consistency**
- Every tenant automatically has an admin user
- No manual user creation step needed
- Reduces setup errors

### 2. **Security**
- Admin credentials required upfront
- Email validation ensures uniqueness
- Password hashing applied automatically

### 3. **Convenience**
- Single API call creates both tenant and admin
- Admin can login immediately
- Ready to manage tenant resources

### 4. **Data Integrity**
- Rollback if user creation fails
- No orphaned tenants
- Referential integrity maintained

---

## 📊 Complete Workflow

### Step 1: Create Tenant (Creates Admin User Automatically)

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Authorization: Bearer MONSTERS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Company",
    "phoneNumber": "+1234567890",
    "adminName": "Admin User",
    "adminEmail": "admin@newcompany.com",
    "adminPassword": "password123",
    "adminPhone": "+1234567890"
  }'
```

### Step 2: Admin User Can Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@newcompany.com",
    "password": "password123"
  }'
```

### Step 3: Admin Can Manage Tenant Resources

```bash
# Get tenant users (will show the admin user)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Create more users
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Manager User",
    "email": "manager@newcompany.com",
    "roleId": 3,
    "password": "password123"
  }'

# Create customers
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "First Customer",
    "email": "customer@example.com",
    "phoneNumber": "+1111111111"
  }'
```

---

## 🧪 Testing

### Test 1: Create Tenant Successfully

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Authorization: Bearer MONSTERS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Corporation",
    "phoneNumber": "+9999999999",
    "adminName": "Test Admin",
    "adminEmail": "test.admin@test.com",
    "adminPassword": "TestPass123!",
    "adminPhone": "+9999999999"
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Tenant and admin user created successfully",
  "data": {
    "tenant": {
      "id": 5,
      "name": "Test Corporation",
      "phoneNumber": "+9999999999",
      "isActive": true
    },
    "adminUser": {
      "id": 20,
      "name": "Test Admin",
      "email": "test.admin@test.com",
      "roleId": 1,
      "roleName": "admin"
    }
  }
}
```

### Test 2: Verify Admin User Can Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.admin@test.com",
    "password": "TestPass123!"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "tenantId": 5,
      "roleName": "admin"
    },
    "tokens": { /* JWT tokens */ }
  }
}
```

### Test 3: Verify Admin Can Access Tenant Resources

```bash
# Should see empty list (new tenant, no users yet except admin)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📋 Migration Guide

If you already have tenants without admin users, you can manually create admin users for them:

```bash
# For each existing tenant, create an admin user
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer MONSTERS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Tenant 1 Admin",
    "roleId": 1,
    "email": "admin@tenant1.com",
    "password": "password123",
    "phoneNumber": "+1234567890"
  }'
```

---

## ✅ Verification Checklist

- [x] Tenant creation requires admin user data
- [x] Admin user automatically created with tenant
- [x] Admin user has roleId = 1 (admin role)
- [x] Admin email uniqueness validated
- [x] Password automatically hashed
- [x] Admin can login immediately after creation
- [x] Rollback works if user creation fails
- [x] Swagger documentation updated
- [x] Error messages are clear
- [x] Zero linter errors

---

## 🎯 Required Fields Summary

### For Tenant
- ✅ `name` (required)
- ⭐ `phoneNumber` (optional)
- ⭐ `isActive` (optional, default: true)

### For Admin User (NEW)
- ✅ `adminName` (required)
- ✅ `adminEmail` (required, must be unique)
- ✅ `adminPassword` (required, will be hashed)
- ⭐ `adminPhone` (optional)

---

## 🎉 Summary

✅ **Auto-admin creation** - Admin user created with every tenant  
✅ **Single API call** - Create tenant and admin together  
✅ **Transaction safety** - Rollback if admin creation fails  
✅ **Email validation** - Prevents duplicate emails  
✅ **Password security** - Automatic hashing with bcrypt  
✅ **Immediate login** - Admin can login right away  
✅ **Clear errors** - Helpful error messages  
✅ **Swagger updated** - Complete API documentation  
✅ **Zero linter errors** - Production ready  

Every tenant now automatically gets an admin user upon creation! 🎊

---

## 📚 Related Documentation

- [Authentication Guide](./AUTHENTICATION.md)
- [Role Permissions](./UPDATED_ROLE_PERMISSIONS.md)
- [API Documentation](http://localhost:3000/api-docs)

