# Line Type Module - Complete CRUD Implementation

## Overview
Complete CRUD (Create, Read, Update, Delete) implementation for the `lineType` table with authentication, authorization, and tenant isolation.

---

## Database Schema

### Table Structure
```sql
CREATE TABLE lineType (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tenantId INT NOT NULL,
    loanTypeId INT NOT NULL,
    isActive BIT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessUsersId VARCHAR(100),
    FOREIGN KEY (tenantId) REFERENCES tenants(id),
    FOREIGN KEY (loanTypeId) REFERENCES loanType(id)
);
```

### Field Descriptions
- **id**: Auto-increment primary key
- **name**: Name of the line type (required)
- **tenantId**: Tenant ID (auto-filled from authentication token)
- **loanTypeId**: Reference to loan type (required)
- **isActive**: Active status flag (default: 1)
- **createdAt**: Automatic timestamp
- **accessUsersId**: Comma-separated user IDs with access permissions

---

## Files Created

### 1. Database Schema
**File**: `database/lineType_schema.sql`
- Table creation script
- Sample data inserts
- Foreign key constraints
- Indexes for performance

### 2. Model Layer
**File**: `models/lineTypeModel.js`
- `findAll()` - Get all line types with JOINs
- `findById(id)` - Get single line type
- `findByTenantId(tenantId)` - Get by tenant
- `findActive()` - Get all active line types
- `findActiveByTenant(tenantId)` - Get active by tenant
- `create(lineTypeData)` - Create new line type
- `update(id, lineTypeData)` - Update existing
- `softDelete(id)` - Soft delete (set isActive = 0)
- `delete(id)` - Hard delete

### 3. Service Layer
**File**: `services/lineTypeService.js`
- Business logic and validation
- Tenant access control
- Error handling
- Success/failure responses

**Methods**:
- `getAllLineTypes(userTenantId, userRole)`
- `getActiveLineTypes(userTenantId)`
- `getLineTypeById(id, userTenantId)`
- `createLineType(lineTypeData)`
- `updateLineType(id, lineTypeData, userTenantId)`
- `deactivateLineType(id, userTenantId)`
- `deleteLineType(id, userTenantId)`

### 4. Controller Layer
**File**: `controllers/lineTypeController.js`
- HTTP request/response handling
- Extract user info from token
- Status code management
- Error responses

### 5. Routes
**File**: `routes/lineTypeRoutes.js`
- RESTful API endpoints
- Role-based access control
- Swagger/OpenAPI documentation

---

## API Endpoints

### Base URL: `/api/line-types`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin, Manager, Collectioner | Get all line types (tenant filtered) |
| GET | `/active` | Admin, Manager, Collectioner | Get active line types only |
| GET | `/:id` | Admin, Manager, Collectioner | Get line type by ID |
| POST | `/` | Admin, Manager | Create new line type |
| PUT | `/:id` | Admin, Manager | Update line type |
| PATCH | `/:id/deactivate` | Admin, Manager | Deactivate line type |
| DELETE | `/:id` | Admin, Manager | Delete line type permanently |

---

## Security Features

### Authentication
- All endpoints require valid JWT token
- Token validation via `authenticateToken` middleware

### Authorization
- Role-based access control (RBAC)
- Admin and Manager: Full CRUD access
- Collectioner: Read-only access

### Tenant Isolation
- `tenantId` automatically extracted from JWT token
- Users can only access their own tenant's data
- Prevents cross-tenant data access

---

## API Usage Examples

### 1. Create Line Type
```http
POST /api/line-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Line Type A",
  "loanTypeId": 1,
  "isActive": true,
  "accessUsersId": "1,2,3"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Line type created successfully",
  "data": {
    "id": 1,
    "name": "Line Type A",
    "tenantId": 1,
    "loanTypeId": 1,
    "isActive": true,
    "accessUsersId": "1,2,3",
    "createdAt": "2025-10-12T10:00:00Z",
    "tenantName": "ABC Company",
    "collectionType": "Daily",
    "collectionPeriod": 100
  }
}
```

### 2. Get All Line Types
```http
GET /api/line-types
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Line Type A",
      "tenantId": 1,
      "loanTypeId": 1,
      "isActive": true,
      "accessUsersId": "1,2,3",
      "tenantName": "ABC Company",
      "collectionType": "Daily",
      "collectionPeriod": 100
    }
  ]
}
```

### 3. Get Active Line Types
```http
GET /api/line-types/active
Authorization: Bearer <token>
```

### 4. Get Line Type by ID
```http
GET /api/line-types/1
Authorization: Bearer <token>
```

### 5. Update Line Type
```http
PUT /api/line-types/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Line Type A",
  "loanTypeId": 2,
  "isActive": true,
  "accessUsersId": "1,2,3,4"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Line type updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Line Type A",
    "tenantId": 1,
    "loanTypeId": 2,
    "isActive": true,
    "accessUsersId": "1,2,3,4"
  }
}
```

### 6. Deactivate Line Type
```http
PATCH /api/line-types/1/deactivate
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Line type deactivated successfully"
}
```

### 7. Delete Line Type
```http
DELETE /api/line-types/1
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Line type deleted successfully"
}
```

---

## Validation Rules

### Required Fields for Creation:
- ✅ `name` - Cannot be empty
- ✅ `loanTypeId` - Must reference valid loan type
- ✅ `tenantId` - Auto-filled from token

### Optional Fields:
- `isActive` - Defaults to `true` (1)
- `accessUsersId` - Defaults to `null`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Name is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Line type not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching line types: [error details]"
}
```

---

## Features Implemented

✅ **CRUD Operations**: Complete Create, Read, Update, Delete
✅ **Tenant Isolation**: Automatic tenant filtering
✅ **Authentication**: JWT token validation
✅ **Authorization**: Role-based access control
✅ **Soft Delete**: Deactivate without removing data
✅ **Hard Delete**: Permanent removal
✅ **Data Relationships**: JOINs with tenants and loanType tables
✅ **Swagger Documentation**: Complete API documentation
✅ **Error Handling**: Comprehensive error messages
✅ **Validation**: Input validation for all operations

---

## Testing the API

### Using Swagger UI
1. Start the server
2. Navigate to `http://localhost:3000/api-docs`
3. Find "Line Types" section
4. Click "Authorize" and enter your JWT token
5. Test each endpoint

### Using Postman/Thunder Client
1. Import the endpoints
2. Set Authorization header: `Bearer <your-token>`
3. Test CRUD operations

### Using cURL
```bash
# Get all line types
curl -X GET http://localhost:3000/api/line-types \
  -H "Authorization: Bearer <your-token>"

# Create line type
curl -X POST http://localhost:3000/api/line-types \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Line Type A",
    "loanTypeId": 1,
    "isActive": true
  }'
```

---

## Database Relationships

```
lineType
├── BELONGS TO → tenants (via tenantId)
└── BELONGS TO → loanType (via loanTypeId)
```

### JOIN Query Example
```sql
SELECT lt.*, t.name as tenantName, ltype.collectionType
FROM lineType lt
LEFT JOIN tenants t ON lt.tenantId = t.id
LEFT JOIN loanType ltype ON lt.loanTypeId = ltype.id
WHERE lt.tenantId = ?
```

---

## Integration with Server

The line type routes are registered in `server.js`:
```javascript
const lineTypeRoutes = require('./routes/lineTypeRoutes');
app.use('/api/line-types', lineTypeRoutes);
```

---

## Summary

✅ **Complete CRUD API for Line Types**
✅ **Tenant Isolation & Security**
✅ **Role-Based Access Control**
✅ **Comprehensive Documentation**
✅ **Production-Ready Code**

All files follow the existing codebase patterns and are fully integrated with the authentication and authorization system.

