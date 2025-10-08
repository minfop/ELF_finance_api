# Authentication System Documentation

## Overview

The ELF Finance API uses JWT (JSON Web Token) based authentication with access and refresh token pairs. The system securely stores user credentials, validates tokens, and manages user sessions.

## Features

- ✅ JWT-based authentication
- ✅ Access token (short-lived, 1 hour default)
- ✅ Refresh token (long-lived, 7 days default)
- ✅ Token validation and verification
- ✅ Password hashing with bcrypt
- ✅ Session management
- ✅ Multi-device support
- ✅ Logout from single or all devices
- ✅ Password change functionality
- ✅ Role-based access control ready

## JWT Token Payload

Each access token contains the following information:

```json
{
  "userId": 1,
  "tenantId": 1,
  "roleId": 2,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234571490,
  "iss": "elf-finance-api",
  "aud": "elf-finance-client"
}
```

## Database Schema

### Users Table (Updated)

```sql
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) NOT NULL AFTER email;
```

### Refresh Tokens Table

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isRevoked BIT DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(255)),
  INDEX idx_user_id (userId)
);
```

## API Endpoints

### 1. Login

**POST** `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "tenantId": 1,
      "name": "John Doe",
      "roleId": 2,
      "email": "john.doe@example.com",
      "tenantName": "ABC Company",
      "roleName": "Admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": "1h"
    }
  }
}
```

### 2. Refresh Token

**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "1h"
  }
}
```

### 3. Validate Token

**POST** `/api/auth/validate`

**Headers:**
```
Authorization: Bearer <access_token>
```

Validate if an access token is still valid.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "userId": 1,
    "tenantId": 1,
    "roleId": 2,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "exp": 1234571490,
    "iat": 1234567890
  }
}
```

### 4. Logout

**POST** `/api/auth/logout`

Logout from current device by revoking refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 5. Logout All Devices

**POST** `/api/auth/logout-all`

**Headers:**
```
Authorization: Bearer <access_token>
```

Logout from all devices by revoking all refresh tokens.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out from 3 device(s)"
}
```

### 6. Change Password

**POST** `/api/auth/change-password`

**Headers:**
```
Authorization: Bearer <access_token>
```

Change user password (all sessions will be logged out).

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

### 7. Get Current User

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

Get current authenticated user information.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "tenantId": 1,
    "roleId": 2,
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

### 8. Get Active Sessions

**GET** `/api/auth/sessions`

**Headers:**
```
Authorization: Bearer <access_token>
```

Get all active sessions for the current user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "activeSessions": 2,
    "sessions": [
      {
        "id": 1,
        "createdAt": "2025-01-08T10:00:00.000Z",
        "expiresAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": 2,
        "createdAt": "2025-01-08T12:00:00.000Z",
        "expiresAt": "2025-01-15T12:00:00.000Z"
      }
    ]
  }
}
```

## Using Authentication in Your Routes

### Protect Routes with Authentication

```javascript
const { authenticateToken } = require('../middleware/authMiddleware');

// Protected route
router.get('/protected', authenticateToken, (req, res) => {
  // Access user information from req.user
  const { userId, tenantId, roleId, name, email } = req.user;
  
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});
```

### Check Tenant Access

```javascript
const { authenticateToken, checkTenantAccess } = require('../middleware/authMiddleware');

// Route that checks tenant access
router.get('/tenant/:tenantId/data', authenticateToken, checkTenantAccess, (req, res) => {
  // User can only access data for their own tenant
  res.json({ message: 'Tenant data' });
});
```

### Check User Role

```javascript
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// Only allow users with roleId 1 or 2
router.post('/admin/action', authenticateToken, checkRole([1, 2]), (req, res) => {
  res.json({ message: 'Admin action performed' });
});
```

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## Security Best Practices

1. **Store Tokens Securely on Client:**
   - Access token: Store in memory or httpOnly cookie
   - Refresh token: Store in httpOnly cookie (most secure)
   - Never store tokens in localStorage for production

2. **HTTPS Only:**
   - Always use HTTPS in production
   - Set secure flag on cookies

3. **Token Rotation:**
   - Access tokens expire in 1 hour
   - Refresh tokens expire in 7 days
   - Implement token rotation on refresh

4. **Password Requirements:**
   - Minimum 8 characters recommended
   - Use strong password validation
   - Passwords are hashed with bcrypt (10 rounds)

5. **Rate Limiting:**
   - Implement rate limiting on login endpoint
   - Prevent brute force attacks

## Client-Side Implementation Example

```javascript
// Login
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  }
  
  return data;
}

// Make authenticated request
async function makeAuthRequest(url) {
  const accessToken = localStorage.getItem('accessToken');
  
  let response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  // If token expired, refresh it
  if (response.status === 403) {
    const refreshToken = localStorage.getItem('refreshToken');
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const refreshData = await refreshResponse.json();
    
    if (refreshData.success) {
      localStorage.setItem('accessToken', refreshData.data.accessToken);
      
      // Retry original request
      response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${refreshData.data.accessToken}`
        }
      });
    }
  }
  
  return response.json();
}

// Logout
async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
```

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"password123"}'
```

### Make Authenticated Request
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Troubleshooting

### "Invalid or expired token"
- Check if token is expired
- Verify JWT_SECRET matches in environment
- Use refresh token to get new access token

### "Access token is required"
- Include Authorization header: `Bearer <token>`
- Ensure token is not null or undefined

### "Account is deactivated"
- User's isActive flag is set to 0
- Contact administrator to reactivate

### "Invalid email or password"
- Verify credentials
- Check if password is hashed in database
- Ensure user exists in database

## Files Structure

```
├── utils/
│   └── jwtUtils.js              # JWT token generation and validation
├── middleware/
│   └── authMiddleware.js        # Authentication and authorization middleware
├── models/
│   ├── authModel.js             # Refresh token database operations
│   └── userModel.js             # User operations with password handling
├── services/
│   └── authService.js           # Authentication business logic
├── controllers/
│   └── authController.js        # Authentication request handlers
└── routes/
    └── authRoutes.js            # Authentication API routes
```

## Summary

The authentication system is now fully implemented with:
- ✅ Login with email/password
- ✅ JWT access and refresh tokens
- ✅ Token validation
- ✅ Token refresh mechanism
- ✅ Logout (single and all devices)
- ✅ Password change
- ✅ Session management
- ✅ Protected routes middleware
- ✅ Role-based access control
- ✅ Tenant-based access control
- ✅ Complete Swagger documentation

All endpoints are available at `http://localhost:3000/api/auth` and documented in Swagger at `http://localhost:3000/api-docs`.

