# Installments Module - Implementation Summary

## ✅ Implementation Complete!

The installments module has been successfully created with **full CRUD access for collectioner role** (unlike other modules where collectioner is read-only).

---

## 📋 Database Schema

```sql
CREATE TABLE installments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loanId INT NOT NULL,
    tenantId INT NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('PENDING','PAID','MISSED') DEFAULT 'PENDING',
    collectedBy INT NULL,
    collectedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loanId) REFERENCES loans(id),
    FOREIGN KEY (tenantId) REFERENCES tenants(id),
    FOREIGN KEY (collectedBy) REFERENCES users(id)
);
```

### Fields Description

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Auto-increment primary key |
| `loanId` | INT | Loan ID (NOT NULL) |
| `tenantId` | INT | Tenant ID (NOT NULL) |
| `date` | DATE | Installment due date (NOT NULL) |
| `amount` | DECIMAL(15,2) | Installment amount (NOT NULL) |
| `status` | ENUM | PENDING/PAID/MISSED (default: PENDING) |
| `collectedBy` | INT | User ID who collected payment (nullable) |
| `collectedAt` | TIMESTAMP | Payment collection timestamp (nullable) |
| `createdAt` | TIMESTAMP | Creation timestamp |

### Foreign Keys

- `loanId` → `loans(id)`
- `tenantId` → `tenants(id)`
- `collectedBy` → `users(id)`

---

## 🔒 Role Permissions ⭐ IMPORTANT

### Collectioner Has Full Access!

Unlike other resources, **collectioner can add/edit/delete installments** because they need to record payments.

| Operation | Admin | Manager | Collectioner |
|-----------|-------|---------|--------------|
| **GET** `/api/installments` | ✅ | ✅ | ✅ |
| **GET** `/api/installments/:id` | ✅ | ✅ | ✅ |
| **GET** `/api/installments/loan/:loanId` | ✅ | ✅ | ✅ |
| **GET** `/api/installments/pending` | ✅ | ✅ | ✅ |
| **GET** `/api/installments/today` | ✅ | ✅ | ✅ |
| **POST** `/api/installments` | ✅ | ✅ | ✅ ⭐ |
| **PUT** `/api/installments/:id` | ✅ | ✅ | ✅ ⭐ |
| **PATCH** `/api/installments/:id/pay` | ✅ | ✅ | ✅ ⭐ |
| **PATCH** `/api/installments/:id/missed` | ✅ | ✅ | ✅ ⭐ |
| **DELETE** `/api/installments/:id` | ✅ | ✅ | ✅ ⭐ |

### Why Collectioner Has Full Access?

**Collectioners need to:**
- ✅ Record payment collections
- ✅ Mark payments as paid/missed
- ✅ Update payment details
- ✅ Create installment schedules
- ✅ Correct errors in records

This is their **primary job function** in the system!

---

## 📦 Files Created

### 1. Database
- ✅ `database/installments_schema.sql` - Complete schema with sample data

### 2. Model
- ✅ `models/installmentModel.js`
  - `findAll()` - Get all with JOINs
  - `findById(id)` - Get with full details
  - `findByTenantId(tenantId)` - By tenant
  - `findByLoanId(loanId)` - By loan
  - `findByCustomerId(customerId)` - By customer
  - `findByStatus(status)` - By status
  - `findPending(tenantId)` - Pending only
  - `findToday(tenantId)` - Today's installments
  - `create(data)` - Create installment
  - `update(id, data)` - Update installment
  - `markAsPaid(id, userId)` - Mark as paid
  - `markAsMissed(id)` - Mark as missed
  - `delete(id)` - Delete installment
  - `getStatsByTenant(tenantId)` - Statistics

### 3. Service
- ✅ `services/installmentService.js`
  - Complete business logic
  - Tenant filtering
  - Field validation
  - All CRUD operations
  - Statistics

### 4. Controller
- ✅ `controllers/installmentController.js`
  - All HTTP handlers
  - Auto-set tenantId and userId
  - Proper error handling

### 5. Routes
- ✅ `routes/installmentRoutes.js`
  - 13 endpoints with Swagger docs
  - **Collectioner included in all operations**

### 6. Server
- ✅ `server.js` (updated)
  - Registered `/api/installments` routes

---

## 📝 API Endpoints (13 Total)

Base URL: `http://localhost:3000/api/installments`

### Read Operations (All Roles)

1. `GET /` - Get all installments
2. `GET /pending` - Get pending installments
3. `GET /today` - Get today's installments
4. `GET /stats` - Get installment statistics
5. `GET /status/:status` - Get by status (PENDING/PAID/MISSED)
6. `GET /loan/:loanId` - Get by loan
7. `GET /customer/:customerId` - Get by customer
8. `GET /:id` - Get by ID

### Write Operations (All Roles Including Collectioner ⭐)

9. `POST /` - Create installment
10. `PUT /:id` - Update installment
11. `PATCH /:id/pay` - Mark as paid
12. `PATCH /:id/missed` - Mark as missed
13. `DELETE /:id` - Delete installment

---

## 💡 Usage Examples

### 1. Get Today's Installments (Collectioner Can Access)

```bash
curl http://localhost:3000/api/installments/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "loanId": 1,
      "tenantId": 1,
      "date": "2025-01-08",
      "amount": 383.33,
      "status": "PENDING",
      "collectedBy": null,
      "collectedAt": null,
      "tenantName": "ABC Company",
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "collectedByName": null
    }
  ]
}
```

### 2. Create Installment (Collectioner ✅ CAN Create)

```bash
curl -X POST http://localhost:3000/api/installments \
  -H "Authorization: Bearer COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loanId": 1,
    "date": "2025-01-10",
    "amount": 383.33,
    "status": "PENDING"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Installment created successfully",
  "data": {
    "id": 10,
    "loanId": 1,
    "tenantId": 1,
    "date": "2025-01-10",
    "amount": 383.33,
    "status": "PENDING",
    "customerName": "John Doe"
  }
}
```

### 3. Mark Installment as Paid (Collectioner ✅ CAN Mark)

```bash
curl -X PATCH http://localhost:3000/api/installments/1/pay \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Installment marked as paid successfully",
  "data": {
    "id": 1,
    "loanId": 1,
    "tenantId": 1,
    "date": "2025-01-08",
    "amount": 383.33,
    "status": "PAID",
    "collectedBy": 4,
    "collectedAt": "2025-01-08T10:30:00",
    "collectedByName": "Collectioner User"
  }
}
```

### 4. Get Pending Installments

```bash
curl http://localhost:3000/api/installments/pending \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
```

### 5. Get Installments by Loan

```bash
curl http://localhost:3000/api/installments/loan/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get Installments by Customer

```bash
curl http://localhost:3000/api/installments/customer/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Get Statistics

```bash
curl http://localhost:3000/api/installments/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInstallments": 50,
    "pendingInstallments": 30,
    "paidInstallments": 15,
    "missedInstallments": 5,
    "totalCollected": 5750.00,
    "totalPending": 11500.00,
    "totalMissed": 1915.00
  }
}
```

### 8. Update Installment (Collectioner ✅ CAN Edit)

```bash
curl -X PUT http://localhost:3000/api/installments/1 \
  -H "Authorization: Bearer COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 400.00,
    "date": "2025-01-09"
  }'
```

### 9. Delete Installment (Collectioner ✅ CAN Delete)

```bash
curl -X DELETE http://localhost:3000/api/installments/1 \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Installment deleted successfully"
}
```

---

## 📊 Installment Status Flow

```
PENDING → [Collection] → PAID
    ↓
    [Missed Payment]
    ↓
  MISSED
```

### Status Enum Values

| Status | Description | Triggered By |
|--------|-------------|--------------|
| `PENDING` | Awaiting payment | Default for new installments |
| `PAID` | Payment collected | `/pay` endpoint or update |
| `MISSED` | Payment not received | `/missed` endpoint or automatic |

---

## 🎯 Key Features

✅ **Full Collectioner Access** - Can create/edit/delete (unlike other resources)  
✅ **Payment Recording** - Mark as paid with collector tracking  
✅ **Automatic Tracking** - Records who collected and when  
✅ **Today's Collections** - Quick view of today's due installments  
✅ **Pending Tracking** - View all unpaid installments  
✅ **Statistics Dashboard** - Collection metrics  
✅ **Customer View** - See all customer installments  
✅ **Loan View** - See all loan installments  
✅ **Status Management** - PENDING/PAID/MISSED workflow  
✅ **Tenant Isolation** - Users see only their tenant's data  
✅ **JOIN Queries** - Returns tenant, customer, loan details  

---

## 🚀 Quick Setup

### Run Database Script

```bash
mysql -u root -p elf_finance < database/installments_schema.sql
```

This will:
1. ✅ Create the `installments` table
2. ✅ Insert sample installments for testing
3. ✅ Display the data

---

## 🧪 Testing Guide

### Test as Collectioner (FULL ACCESS ⭐)

```bash
# Login as collectioner
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"collectioner@example.com","password":"password123"}'

COLLECTIONER_TOKEN="your_access_token"

# View today's collections ✅
curl http://localhost:3000/api/installments/today \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"

# View pending installments ✅
curl http://localhost:3000/api/installments/pending \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"

# Create installment ✅ SUCCESS (Collectioner CAN create!)
curl -X POST http://localhost:3000/api/installments \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loanId": 1,
    "date": "2025-01-10",
    "amount": 383.33,
    "status": "PENDING"
  }'

# Mark as paid ✅ SUCCESS (Collectioner CAN mark as paid!)
curl -X PATCH http://localhost:3000/api/installments/1/pay \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"

# Update installment ✅ SUCCESS (Collectioner CAN edit!)
curl -X PUT http://localhost:3000/api/installments/1 \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 400.00
  }'

# Delete installment ✅ SUCCESS (Collectioner CAN delete!)
curl -X DELETE http://localhost:3000/api/installments/1 \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"

# View statistics ✅
curl http://localhost:3000/api/installments/stats \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"
```

---

## 📊 Comparison: Collectioner Permissions

| Resource | Collectioner Access |
|----------|-------------------|
| **Users** | ❌ No access |
| **Customers** | ✅ View only (read-only) |
| **Loan Types** | ✅ View only (read-only) |
| **Loans** | ✅ View only (read-only) |
| **Installments** | ✅ **FULL ACCESS** ⭐ (create/edit/delete/view) |

**Reason:** Installments are the collectioner's primary work area - they need to record payments!

---

## 🎯 Common Use Cases

### Use Case 1: Daily Collection Workflow

```bash
# 1. Get today's due installments
curl http://localhost:3000/api/installments/today \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"

# 2. For each installment, mark as paid when collected
curl -X PATCH http://localhost:3000/api/installments/1/pay \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"

# 3. Mark missed if customer not found
curl -X PATCH http://localhost:3000/api/installments/2/missed \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"

# 4. View end-of-day statistics
curl http://localhost:3000/api/installments/stats \
  -H "Authorization: Bearer COLLECTIONER_TOKEN"
```

### Use Case 2: Customer Payment History

```bash
# View all installments for a customer
curl http://localhost:3000/api/installments/customer/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Use Case 3: Loan Installment Schedule

```bash
# View all installments for a specific loan
curl http://localhost:3000/api/installments/loan/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Use Case 4: Missed Payments Report

```bash
# Get all missed installments
curl http://localhost:3000/api/installments/status/MISSED \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📈 Statistics Endpoint

The `/api/installments/stats` endpoint provides collection metrics:

```json
{
  "success": true,
  "data": {
    "totalInstallments": 150,
    "pendingInstallments": 75,
    "paidInstallments": 60,
    "missedInstallments": 15,
    "totalCollected": 23000.00,
    "totalPending": 28750.00,
    "totalMissed": 5750.00
  }
}
```

**Use Cases:**
- Collection dashboard
- Daily collection reports
- Performance tracking
- Payment recovery monitoring

---

## 🔄 Automatic Tracking

When marking an installment as paid using `/pay` endpoint:

1. ✅ Status changed to 'PAID'
2. ✅ `collectedBy` set to current user's ID
3. ✅ `collectedAt` set to current timestamp

```json
{
  "status": "PAID",
  "collectedBy": 4,
  "collectedAt": "2025-01-08T10:30:00",
  "collectedByName": "Collectioner User"
}
```

---

## ✅ Verification Checklist

- [x] `installments` table created
- [x] Sample data inserted
- [x] Model with 14 methods
- [x] Service with complete logic
- [x] Controller with all handlers
- [x] Routes with 13 endpoints
- [x] Swagger documentation complete
- [x] **Collectioner can view** ✅
- [x] **Collectioner can create** ✅ ⭐
- [x] **Collectioner can edit** ✅ ⭐
- [x] **Collectioner can delete** ✅ ⭐
- [x] **Collectioner can mark as paid** ✅ ⭐
- [x] Admin/Manager have full access ✅
- [x] Tenant isolation working ✅
- [x] Zero linter errors ✅

---

## 📚 API Documentation

All endpoints documented in Swagger at: **http://localhost:3000/api-docs**

Look for the **"Installments"** tag.

---

## 🎉 Summary

✅ **Installments table created** with exact schema  
✅ **14 model methods** including statistics  
✅ **13 API endpoints** fully documented  
✅ **Collectioner FULL ACCESS** ⭐ (create/edit/delete/mark paid)  
✅ **Payment tracking** - Records who collected and when  
✅ **Today's collections** - Quick daily overview  
✅ **Pending tracking** - Outstanding payments  
✅ **Statistics** - Collection metrics  
✅ **Customer view** - Payment history  
✅ **Loan view** - Installment schedule  
✅ **Status management** - PENDING/PAID/MISSED  
✅ **JOIN queries** - Full details with tenant/customer/loan info  
✅ **Tenant isolation** - Secure multi-tenancy  
✅ **Zero linter errors** - Production ready  

---

## 🔑 Key Difference

### Collectioner Permissions Across Modules

| Module | View | Create | Edit | Delete |
|--------|------|--------|------|--------|
| Customers | ✅ | ❌ | ❌ | ❌ |
| Loan Types | ✅ | ❌ | ❌ | ❌ |
| Loans | ✅ | ❌ | ❌ | ❌ |
| **Installments** | ✅ | ✅ ⭐ | ✅ ⭐ | ✅ ⭐ |

**Installments are special** - Collectioners need full access to do their job!

---

## 📖 Related Files

- Database: `database/installments_schema.sql`
- Model: `models/installmentModel.js`
- Service: `services/installmentService.js`
- Controller: `controllers/installmentController.js`
- Routes: `routes/installmentRoutes.js`
- API: `http://localhost:3000/api/installments`

Your installment collection system is ready for production! 🎊💰

