# Customer Schema Update - Implementation Summary

## ✅ Implementation Complete!

The customer table has been successfully updated with new fields for photo and document storage.

---

## 📋 Changes Made

### Database Schema

**Old Schema:**
```sql
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phoneNumber VARCHAR(20),
    address TEXT,                    -- ❌ REMOVED
    isActive BIT,
    createdAt DATE,
    createdBy INT,                   -- Was nullable
    ...
);
```

**New Schema:**
```sql
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenantId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20),
    email VARCHAR(100) DEFAULT NULL,
    photo LONGTEXT DEFAULT NULL,           -- ⭐ NEW
    documents LONGTEXT DEFAULT NULL,       -- ⭐ NEW
    isActive BIT,
    createdAt DATE,
    createdBy INT NOT NULL,                -- ⚠️ NOW NOT NULL
    ...
);
```

### Changes Summary

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| `photo` | LONGTEXT | ✅ Added | Store customer photo (base64 or URL) |
| `documents` | LONGTEXT | ✅ Added | Store customer documents as JSON |
| `createdBy` | INT | ⚠️ Modified | Now NOT NULL (was nullable) |
| `address` | TEXT | ❌ Removed | No longer in schema |

---

## 📦 Updated Files

### 1. Database Files (3 files)
- ✅ `database/customers_and_subscriptions_schema.sql` - Updated schema
- ✅ `database/migrate_customers_schema.sql` - Migration script
- ✅ `docs/CUSTOMER_SCHEMA_UPDATE.md` - Complete documentation

### 2. Model
- ✅ `models/customerModel.js`
  - All queries updated to include `photo` and `documents`
  - `create()` method updated
  - `update()` method updated
  - Removed `address` field handling

### 3. Service
- ✅ `services/customerService.js`
  - Added validation for `createdBy` (required)
  - No other changes needed (handles all fields)

### 4. Controller
- ✅ `controllers/customerController.js`
  - No changes needed (automatically handles all fields)

### 5. Routes
- ✅ `routes/customerRoutes.js`
  - Updated Swagger documentation
  - Added `photo` and `documents` to schemas
  - Updated examples with new fields
  - Added detailed field descriptions

---

## 🚀 Quick Setup

### For New Installations

```bash
mysql -u root -p elf_finance < database/customers_and_subscriptions_schema.sql
```

### For Existing Installations

```bash
mysql -u root -p elf_finance < database/migrate_customers_schema.sql
```

The migration script will:
1. ✅ Add `photo` column
2. ✅ Add `documents` column
3. ✅ Remove `address` column
4. ✅ Make `createdBy` NOT NULL (sets NULL values to 1 first)

---

## 💡 Usage Examples

### Create Customer with Photo & Documents

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "documents": "{\"id_card\":\"base64_data\",\"contract\":\"base64_data\"}"
  }'
```

### Response

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 1,
    "tenantId": 1,
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "documents": "{\"id_card\":\"base64_data\",\"contract\":\"base64_data\"}",
    "isActive": true,
    "createdAt": "2025-01-08",
    "createdBy": 1,
    "tenantName": "ABC Company",
    "createdByName": "Admin User"
  }
}
```

### Update Customer Photo

```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photo": "data:image/jpeg;base64,NEW_PHOTO_DATA..."
  }'
```

### Update Customer Documents

```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": "{\"id_card\":\"new_data\",\"contract\":\"new_data\"}"
  }'
```

---

## 📝 Field Details

### Photo Field (LONGTEXT)

**Can Store:**
- Base64 encoded images: `data:image/jpeg;base64,/9j/...`
- URLs: `https://cdn.example.com/photo.jpg`
- Relative paths: `/uploads/customer_123.jpg`

**Recommendations:**
- Small photos (< 100KB): Store as base64
- Large photos: Store in cloud (S3, Azure) and save URL
- Max size: 5MB recommended

### Documents Field (LONGTEXT)

**Should Store JSON String:**
```json
{
  "id_card": {
    "filename": "id_card.pdf",
    "data": "base64_encoded_content",
    "uploadedAt": "2025-01-08T10:00:00Z",
    "size": 1024000
  },
  "contract": {
    "filename": "contract.pdf",
    "url": "https://cdn.example.com/contract.pdf",
    "uploadedAt": "2025-01-08T10:05:00Z",
    "size": 2048000
  }
}
```

**Recommendations:**
- Small documents (< 1MB): Store as base64
- Large documents: Store in cloud, save URL
- Include metadata (filename, size, date)
- Max size per document: 10MB recommended

---

## 🔒 Role Permissions (Unchanged)

The role-based access control remains the same:

| Role | Customers Access |
|------|------------------|
| **Admin** | ✅ Full access (view/create/edit/delete) in own tenant |
| **Manager** | ✅ Full access (view/create/edit/delete) in own tenant |
| **Collectioner** | ✅ View only (read-only) in own tenant |
| **Monsters** | ✅ Full access across all tenants |

---

## ✅ Verification

Run these commands to verify the update:

### 1. Check Database Schema
```sql
DESCRIBE customers;
```

Expected output should show:
- ✅ `photo` LONGTEXT field
- ✅ `documents` LONGTEXT field
- ✅ `createdBy` INT NOT NULL
- ❌ No `address` field

### 2. Test API Endpoints

```bash
# Get customers (should return new fields)
curl http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create with photo and documents
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Test Customer",
    "phoneNumber": "+9999999999",
    "photo": "test_photo_data",
    "documents": "{\"test\":\"data\"}"
  }'
```

### 3. Check Swagger Docs

Visit: http://localhost:3000/api-docs

Verify Customer schema shows:
- ✅ `photo` field
- ✅ `documents` field
- ✅ Updated examples

---

## 🎯 Migration Checklist

- [ ] Backup your database before migration
- [ ] Run migration script: `database/migrate_customers_schema.sql`
- [ ] Verify schema changes with `DESCRIBE customers;`
- [ ] Test API endpoints with new fields
- [ ] Check Swagger documentation
- [ ] Test with all roles (admin, manager, collectioner)
- [ ] Verify existing customers still accessible
- [ ] Test creating customer with photo
- [ ] Test creating customer with documents
- [ ] Test updating photo and documents

---

## 📚 Documentation

Complete documentation available in:
- `docs/CUSTOMER_SCHEMA_UPDATE.md` - Full guide with examples
- `docs/ROLE_PERMISSIONS.md` - Role-based access control
- Swagger: http://localhost:3000/api-docs

---

## 🎉 Summary

✅ **Photo field added** - LONGTEXT for customer photos  
✅ **Documents field added** - LONGTEXT for customer documents  
✅ **createdBy now required** - Tracks who created each customer  
✅ **Address field removed** - No longer part of schema  
✅ **Migration script provided** - Easy upgrade path  
✅ **All files updated** - Model, service, controller, routes  
✅ **Swagger docs updated** - Complete API documentation  
✅ **Zero linter errors** - Production-ready code  
✅ **Role permissions maintained** - Access control unchanged  

Your customer schema is fully updated and ready to handle photos and documents! 🎊

