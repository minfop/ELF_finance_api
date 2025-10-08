# Updated Role Permissions Matrix

## 🔄 Updated with Installments Module

The installments module has a **special permission structure** where collectioner has full CRUD access.

---

## 📊 Complete Permissions Matrix

| Resource | Monsters | Admin | Manager | Collectioner |
|----------|----------|-------|---------|--------------|
| **Tenants** |
| View All | ✅ | ❌ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ | ❌ |
| Create/Edit/Delete | ✅ | ❌ | ❌ | ❌ |
| **Subscriptions** |
| View All | ✅ | ❌ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ | ❌ |
| Create/Edit/Delete | ✅ | ✅ | ❌ | ❌ |
| **Users** |
| View | ✅ All | ✅ Tenant | ✅ Tenant | ❌ |
| Create/Edit/Delete | ✅ | ✅ | ✅ | ❌ |
| **Customers** |
| View | ✅ All | ✅ Tenant | ✅ Tenant | ✅ Tenant (Read-only) |
| Create/Edit/Delete | ✅ | ✅ | ✅ | ❌ |
| **Loan Types** |
| View | ✅ All | ✅ Tenant | ✅ Tenant | ✅ Tenant (Read-only) |
| Create/Edit/Delete | ✅ | ✅ | ✅ | ❌ |
| **Loans** |
| View | ✅ All | ✅ Tenant | ✅ Tenant | ✅ Tenant (Read-only) |
| Create/Edit/Delete | ✅ | ✅ | ✅ | ❌ |
| **Installments** ⭐ |
| View | ✅ All | ✅ Tenant | ✅ Tenant | ✅ Tenant |
| **Create/Edit/Delete** | ✅ | ✅ | ✅ | ✅ **FULL ACCESS** ⭐ |
| Mark as Paid/Missed | ✅ | ✅ | ✅ | ✅ **FULL ACCESS** ⭐ |

---

## ⭐ Special Note: Collectioner Permissions

### Collectioner Role Summary

| Module | Access Level |
|--------|-------------|
| Users | ❌ No access |
| Customers | 👁️ View only (read-only) |
| Loan Types | 👁️ View only (read-only) |
| Loans | 👁️ View only (read-only) |
| **Installments** | ✅ **FULL ACCESS** (create/edit/delete/mark paid) ⭐ |

### Why Installments are Different?

**Collectioners primary job is to:**
1. ✅ Record daily payment collections
2. ✅ Mark installments as paid when money received
3. ✅ Mark installments as missed when payment not received
4. ✅ Update payment details
5. ✅ Track collection statistics

**They need full CRUD access to installments to perform their job!**

---

## 🎯 Collectioner Workflow

### Daily Collection Process

```mermaid
1. Login → 2. View Today's Due → 3. Visit Customers → 
4. Collect Payment → 5. Mark as Paid → 6. Update Stats
```

### API Calls

```bash
# Step 1: Get today's due installments
GET /api/installments/today

# Step 2: View customer details
GET /api/customers/:id

# Step 3: Mark installment as paid (after receiving payment)
PATCH /api/installments/:id/pay

# Step 4: View updated statistics
GET /api/installments/stats
```

---

## 📋 Complete API Access by Role

### Admin Role 👑

**Full Access To:**
- ✅ Own tenant's users
- ✅ Own tenant's customers
- ✅ Own tenant's loan types
- ✅ Own tenant's loans
- ✅ Own tenant's installments
- ✅ Own tenant's subscriptions

**Cannot Access:**
- ❌ Other tenants' data

### Manager Role 📊

**Full Access To:**
- ✅ Own tenant's users
- ✅ Own tenant's customers
- ✅ Own tenant's loan types
- ✅ Own tenant's loans
- ✅ Own tenant's installments

**View Only:**
- 👁️ Own tenant's subscriptions

**Cannot Access:**
- ❌ Other tenants' data

### Collectioner Role 📝

**Full Access To:**
- ✅ **Installments** (create/edit/delete/mark paid) ⭐

**View Only:**
- 👁️ Customers (own tenant)
- 👁️ Loan types (own tenant)
- 👁️ Loans (own tenant)

**Cannot Access:**
- ❌ Users
- ❌ Tenants
- ❌ Subscriptions
- ❌ Other tenants' data

---

## 🧪 Quick Permission Tests

### Test Collectioner on Customers (Read-Only)

```bash
# ✅ Can view
curl http://localhost:3000/api/customers \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"

# ❌ Cannot create
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer COLLECTIONER_TOKEN" \
  -d '{"name":"Test"}'
# Expected: 403 Forbidden
```

### Test Collectioner on Installments (Full Access)

```bash
# ✅ Can view
curl http://localhost:3000/api/installments \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"

# ✅ Can create
curl -X POST http://localhost:3000/api/installments \
  -H "Authorization: Bearer COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loanId": 1,
    "date": "2025-01-10",
    "amount": 383.33
  }'
# Expected: 201 Created ✅

# ✅ Can mark as paid
curl -X PATCH http://localhost:3000/api/installments/1/pay \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
# Expected: 200 OK ✅

# ✅ Can edit
curl -X PUT http://localhost:3000/api/installments/1 \
  -H "Authorization: Bearer COLLECTIONER_TOKEN" \
  -d '{"amount": 400.00}'
# Expected: 200 OK ✅

# ✅ Can delete
curl -X DELETE http://localhost:3000/api/installments/1 \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
# Expected: 200 OK ✅
```

---

## 📊 API Endpoints by Module

| Module | Total Endpoints | Collectioner Access |
|--------|----------------|---------------------|
| Authentication | 8 | Limited (login, logout, change password) |
| Roles | 7 | View only |
| Tenants | 7 | No access |
| Users | 9 | No access |
| Customers | 5 | View only (read-only) |
| Subscription Plans | 7 | No access |
| Tenant Subscriptions | 7 | No access |
| Loan Types | 7 | View only (read-only) |
| Loans | 11 | View only (read-only) |
| **Installments** | **13** | **FULL ACCESS** ⭐ |

**Total:** 81+ API Endpoints

---

## 🎯 Summary by Role

### Monsters 👾
- **Scope**: Global (all tenants)
- **Access**: Full CRUD on everything
- **Use Case**: System administrators, platform management

### Admin 👑
- **Scope**: Own tenant only
- **Access**: Full CRUD on all tenant resources
- **Use Case**: Tenant owner, business owner

### Manager 📊
- **Scope**: Own tenant only
- **Access**: Full CRUD on users, customers, loans, installments
- **View Only**: Subscriptions
- **Use Case**: Department manager, operations lead

### Collectioner 📝
- **Scope**: Own tenant only
- **Full CRUD**: Installments (create/edit/delete/mark paid) ⭐
- **View Only**: Customers, Loan Types, Loans
- **No Access**: Users, Tenants, Subscriptions
- **Use Case**: Collection agents, payment collectors

---

## ✅ Complete Implementation

All modules are now complete with proper role-based access control:

1. ✅ Authentication & Authorization
2. ✅ Tenants
3. ✅ Users
4. ✅ Roles
5. ✅ Customers (with photo & documents)
6. ✅ Subscription Plans
7. ✅ Tenant Subscriptions
8. ✅ Loan Types
9. ✅ Loans
10. ✅ **Installments** ⭐ (Collectioner full access)

**Total:** 10 complete modules, 81+ API endpoints, 10 database tables

---

## 📚 Documentation

- **API Docs**: http://localhost:3000/api-docs
- **Auth Guide**: `docs/AUTHENTICATION.md`
- **RBAC Guide**: `docs/ROLE_BASED_ACCESS_CONTROL.md`
- **Permissions**: `docs/ROLE_PERMISSIONS.md`
- **Quick Ref**: `docs/QUICK_REFERENCE.md`

---

## 🎊 Project Status: COMPLETE

Your ELF Finance API is fully implemented and production-ready! 🚀

