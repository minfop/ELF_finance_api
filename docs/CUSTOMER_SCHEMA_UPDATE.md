# Customer Schema Update Documentation

## 🔄 Schema Changes

The customer table has been updated with new fields to support photo and document storage.

### New Schema

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
    FOREIGN KEY (tenantId) REFERENCES tenants(id),
    FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

### Changes Summary

| Field | Change | Description |
|-------|--------|-------------|
| **photo** | ✅ Added | LONGTEXT field for storing customer photo (base64 or URL) |
| **documents** | ✅ Added | LONGTEXT field for storing customer documents as JSON string |
| **createdBy** | ⚠️ Modified | Now NOT NULL (previously allowed NULL) |
| **address** | ❌ Removed | No longer part of schema |

---

## 📦 Updated Files

### 1. Database Schema
- ✅ `database/customers_and_subscriptions_schema.sql` - Updated schema
- ✅ `database/migrate_customers_schema.sql` - Migration script for existing databases

### 2. Model
- ✅ `models/customerModel.js`
  - Updated `findAll()` to include photo and documents
  - Updated `findById()` to include photo and documents
  - Updated `findByTenantId()` to include photo and documents
  - Updated `findActive()` to include photo and documents
  - Updated `create()` to handle photo and documents
  - Updated `update()` to handle photo and documents

### 3. Service
- ✅ `services/customerService.js`
  - Added validation for `createdBy` (now required)
  - Updated to handle photo and documents fields

### 4. Controller
- ✅ `controllers/customerController.js`
  - No changes needed (handles all fields automatically)

### 5. Routes/Swagger
- ✅ `routes/customerRoutes.js`
  - Updated Swagger schema documentation
  - Added photo and documents examples
  - Updated request/response examples

---

## 🚀 Migration Instructions

### For New Installations

Simply run the updated schema:

```bash
mysql -u root -p elf_finance < database/customers_and_subscriptions_schema.sql
```

### For Existing Installations

Run the migration script:

```bash
mysql -u root -p elf_finance < database/migrate_customers_schema.sql
```

This will:
1. ✅ Add `photo` column if it doesn't exist
2. ✅ Add `documents` column if it doesn't exist
3. ✅ Remove `address` column if it exists
4. ✅ Set `createdBy` to NOT NULL (updates NULL values to 1 first)

---

## 📝 Usage Examples

### Creating a Customer with Photo and Documents

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

### Response Format

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

### Updating Customer Photo

```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photo": "data:image/jpeg;base64,NEW_BASE64_DATA..."
  }'
```

### Updating Customer Documents

```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": "{\"id_card\":\"new_data\",\"contract\":\"new_data\",\"proof_of_address\":\"new_data\"}"
  }'
```

---

## 💾 Data Storage Recommendations

### Photo Field

The `photo` field can store:

1. **Base64 Encoded Image** (Recommended for small images)
   ```
   data:image/jpeg;base64,/9j/4AAQSkZJRg...
   ```

2. **Image URL** (Recommended for large images)
   ```
   https://cdn.example.com/customers/photo_123.jpg
   ```

3. **Relative Path**
   ```
   /uploads/customers/photo_123.jpg
   ```

**Recommendations:**
- ✅ For profile photos < 100KB: Store as base64
- ✅ For larger photos: Store in cloud storage (S3, Azure Blob) and save URL
- ✅ Consider image compression before storage
- ✅ Set max size limits (e.g., 5MB)

### Documents Field

The `documents` field should store a JSON string with document metadata:

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
    "url": "https://cdn.example.com/docs/contract_123.pdf",
    "uploadedAt": "2025-01-08T10:05:00Z",
    "size": 2048000
  },
  "proof_of_address": {
    "filename": "utility_bill.pdf",
    "data": "base64_encoded_content",
    "uploadedAt": "2025-01-08T10:10:00Z",
    "size": 512000
  }
}
```

**Recommendations:**
- ✅ Store small documents (< 1MB) as base64 in JSON
- ✅ Store large documents in cloud storage, keep URL in JSON
- ✅ Include metadata (filename, size, upload date)
- ✅ Validate document types on upload
- ✅ Set maximum total size limit

---

## 🔒 Security Considerations

### 1. File Upload Validation

```javascript
// Example validation middleware
const validateCustomerPhoto = (req, res, next) => {
  const { photo } = req.body;
  
  if (photo) {
    // Check if base64
    if (photo.startsWith('data:image/')) {
      // Extract base64 data
      const base64Data = photo.split(',')[1];
      const sizeInBytes = Buffer.from(base64Data, 'base64').length;
      
      // Max 5MB
      if (sizeInBytes > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Photo size exceeds 5MB limit'
        });
      }
      
      // Validate image type
      const mimeType = photo.split(';')[0].split(':')[1];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      
      if (!allowedTypes.includes(mimeType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image type. Allowed: JPEG, PNG'
        });
      }
    }
  }
  
  next();
};
```

### 2. Document Validation

```javascript
const validateCustomerDocuments = (req, res, next) => {
  const { documents } = req.body;
  
  if (documents) {
    try {
      const docs = JSON.parse(documents);
      
      // Validate structure
      for (const [key, doc] of Object.entries(docs)) {
        if (doc.data && doc.data.length > 10 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `Document ${key} exceeds 10MB limit`
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid documents JSON format'
      });
    }
  }
  
  next();
};
```

### 3. Access Control

- ✅ Only admin and manager can upload/update photos and documents
- ✅ Collectioner can only view (read-only)
- ✅ Enforce tenant-based access (users can only access their tenant's customer data)
- ✅ Log all document access for audit trail

---

## 📊 Database Size Considerations

### LONGTEXT Field Capacity

- **Maximum Size**: 4GB per field
- **Practical Limit**: 16MB per document recommended
- **Storage**: Stored outside the main table in separate pages

### Recommendations for Large-Scale Applications

1. **Use Cloud Storage for Large Files**
   - Store files in S3, Azure Blob, or Google Cloud Storage
   - Save only URLs in database
   - Reduces database size significantly
   - Better performance for large files

2. **Implement File Compression**
   - Compress images before base64 encoding
   - Use PDF compression for documents
   - Can reduce size by 50-70%

3. **Set Up Archival Strategy**
   - Move old customer data to archive tables
   - Keep active customers in main table
   - Set up periodic cleanup jobs

---

## 🧪 Testing

### Test Customer Creation

```bash
# Create customer with photo and documents
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "Test Customer",
    "phoneNumber": "+9999999999",
    "email": "test@example.com",
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "documents": "{\"test_doc\":\"base64_data\"}"
  }'
```

### Test Customer Retrieval

```bash
# Get customer by ID
curl http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Customer Update

```bash
# Update photo only
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photo": "data:image/jpeg;base64,NEW_DATA"
  }'
```

---

## ✅ Verification Checklist

After running the migration, verify:

- [ ] `photo` column exists in customers table
- [ ] `documents` column exists in customers table
- [ ] `createdBy` column is NOT NULL
- [ ] Existing customers have `createdBy` set to valid user ID
- [ ] Can create new customer with photo and documents
- [ ] Can update customer photo
- [ ] Can update customer documents
- [ ] API returns photo and documents in responses
- [ ] Swagger documentation shows new fields
- [ ] Role permissions still work correctly

---

## 📚 Related Documentation

- [Role Permissions](./ROLE_PERMISSIONS.md)
- [RBAC Quick Start](./RBAC_QUICK_START.md)
- [Authentication Guide](./AUTHENTICATION.md)

---

## 🎉 Summary

✅ **Photo field added** - Store customer photos as base64 or URLs  
✅ **Documents field added** - Store customer documents as JSON string  
✅ **createdBy made required** - Now tracks who created each customer  
✅ **Migration script created** - Easy upgrade for existing databases  
✅ **Swagger docs updated** - Complete API documentation  
✅ **All CRUD operations updated** - Full support for new fields  
✅ **Zero linter errors** - Clean, production-ready code  

Your customer schema is now updated and ready to handle photos and documents! 📸📄

