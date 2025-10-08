# Loans Module - Implementation Summary

## ✅ Implementation Complete!

The loans module has been successfully created with complete CRUD operations and role-based access control.

---

## 📋 Database Schema

```sql
CREATE TABLE loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    customerId INT NOT NULL,
    principal DECIMAL(15,2) NOT NULL,
    interest DECIMAL(15,2) NOT NULL,
    disbursedAmount DECIMAL(15,2) NOT NULL,
    loanTypeId INT NOT NULL,
    totalDays INT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    installmentAmount DECIMAL(15,2) NOT NULL,
    isActive BIT,
    status ENUM('ONGOING','COMPLETED','PENDING','NIL') DEFAULT 'ONGOING',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(id),
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (loanTypeId) REFERENCES loanType(id)
);
```

### Fields Description

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Auto-increment primary key |
| `tenantId` | INT | Tenant ID (NOT NULL) |
| `customerId` | INT | Customer ID (NOT NULL) |
| `principal` | DECIMAL(15,2) | Principal loan amount |
| `interest` | DECIMAL(15,2) | Interest amount |
| `disbursedAmount` | DECIMAL(15,2) | Total disbursed (principal + interest) |
| `loanTypeId` | INT | Loan type ID (FK to loanType) |
| `totalDays` | INT | Total loan duration in days |
| `startDate` | DATE | Loan start date |
| `endDate` | DATE | Loan end date |
| `installmentAmount` | DECIMAL(15,2) | Installment amount per period |
| `isActive` | BIT | Active status (1=active, 0=inactive) |
| `status` | ENUM | Loan status (ONGOING/COMPLETED/PENDING/NIL) |
| `createdAt` | TIMESTAMP | Creation timestamp |

### Foreign Keys

- `tenantId` → `tenants(id)`
- `customerId` → `customers(id)`
- `loanTypeId` → `loanType(id)`

---

## 📦 Files Created

### 1. Database
- ✅ `database/loans_schema.sql` - Complete schema with sample data

### 2. Model
- ✅ `models/loanModel.js`
  - `findAll()` - Get all loans with JOINs
  - `findById(id)` - Get loan with full details
  - `findByTenantId(tenantId)` - Get loans by tenant
  - `findByCustomerId(customerId)` - Get customer's loans
  - `findByStatus(status, tenantId)` - Get loans by status
  - `findActive()` - Get active loans
  - `create(loanData)` - Create new loan
  - `update(id, loanData)` - Update loan
  - `updateStatus(id, status)` - Update loan status
  - `softDelete(id)` - Deactivate loan
  - `delete(id)` - Delete loan
  - `getStatsByTenant(tenantId)` - Get loan statistics

### 3. Service
- ✅ `services/loanService.js`
  - Complete business logic
  - Tenant filtering
  - Field validation
  - All CRUD operations
  - Statistics calculation

### 4. Controller
- ✅ `controllers/loanController.js`
  - HTTP request handlers
  - Auto-set tenantId from user
  - Proper error handling
  - All endpoints

### 5. Routes
- ✅ `routes/loanRoutes.js`
  - 10 endpoints with Swagger docs
  - Role-based access control
  - RESTful design

### 6. Server
- ✅ `server.js` (updated)
  - Registered `/api/loans` routes

---

## 🔒 Role Permissions

| Operation | Admin | Manager | Collectioner |
|-----------|-------|---------|--------------|
| **GET** `/api/loans` | ✅ Tenant | ✅ Tenant | ✅ Tenant (Read-only) |
| **GET** `/api/loans/:id` | ✅ Tenant | ✅ Tenant | ✅ Tenant (Read-only) |
| **GET** `/api/loans/customer/:customerId` | ✅ | ✅ | ✅ (Read-only) |
| **GET** `/api/loans/status/:status` | ✅ | ✅ | ✅ (Read-only) |
| **GET** `/api/loans/stats` | ✅ | ✅ | ✅ (Read-only) |
| **POST** `/api/loans` | ✅ | ✅ | ❌ |
| **PUT** `/api/loans/:id` | ✅ | ✅ | ❌ |
| **PATCH** `/api/loans/:id/status` | ✅ | ✅ | ❌ |
| **DELETE** `/api/loans/:id` | ✅ | ✅ | ❌ |

### Summary
- ✅ **Admin/Manager** - Full access (create/edit/delete) for own tenant
- ✅ **Collectioner** - Read-only access (view all, by customer, by status, stats)
- ✅ **Tenant Isolation** - Users only see their tenant's data

---

## 🚀 Quick Setup

### Run Database Script

```bash
mysql -u root -p elf_finance < database/loans_schema.sql
```

This will:
1. ✅ Create the `loans` table
2. ✅ Insert 4 sample loans
3. ✅ Display the data

---

## 📝 API Endpoints

Base URL: `http://localhost:3000/api/loans`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin/Manager/Collectioner | Get all loans |
| GET | `/active` | Admin/Manager/Collectioner | Get active loans |
| GET | `/status/:status` | Admin/Manager/Collectioner | Get loans by status |
| GET | `/customer/:customerId` | Admin/Manager/Collectioner | Get customer loans |
| GET | `/stats` | Admin/Manager/Collectioner | Get loan statistics |
| GET | `/:id` | Admin/Manager/Collectioner | Get loan by ID |
| POST | `/` | Admin/Manager | Create loan |
| PUT | `/:id` | Admin/Manager | Update loan |
| PATCH | `/:id/status` | Admin/Manager | Update status |
| PATCH | `/:id/deactivate` | Admin/Manager | Deactivate loan |
| DELETE | `/:id` | Admin/Manager | Delete loan |

---

## 💡 Usage Examples

### 1. Get All Loans (Collectioner Can Access)

```bash
curl http://localhost:3000/api/loans \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenantId": 1,
      "customerId": 1,
      "principal": 10000.00,
      "interest": 1500.00,
      "disbursedAmount": 11500.00,
      "loanTypeId": 1,
      "totalDays": 30,
      "startDate": "2025-01-08",
      "endDate": "2025-02-07",
      "installmentAmount": 383.33,
      "isActive": 1,
      "status": "ONGOING",
      "createdAt": "2025-01-08T10:00:00",
      "tenantName": "ABC Company",
      "customerName": "Customer One",
      "customerPhone": "+1111111111",
      "collectionType": "Daily",
      "collectionPeriod": 1
    }
  ]
}
```

### 2. Get Loans by Customer (Collectioner Can Access)

```bash
curl http://localhost:3000/api/loans/customer/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Loan Statistics (Collectioner Can Access)

```bash
curl http://localhost:3000/api/loans/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLoans": 15,
    "ongoingLoans": 10,
    "completedLoans": 3,
    "pendingLoans": 2,
    "totalPrincipal": 150000.00,
    "totalInterest": 22500.00,
    "totalDisbursed": 172500.00
  }
}
```

### 4. Create Loan (Admin/Manager Only)

```bash
curl -X POST http://localhost:3000/api/loans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "principal": 10000.00,
    "interest": 1500.00,
    "disbursedAmount": 11500.00,
    "loanTypeId": 1,
    "totalDays": 30,
    "startDate": "2025-01-08",
    "endDate": "2025-02-07",
    "installmentAmount": 383.33,
    "status": "ONGOING"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Loan created successfully",
  "data": {
    "id": 5,
    "tenantId": 1,
    "customerId": 1,
    "principal": 10000.00,
    "interest": 1500.00,
    "disbursedAmount": 11500.00,
    "loanTypeId": 1,
    "totalDays": 30,
    "startDate": "2025-01-08",
    "endDate": "2025-02-07",
    "installmentAmount": 383.33,
    "status": "ONGOING",
    "tenantName": "ABC Company",
    "customerName": "Customer One",
    "collectionType": "Daily"
  }
}
```

### 5. Update Loan Status (Admin/Manager Only)

```bash
curl -X PATCH http://localhost:3000/api/loans/1/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
```

### 6. Get Loans by Status

```bash
curl http://localhost:3000/api/loans/status/ONGOING \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Collectioner Tries to Create (DENIED)

```bash
curl -X POST http://localhost:3000/api/loans \
  -H "Authorization: Bearer YOUR_COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "principal": 5000.00,
    "interest": 500.00,
    "disbursedAmount": 5500.00,
    "loanTypeId": 1,
    "totalDays": 30,
    "startDate": "2025-01-08",
    "endDate": "2025-02-07",
    "installmentAmount": 183.33
  }'
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied: This endpoint requires one of the following roles: admin, manager"
}
```

---

## 📊 Loan Status Enum

| Status | Description | Use Case |
|--------|-------------|----------|
| `ONGOING` | Loan is active | Default for new loans |
| `COMPLETED` | Loan fully paid | All installments collected |
| `PENDING` | Loan approved, not disbursed | Awaiting disbursement |
| `NIL` | Loan cancelled/void | Cancelled loans |

---

## 🎯 Features

✅ **Complete CRUD Operations**
- Create, Read, Update, Delete loans
- Soft delete support (deactivate)

✅ **Advanced Filtering**
- Get by customer
- Get by status
- Get active loans only

✅ **JOIN Queries**
- Returns tenant name
- Returns customer name and phone
- Returns collection type and period

✅ **Statistics Dashboard**
- Total loans count
- Loans by status
- Total principal/interest/disbursed

✅ **Role-Based Access**
- Admin/Manager: Full access
- Collectioner: Read-only

✅ **Tenant Isolation**
- Users see only their tenant's loans
- Auto-set tenantId from logged-in user

✅ **Validation**
- All required fields validated
- Status enum validation
- Tenant access validation

---

## 🧪 Testing Guide

### Test as Admin/Manager (Full Access)

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

ADMIN_TOKEN="your_access_token"

# View loans ✅
curl http://localhost:3000/api/loans \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# View by customer ✅
curl http://localhost:3000/api/loans/customer/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# View statistics ✅
curl http://localhost:3000/api/loans/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Create loan ✅
curl -X POST http://localhost:3000/api/loans \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "principal": 5000.00,
    "interest": 750.00,
    "disbursedAmount": 5750.00,
    "loanTypeId": 1,
    "totalDays": 30,
    "startDate": "2025-01-08",
    "endDate": "2025-02-07",
    "installmentAmount": 191.67
  }'

# Update status ✅
curl -X PATCH http://localhost:3000/api/loans/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'

# Delete loan ✅
curl -X DELETE http://localhost:3000/api/loans/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test as Collectioner (Read-Only)

```bash
# Login as collectioner
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"collectioner@example.com","password":"password123"}'

COLLECTIONER_TOKEN="your_access_token"

# View loans ✅ SUCCESS
curl http://localhost:3000/api/loans \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"

# View by customer ✅ SUCCESS
curl http://localhost:3000/api/loans/customer/1 \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"

# View statistics ✅ SUCCESS
curl http://localhost:3000/api/loans/stats \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"

# Create loan ❌ FORBIDDEN
curl -X POST http://localhost:3000/api/loans \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "principal": 5000}'
# Response: 403 Forbidden

# Update loan ❌ FORBIDDEN
curl -X PUT http://localhost:3000/api/loans/1 \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"principal": 6000}'
# Response: 403 Forbidden

# Delete loan ❌ FORBIDDEN
curl -X DELETE http://localhost:3000/api/loans/1 \
  -H "Authorization: Bearer $COLLECTIONER_TOKEN"
# Response: 403 Forbidden
```

---

## 📊 Loan Calculation Example

```javascript
// Example: Calculate loan details
const principal = 10000.00;
const interestRate = 0.15; // 15%
const totalDays = 30;

const interest = principal * interestRate; // 1500.00
const disbursedAmount = principal + interest; // 11500.00
const installmentAmount = disbursedAmount / totalDays; // 383.33

// Create loan
{
  "customerId": 1,
  "principal": 10000.00,
  "interest": 1500.00,
  "disbursedAmount": 11500.00,
  "loanTypeId": 1, // Daily collection
  "totalDays": 30,
  "startDate": "2025-01-08",
  "endDate": "2025-02-07",
  "installmentAmount": 383.33,
  "status": "ONGOING"
}
```

---

## 🎯 API Endpoints Summary

### Read Operations (All Roles Including Collectioner)

1. `GET /api/loans` - Get all loans
2. `GET /api/loans/active` - Get active loans
3. `GET /api/loans/:id` - Get loan by ID
4. `GET /api/loans/customer/:customerId` - Get customer's loans
5. `GET /api/loans/status/:status` - Get loans by status (ONGOING/COMPLETED/PENDING/NIL)
6. `GET /api/loans/stats` - Get loan statistics

### Write Operations (Admin/Manager Only)

7. `POST /api/loans` - Create new loan
8. `PUT /api/loans/:id` - Update loan
9. `PATCH /api/loans/:id/status` - Update loan status
10. `PATCH /api/loans/:id/deactivate` - Deactivate loan
11. `DELETE /api/loans/:id` - Delete loan

---

## 📈 Statistics Endpoint

The `/api/loans/stats` endpoint provides valuable insights:

```json
{
  "success": true,
  "data": {
    "totalLoans": 15,
    "ongoingLoans": 10,
    "completedLoans": 3,
    "pendingLoans": 2,
    "totalPrincipal": 150000.00,
    "totalInterest": 22500.00,
    "totalDisbursed": 172500.00
  }
}
```

**Use Cases:**
- Dashboard overview
- Financial reporting
- Performance tracking
- Loan portfolio analysis

---

## ✅ Verification Checklist

- [x] `loans` table created with exact schema
- [x] Sample data inserted (4 loans)
- [x] Model with all CRUD operations
- [x] Service with validation and filtering
- [x] Controller with proper error handling
- [x] Routes with role-based middleware
- [x] Swagger documentation complete
- [x] Admin can create/edit/delete ✅
- [x] Manager can create/edit/delete ✅
- [x] Collectioner can view only ✅
- [x] Collectioner cannot create/edit/delete ❌
- [x] Tenant isolation working ✅
- [x] JOIN queries return full details ✅
- [x] Statistics endpoint working ✅
- [x] Zero linter errors ✅

---

## 🎉 Summary

✅ **Loans table created** with all required fields  
✅ **Model layer** with complete CRUD + statistics  
✅ **Service layer** with validation and tenant filtering  
✅ **Controller layer** with proper error handling  
✅ **Routes** with role-based access control:
  - Admin/Manager: Full access (create/edit/delete)
  - Collectioner: Read-only (view all endpoints)
✅ **11 API endpoints** fully documented  
✅ **JOIN queries** - Returns tenant, customer, and loan type details  
✅ **Statistics** - Loan metrics for dashboards  
✅ **Status management** - ONGOING/COMPLETED/PENDING/NIL  
✅ **Swagger documentation** complete  
✅ **Zero linter errors** - Production ready  
✅ **Tenant isolation** - Secure multi-tenancy  

Your loans module is ready for production! 🎊

---

## 📖 Related Files

- Database: `database/loans_schema.sql`
- Model: `models/loanModel.js`
- Service: `services/loanService.js`
- Controller: `controllers/loanController.js`
- Routes: `routes/loanRoutes.js`
- API: `http://localhost:3000/api/loans`
- Swagger: `http://localhost:3000/api-docs`

## 📚 Documentation

View complete API documentation at: **http://localhost:3000/api-docs**

Look for the **"Loans"** tag in the Swagger interface.

