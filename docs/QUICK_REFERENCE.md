# Quick Reference Guide

## 🚀 Quick Start

### 1. Login
```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Use Access Token
```bash
GET /api/auth/me
Headers: Authorization: Bearer <accessToken>
```

### 3. Refresh Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "<refreshToken>"
}
```

## 📋 JWT Token Payload

```json
{
  "userId": 1,
  "tenantId": 1,
  "roleId": 2,
  "name": "John Doe",
  "email": "john@example.com",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234571490,
  "iss": "elf-finance-api",
  "aud": "elf-finance-client"
}
```

## 🔐 Authentication Middleware

### Protect a Route
```javascript
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains: { userId, tenantId, roleId, name, email }
  res.json({ user: req.user });
});
```

### Check Tenant Access
```javascript
const { authenticateToken, checkTenantAccess } = require('../middleware/authMiddleware');

router.get('/tenant/:tenantId/data', 
  authenticateToken, 
  checkTenantAccess, 
  (req, res) => {
    res.json({ data: 'tenant data' });
  }
);
```

### Check User Role
```javascript
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// Only roleId 1 and 2 can access
router.post('/admin', 
  authenticateToken, 
  checkRole([1, 2]), 
  (req, res) => {
    res.json({ message: 'Admin action' });
  }
);
```

## 🛠️ Utility Functions

### Generate Tokens
```javascript
const JWTUtils = require('../utils/jwtUtils');

const tokens = JWTUtils.generateTokenPair({
  userId: 1,
  tenantId: 1,
  roleId: 2,
  name: "John Doe",
  email: "john@example.com"
});

// Returns: { accessToken, refreshToken, tokenType, expiresIn }
```

### Verify Token
```javascript
const result = JWTUtils.verifyAccessToken(token);

if (result.valid) {
  console.log(result.decoded);
} else {
  console.log(result.error);
}
```

## 📊 Database Operations

### User Model
```javascript
const UserModel = require('../models/userModel');

// Find with password (for login)
const user = await UserModel.findByEmailWithPassword(email);

// Compare password
const isValid = await UserModel.comparePassword(password, user.password);

// Hash password
const hashed = await UserModel.hashPassword(password);

// Update password
await UserModel.updatePassword(userId, newPassword);
```

### Auth Model
```javascript
const AuthModel = require('../models/authModel');

// Store refresh token
await AuthModel.storeRefreshToken(userId, token, expiresAt);

// Find refresh token
const token = await AuthModel.findRefreshToken(tokenString);

// Revoke token
await AuthModel.revokeRefreshToken(tokenString);

// Revoke all user tokens
await AuthModel.revokeAllUserTokens(userId);

// Check if valid
const isValid = await AuthModel.isTokenValid(tokenString);
```

## 🌐 API Endpoints Quick List

### Authentication
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh token |
| POST | `/api/auth/validate` | No* | Validate token |
| POST | `/api/auth/logout` | No | Logout |
| POST | `/api/auth/logout-all` | Yes | Logout all |
| POST | `/api/auth/change-password` | Yes | Change password |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/auth/sessions` | Yes | Get sessions |

*Token sent in Authorization header

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/active` | Get active users |
| GET | `/api/users/tenant/:tenantId` | Get users by tenant |
| GET | `/api/users/role/:roleId` | Get users by role |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| PATCH | `/api/users/:id/deactivate` | Deactivate user |
| DELETE | `/api/users/:id` | Delete user |

### Tenants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants` | Get all tenants |
| GET | `/api/tenants/active` | Get active tenants |
| GET | `/api/tenants/:id` | Get tenant by ID |
| POST | `/api/tenants` | Create tenant |
| PUT | `/api/tenants/:id` | Update tenant |
| PATCH | `/api/tenants/:id/deactivate` | Deactivate tenant |
| DELETE | `/api/tenants/:id` | Delete tenant |

## ⚙️ Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=elf_finance
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "John Doe",
    "roleId": 2,
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

## 🔑 HTTP Status Codes

- **200** - OK (successful request)
- **201** - Created (resource created)
- **400** - Bad Request (invalid input)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource not found)
- **500** - Internal Server Error (server error)

## 📚 Full Documentation

- [Complete Authentication Guide](./AUTHENTICATION.md)
- [Setup Guide](./AUTH_SETUP.md)
- [API Documentation](http://localhost:3000/api-docs)
- [Main README](../README.md)

## 🎯 Common Tasks

### Create a Protected Route
```javascript
// In your routes file
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/my-route', authenticateToken, myController.myMethod);
```

### Access User Info in Controller
```javascript
async myMethod(req, res) {
  const { userId, tenantId, roleId, name, email } = req.user;
  // Use user info...
}
```

### Create User with Password
```javascript
await UserModel.create({
  tenantId: 1,
  name: "John Doe",
  roleId: 2,
  email: "john@example.com",
  password: "password123",  // Will be hashed automatically
  phoneNumber: "+1234567890",
  isActive: 1
});
```

### Login Flow (Client-Side)
```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { data } = await loginResponse.json();

// 2. Store tokens
localStorage.setItem('accessToken', data.tokens.accessToken);
localStorage.setItem('refreshToken', data.tokens.refreshToken);

// 3. Make authenticated request
const response = await fetch('/api/auth/me', {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
  }
});
```

## ⚡ Tips

1. **Always use HTTPS in production**
2. **Store refresh tokens in httpOnly cookies** (more secure than localStorage)
3. **Implement rate limiting** on auth endpoints
4. **Use strong JWT secrets** (at least 32 characters)
5. **Monitor failed login attempts**
6. **Set up token rotation** on refresh
7. **Log security events**
8. **Validate token expiry** on client side
9. **Clear tokens on logout**
10. **Handle 401/403 errors** to redirect to login

## 🐛 Debugging

### Token Issues
```javascript
// Decode token without verification (for debugging)
const decoded = JWTUtils.decodeToken(token);
console.log(decoded);
```

### Check Token Validity
```bash
# Validate token
curl -X POST http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Active Sessions
```bash
curl http://localhost:3000/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

