# Quick Start: Create Tenant with Admin

## 🚀 Create a New Tenant (with Auto-Admin)

### One Command - Two Results

When you create a tenant, you get:
1. ✅ New tenant record
2. ✅ Admin user for that tenant (automatically)

---

## 📝 Quick Example

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Authorization: Bearer YOUR_MONSTERS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Company",
    "phoneNumber": "+1234567890",
    "adminName": "Company Admin",
    "adminEmail": "admin@mynewcompany.com",
    "adminPassword": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant and admin user created successfully",
  "data": {
    "tenant": {
      "id": 10,
      "name": "My New Company",
      "phoneNumber": "+1234567890"
    },
    "adminUser": {
      "id": 25,
      "name": "Company Admin",
      "email": "admin@mynewcompany.com",
      "roleId": 1,
      "roleName": "admin"
    }
  }
}
```

---

## 🔑 Admin Can Login Immediately

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mynewcompany.com",
    "password": "SecurePass123!"
  }'
```

✅ **Success!** Admin user can now manage the tenant.

---

## ⚠️ Common Errors

### Error: Missing Admin Email

```json
{
  "success": false,
  "message": "Admin email is required"
}
```

**Fix:** Include `adminEmail` in request body

### Error: Email Already Exists

```json
{
  "success": false,
  "message": "Admin email already exists"
}
```

**Fix:** Use a different email address

---

## ✅ Required Fields

**Minimum Required:**
```json
{
  "name": "Tenant Name",
  "adminName": "Admin Name",
  "adminEmail": "admin@email.com",
  "adminPassword": "password123"
}
```

**Recommended (with all fields):**
```json
{
  "name": "Tenant Name",
  "phoneNumber": "+1234567890",
  "adminName": "Admin Full Name",
  "adminEmail": "admin@email.com",
  "adminPassword": "SecurePass123!",
  "adminPhone": "+1234567890"
}
```

---

## 🎯 What Happens Automatically

1. ✅ Tenant created
2. ✅ Admin user created with:
   - TenantId = new tenant's ID
   - RoleId = 1 (admin)
   - Password hashed with bcrypt
3. ✅ Both returned in response
4. ✅ Admin can login immediately
5. ✅ If user creation fails → tenant is deleted (rollback)

---

## 📊 Complete Flow

```
POST /api/tenants
    ↓
Validate tenant data
    ↓
Validate admin data
    ↓
Check email not exists
    ↓
Create tenant
    ↓
Create admin user (roleId = 1)
    ↓
Hash password
    ↓
If SUCCESS:
  → Return tenant + admin user
    ↓
If FAIL:
  → Delete tenant (rollback)
  → Return error
```

---

## 🎊 You're Done!

Every new tenant automatically gets an admin user. No extra steps needed! 🚀

**Test it now:** http://localhost:3000/api-docs (look for POST /api/tenants)

