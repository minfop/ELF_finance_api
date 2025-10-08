# Authentication Setup Guide

## Quick Setup Steps

### 1. Install Dependencies

```bash
npm install jsonwebtoken bcryptjs
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=elf_finance
DB_PORT=3306

# JWT Configuration
JWT_SECRET=elf-finance-jwt-secret-key-2025-change-in-production
JWT_REFRESH_SECRET=elf-finance-refresh-secret-key-2025-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

**⚠️ Important:** Change the JWT secrets in production to strong, random values.

### 3. Update Database Schema

Run the SQL commands to add password field and create refresh_tokens table:

```bash
mysql -u root -p elf_finance < database/auth_schema.sql
```

Or manually run:

```sql
-- Add password column to users table
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) NOT NULL AFTER email;

-- Create refresh tokens table
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

-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
```

### 4. Create Test User

Create a test user with hashed password. You can use the API to create a user:

**POST** `/api/users`

```json
{
  "tenantId": 1,
  "name": "Test User",
  "roleId": 1,
  "email": "test@example.com",
  "phoneNumber": "+1234567890",
  "password": "password123",
  "isActive": 1
}
```

Or insert directly into database (password will be hashed automatically by the model):

```javascript
// Run this in Node.js console or create a seed script
const UserModel = require('./models/userModel');

async function createTestUser() {
  const userId = await UserModel.create({
    tenantId: 1,
    name: "Test User",
    roleId: 1,
    email: "test@example.com",
    phoneNumber: "+1234567890",
    password: "password123",
    isActive: 1
  });
  
  console.log('User created with ID:', userId);
}

createTestUser();
```

### 5. Start the Server

```bash
npm start
# or for development
npm run dev
```

### 6. Test Authentication

#### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "tenantId": 1,
      "name": "Test User",
      "roleId": 1,
      "email": "test@example.com"
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

#### Test Protected Endpoint

```bash
# Save the access token from login response
ACCESS_TOKEN="your_access_token_here"

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "tenantId": 1,
    "roleId": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### 7. Access Swagger Documentation

Open your browser and go to:

```
http://localhost:3000/api-docs
```

You'll see all authentication endpoints documented with examples.

## Common Issues and Solutions

### Issue: "password column doesn't exist"

**Solution:** Run the ALTER TABLE command to add the password column:

```sql
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL AFTER email;
```

### Issue: "refresh_tokens table doesn't exist"

**Solution:** Run the CREATE TABLE command from auth_schema.sql

### Issue: "Invalid email or password" (but credentials are correct)

**Solution:** Make sure the password in the database is properly hashed. If you inserted a plain text password, update it using the API or create a new user through the API.

### Issue: "Cannot find module 'jsonwebtoken'" or "'bcryptjs'"

**Solution:** Install the dependencies:

```bash
npm install jsonwebtoken bcryptjs
```

### Issue: "Token validation fails"

**Solution:** 
1. Check if JWT_SECRET in .env matches
2. Verify the token hasn't expired
3. Make sure the Authorization header format is: `Bearer <token>`

## Postman Collection Setup

1. Create a new collection in Postman
2. Add environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `accessToken`: (will be set automatically)
   - `refreshToken`: (will be set automatically)

3. Add login request:
   - Method: POST
   - URL: `{{baseUrl}}/api/auth/login`
   - Body:
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Tests (to save tokens):
     ```javascript
     const jsonData = pm.response.json();
     if (jsonData.success) {
       pm.environment.set("accessToken", jsonData.data.tokens.accessToken);
       pm.environment.set("refreshToken", jsonData.data.tokens.refreshToken);
     }
     ```

4. For protected routes, add Authorization header:
   - Type: Bearer Token
   - Token: `{{accessToken}}`

## Next Steps

1. **Implement Role Management:** Create role-based access control for different user types
2. **Add Rate Limiting:** Prevent brute force attacks on login
3. **Email Verification:** Add email verification for new users
4. **Password Reset:** Implement forgot password functionality
5. **2FA (Two-Factor Authentication):** Add extra security layer
6. **Audit Logging:** Log authentication events for security

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET and JWT_REFRESH_SECRET to strong random values
- [ ] Enable HTTPS only
- [ ] Set NODE_ENV=production
- [ ] Implement rate limiting on auth endpoints
- [ ] Add password strength validation
- [ ] Set up monitoring for failed login attempts
- [ ] Configure CORS properly
- [ ] Use httpOnly cookies for refresh tokens (more secure than localStorage)
- [ ] Implement token rotation on refresh
- [ ] Set up database backups
- [ ] Add logging for security events

## Support

For more information, see the full [Authentication Documentation](./AUTHENTICATION.md).

