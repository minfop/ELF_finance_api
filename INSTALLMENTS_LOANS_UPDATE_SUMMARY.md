# Installments & Loans Table Update - Complete Implementation

## Overview
Major update to installments and loans tables to support better payment tracking and automatic balance calculations.

---

## Database Changes

### 1. Installments Table Schema

**Old Structure:**
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
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**New Structure:**
```sql
CREATE TABLE installments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loanId INT NOT NULL,
  tenantId INT NOT NULL,
  dueAt DATE NOT NULL,  -- ✅ RENAMED from 'date'
  amount DECIMAL(15,2) NOT NULL,
  remainAmount DECIMAL(15,2) NOT NULL,  -- ✅ NEW: auto-calculated
  cashInHand DECIMAL(15,2) NOT NULL DEFAULT 0,  -- ✅ NEW: from user
  cashInOnline DECIMAL(15,2) NOT NULL DEFAULT 0,  -- ✅ NEW: from user
  status ENUM('PAID','MISSED','PARTIALLY') DEFAULT 'MISSED',  -- ✅ UPDATED: added 'PARTIALLY'
  collectedBy INT NOT NULL,  -- ✅ UPDATED: NOT NULL, from token
  nextDue TIMESTAMP NULL,  -- ✅ NEW: auto-calculated
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- ✅ System date
);
```

---

### 2. Loans Table Schema

**Added Columns:**
```sql
ALTER TABLE loans ADD COLUMN totalAmount DECIMAL(15,2) NOT NULL;
ALTER TABLE loans ADD COLUMN balanceAmount DECIMAL(15,2) NOT NULL;
```

**Complete Structure:**
```sql
CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ...existing columns...,
  totalAmount DECIMAL(15,2) NOT NULL,  -- ✅ NEW: auto-calculated
  balanceAmount DECIMAL(15,2) NOT NULL,  -- ✅ NEW: auto-calculated
  ...
);
```

---

## Field Calculations

### Installments

| Field | Source | Calculation Logic |
|-------|---------|-------------------|
| **loanId** | User Input | Required |
| **amount** | User Input | Required |
| **cashInHand** | User Input | Optional, default 0 |
| **cashInOnline** | User Input | Optional, default 0 |
| **tenantId** | Token | `req.user.tenantId` |
| **collectedBy** | Token | `req.user.userId` |
| **dueAt** | System | `CURDATE()` - current date |
| **createdAt** | System | `CURRENT_TIMESTAMP` |
| **remainAmount** | Auto-calculated | `amount - (cashInHand + cashInOnline)` |
| **status** | Auto-calculated | Based on remainAmount:<br>- `PAID` if remainAmount ≤ 0<br>- `PARTIALLY` if 0 < remainAmount < amount<br>- `MISSED` if remainAmount = amount |
| **nextDue** | Auto-calculated | Based on loan's collectionType:<br>- DAILY: currentDate + collectionPeriod days<br>- WEEKLY: currentDate + (collectionPeriod × 7) days<br>- MONTHLY: currentDate + collectionPeriod months |

### Loans

| Field | Calculation Logic |
|-------|-------------------|
| **totalAmount** | - If `isInterestPreDetection = true`: `principal`<br>- If `isInterestPreDetection = false`: `principal + interest` |
| **balanceAmount** | - Initial: equals `totalAmount`<br>- Updates: `current balanceAmount - totalPaid` (when installment is paid) |

---

## API Changes

### Create Installment

**Request Body (User Provides):**
```json
{
  "loanId": 1,              // ✅ Required
  "amount": 383.33,         // ✅ Required
  "cashInHand": 200.00,     // ✅ Optional (default 0)
  "cashInOnline": 183.33    // ✅ Optional (default 0)
}
```

**Auto-Generated Fields:**
```javascript
{
  "tenantId": 7,           // ✅ From req.user.tenantId
  "collectedBy": 9,        // ✅ From req.user.userId
  "dueAt": "2025-10-15",   // ✅ System date (today)
  "remainAmount": 0,       // ✅ 383.33 - (200 + 183.33) = 0
  "status": "PAID",        // ✅ remainAmount = 0
  "nextDue": "2025-10-16 00:00:00",  // ✅ Based on loanType collectionPeriod
  "createdAt": "2025-10-15 10:30:00" // ✅ System timestamp
}
```

**Complete Response:**
```json
{
  "success": true,
  "message": "Installment created successfully",
  "data": {
    "id": 5,
    "loanId": 1,
    "tenantId": 7,
    "dueAt": "2025-10-15",
    "amount": 383.33,
    "remainAmount": 0,
    "cashInHand": 200.00,
    "cashInOnline": 183.33,
    "status": "PAID",
    "collectedBy": 9,
    "collectedByName": "Priya",
    "nextDue": "2025-10-16T00:00:00.000Z",
    "createdAt": "2025-10-15T05:00:00.000Z",
    "loanPrincipal": 10000,
    "customerName": "John Doe",
    "customerPhone": "+1234567890"
  }
}
```

---

## Examples

### Example 1: Full Payment
```json
POST /api/installments
{
  "loanId": 1,
  "amount": 1000,
  "cashInHand": 500,
  "cashInOnline": 500
}
```

**Result:**
- remainAmount: 0 (1000 - 1000)
- status: "PAID"
- Loan balanceAmount: reduced by 1000

---

### Example 2: Partial Payment
```json
POST /api/installments
{
  "loanId": 1,
  "amount": 1000,
  "cashInHand": 300,
  "cashInOnline": 200
}
```

**Result:**
- remainAmount: 500 (1000 - 500)
- status: "PARTIALLY"
- Loan balanceAmount: reduced by 500

---

### Example 3: No Payment (Missed)
```json
POST /api/installments
{
  "loanId": 1,
  "amount": 1000,
  "cashInHand": 0,
  "cashInOnline": 0
}
```

**Result:**
- remainAmount: 1000 (1000 - 0)
- status: "MISSED"
- Loan balanceAmount: unchanged

---

## Implementation Status

### ✅ Completed

1. ✅ Updated installments schema
2. ✅ Updated loans schema (added totalAmount, balanceAmount)
3. ✅ Updated loan model (all SELECT, INSERT, UPDATE queries)
4. ✅ Updated loan service (auto-calculate totalAmount and balanceAmount)
5. ✅ Updated installment model (all SELECT, INSERT, UPDATE queries)
6. ✅ Updated installment service (auto-calculate logic):
   - remainAmount calculation
   - status determination
   - nextDue calculation based on loanType
   - Loan balanceAmount updates

### 🔄 In Progress

7. 🔄 Update installment controller (extract tenantId and collectedBy from token)
8. 🔄 Update installment routes (Swagger documentation)
9. 🔄 Update loan routes (document new fields)

---

## Files Modified

| File | Status | Changes |
|------|--------|---------|
| `database/installments_schema.sql` | ✅ | New structure with 5 new columns |
| `database/loans_schema.sql` | ✅ | Added totalAmount, balanceAmount |
| `models/loanModel.js` | ✅ | All SELECTs + INSERT + UPDATE |
| `services/loanService.js` | ✅ | Auto-calculate totalAmount, balanceAmount |
| `models/installmentModel.js` | ✅ | All SELECTs + INSERT + UPDATE + new methods |
| `services/installmentService.js` | ✅ | Auto-calculation logic + validation |
| `controllers/installmentController.js` | 🔄 | Extract token data |
| `routes/installmentRoutes.js` | 🔄 | Update Swagger docs |
| `routes/loanRoutes.js` | 🔄 | Document new fields |

---

## Next Steps

1. Update installment controller to extract `tenantId` and `collectedBy` from token
2. Update installment routes Swagger documentation
3. Update loan routes Swagger documentation
4. Test all endpoints
5. Create migration SQL scripts for existing databases

---

## Migration SQL (For Existing Databases)

```sql
-- Update installments table
ALTER TABLE installments 
  CHANGE COLUMN date dueAt DATE NOT NULL;

ALTER TABLE installments 
  ADD COLUMN remainAmount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER amount,
  ADD COLUMN cashInHand DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER remainAmount,
  ADD COLUMN cashInOnline DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER cashInHand,
  ADD COLUMN nextDue TIMESTAMP NULL AFTER collectedBy,
  MODIFY COLUMN status ENUM('PAID','MISSED','PARTIALLY') DEFAULT 'MISSED',
  MODIFY COLUMN collectedBy INT NOT NULL,
  DROP COLUMN collectedAt;

-- Update loans table
ALTER TABLE loans
  ADD COLUMN totalAmount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER initialDeduction,
  ADD COLUMN balanceAmount DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER totalAmount;

-- Migrate existing data (set totalAmount = principal + interest for now)
UPDATE loans SET 
  totalAmount = principal + interest,
  balanceAmount = principal + interest;
```

---

## Testing Checklist

- [ ] Create installment with full payment (status should be PAID)
- [ ] Create installment with partial payment (status should be PARTIALLY)
- [ ] Create installment with no payment (status should be MISSED)
- [ ] Verify tenantId is taken from token
- [ ] Verify collectedBy is taken from token
- [ ] Verify dueAt is set to current date
- [ ] Verify nextDue is calculated correctly for DAILY loans
- [ ] Verify nextDue is calculated correctly for WEEKLY loans
- [ ] Verify nextDue is calculated correctly for MONTHLY loans
- [ ] Verify loan balanceAmount decreases after payment
- [ ] Verify remainAmount calculation is correct
- [ ] Verify totalAmount is set correctly for new loans
- [ ] Verify balanceAmount starts at totalAmount for new loans

---

## Status: 60% Complete

Remaining work focused on controller and routes documentation updates.

