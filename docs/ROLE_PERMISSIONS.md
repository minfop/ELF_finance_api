# Role Permissions Matrix

## Overview

This document outlines the access control permissions for each role in the ELF Finance API.

## Role Definitions

### 1. **Monsters** 👾
- **Description**: Special role with cross-tenant visibility
- **Access Level**: Global view access
- **Tenant Restriction**: None (can see all tenants)

### 2. **Admin** 👑
- **Description**: Owner of tenant
- **Access Level**: Full access within their tenant
- **Tenant Restriction**: Can only access their own tenant data

### 3. **Manager** 📊
- **Description**: Manager of tenant
- **Access Level**: Full access within their tenant
- **Tenant Restriction**: Can only access their own tenant data

### 4. **Collectioner** 📝
- **Description**: Collection role with read-only customer access
- **Access Level**: Read-only customers, no user access
- **Tenant Restriction**: Can only view their own tenant's customers

### 5. **User** 👤
- **Description**: Regular user
- **Access Level**: Limited access
- **Tenant Restriction**: Their own tenant

### 6. **Viewer** 👁️
- **Description**: Read-only viewer
- **Access Level**: View-only
- **Tenant Restriction**: Their own tenant

---

## Permissions Matrix

| Feature | Monsters | Admin | Manager | Collectioner | User | Viewer |
|---------|----------|-------|---------|--------------|------|--------|
| **Tenants** |
| View All Tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Tenant | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Tenant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update Tenant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Tenant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tenant Subscriptions** |
| View All Subscriptions | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Subscription | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Subscription | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update Subscription | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cancel Subscription | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Subscription | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Users** |
| View All Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Tenant Users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create User | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update User | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Customers** |
| View All Customers | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Tenant Customers | ✅ | ✅ | ✅ | ✅ (Read-only) | ❌ | ❌ |
| Create Customer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Customer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Customer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Roles** |
| View Roles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Role | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update Role | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Role | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Detailed Permissions by Role

### Monsters Role 👾

**Can Access:**
- ✅ ALL tenants list
- ✅ ALL tenant subscriptions
- ✅ ALL users (across all tenants)
- ✅ ALL customers (across all tenants)
- ✅ Create/Update/Delete any resource

**Restrictions:**
- None - Global access

**Use Cases:**
- System administrators
- Support staff
- Platform management

---

### Admin Role 👑

**Can Access:**
- ✅ Own tenant information only
- ✅ Own tenant's subscription
- ✅ ALL users in their tenant
- ✅ ALL customers in their tenant
- ✅ Create/Update/Delete users in their tenant
- ✅ Create/Update/Delete customers in their tenant
- ✅ Manage tenant subscription

**Restrictions:**
- ❌ Cannot view other tenants
- ❌ Cannot view other tenants' users
- ❌ Cannot view other tenants' customers
- ❌ Cannot view global tenant list

**Use Cases:**
- Tenant owner
- Primary administrator
- Business owner

---

### Manager Role 📊

**Can Access:**
- ✅ Own tenant information only
- ✅ Own tenant's subscription (view only)
- ✅ ALL users in their tenant
- ✅ ALL customers in their tenant
- ✅ Create/Update/Delete users in their tenant
- ✅ Create/Update/Delete customers in their tenant

**Restrictions:**
- ❌ Cannot manage subscription
- ❌ Cannot view other tenants
- ❌ Cannot view other tenants' users/customers
- ❌ Cannot view global tenant list

**Use Cases:**
- Department manager
- Team lead
- Operations manager

---

### Collectioner Role 📝

**Can Access:**
- ✅ View customer list in their tenant **ONLY**
- ✅ View individual customer details in their tenant

**Restrictions:**
- ❌ Cannot create customers
- ❌ Cannot edit customers
- ❌ Cannot delete customers
- ❌ Cannot view users
- ❌ Cannot create users
- ❌ Cannot edit users
- ❌ Cannot delete users
- ❌ Cannot view tenants
- ❌ Cannot view subscriptions

**Use Cases:**
- Collection agents
- Customer service (view-only)
- Reporting staff
- Third-party integrations (read-only)

---

### User Role 👤

**Can Access:**
- Limited access (define per use case)

**Restrictions:**
- ❌ Cannot access customers
- ❌ Cannot access users
- ❌ Cannot access tenants

**Use Cases:**
- Regular employees
- Standard users

---

### Viewer Role 👁️

**Can Access:**
- Read-only access (define per use case)

**Restrictions:**
- ❌ No write access to any resource

**Use Cases:**
- Auditors
- Read-only stakeholders
- Reporting dashboards

---

## API Endpoints by Permission

### Tenants

| Endpoint | Monsters | Admin | Manager | Collectioner |
|----------|----------|-------|---------|--------------|
| `GET /api/tenants` | ✅ All | ❌ | ❌ | ❌ |
| `GET /api/tenants/:id` | ✅ Any | ✅ Own | ✅ Own | ❌ |
| `POST /api/tenants` | ✅ | ❌ | ❌ | ❌ |
| `PUT /api/tenants/:id` | ✅ | ❌ | ❌ | ❌ |
| `DELETE /api/tenants/:id` | ✅ | ❌ | ❌ | ❌ |

### Tenant Subscriptions

| Endpoint | Monsters | Admin | Manager | Collectioner |
|----------|----------|-------|---------|--------------|
| `GET /api/tenant-subscriptions` | ✅ All | ✅ Own | ✅ Own | ❌ |
| `GET /api/tenant-subscriptions/:id` | ✅ Any | ✅ Own | ✅ Own | ❌ |
| `POST /api/tenant-subscriptions` | ✅ | ✅ | ❌ | ❌ |
| `PUT /api/tenant-subscriptions/:id` | ✅ | ✅ | ❌ | ❌ |
| `PATCH /api/tenant-subscriptions/:id/cancel` | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/tenant-subscriptions/:id` | ✅ | ✅ | ❌ | ❌ |

### Users

| Endpoint | Monsters | Admin | Manager | Collectioner |
|----------|----------|-------|---------|--------------|
| `GET /api/users` | ✅ All | ✅ Tenant | ✅ Tenant | ❌ |
| `GET /api/users/:id` | ✅ Any | ✅ Tenant | ✅ Tenant | ❌ |
| `POST /api/users` | ✅ | ✅ | ✅ | ❌ |
| `PUT /api/users/:id` | ✅ | ✅ | ✅ | ❌ |
| `DELETE /api/users/:id` | ✅ | ✅ | ✅ | ❌ |

### Customers

| Endpoint | Monsters | Admin | Manager | Collectioner |
|----------|----------|-------|---------|--------------|
| `GET /api/customers` | ✅ All | ✅ Tenant | ✅ Tenant | ✅ Tenant (Read-only) |
| `GET /api/customers/:id` | ✅ Any | ✅ Tenant | ✅ Tenant | ✅ Tenant (Read-only) |
| `POST /api/customers` | ✅ | ✅ | ✅ | ❌ |
| `PUT /api/customers/:id` | ✅ | ✅ | ✅ | ❌ |
| `DELETE /api/customers/:id` | ✅ | ✅ | ✅ | ❌ |

---

## Setup Instructions

### 1. Run Database Scripts

```bash
# Create roles
mysql -u root -p elf_finance < database/roles_schema.sql

# Create customers and subscriptions
mysql -u root -p elf_finance < database/customers_and_subscriptions_schema.sql
```

### 2. Create Test Users

```bash
# Monster user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Monster User",
    "roleId": 2,
    "email": "monster@example.com",
    "password": "password123",
    "phoneNumber": "+1111111111"
  }'

# Admin user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Admin User",
    "roleId": 1,
    "email": "admin@example.com",
    "password": "password123",
    "phoneNumber": "+2222222222"
  }'

# Manager user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Manager User",
    "roleId": 3,
    "email": "manager@example.com",
    "password": "password123",
    "phoneNumber": "+3333333333"
  }'

# Collectioner user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Collectioner User",
    "roleId": 6,
    "email": "collectioner@example.com",
    "password": "password123",
    "phoneNumber": "+4444444444"
  }'
```

### 3. Test Permissions

```bash
# Login as each role
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"monster@example.com","password":"password123"}'

# Test access
# Monsters: Can access all tenants
curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer MONSTER_TOKEN"
# ✅ Success

# Collectioner: Cannot access tenants
curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
# ❌ 403 Forbidden

# Collectioner: Can view customers
curl http://localhost:3000/api/customers \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
# ✅ Success (read-only)

# Collectioner: Cannot create customers
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# ❌ 403 Forbidden

# Collectioner: Cannot access users
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
# ❌ 403 Forbidden
```

---

## Summary

✅ **Monsters**: Global view of all tenants and subscriptions
✅ **Admin**: Full access to own tenant (users, customers, subscriptions)
✅ **Manager**: Full access to own tenant (users, customers), view subscriptions
✅ **Collectioner**: Read-only access to customers in own tenant, NO user access
✅ **User**: Limited access (define per requirements)
✅ **Viewer**: Read-only access (define per requirements)

All permissions are enforced at the route level using `checkRoleByName` middleware and at the service level for tenant-scoped data filtering.

