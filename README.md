# ELF Finance API

A RESTful API built with Node.js, Express, MySQL, and Swagger documentation for the ELF Finance application.

## Features

- ✅ RESTful API with Express.js
- ✅ MySQL database integration with connection pooling
- ✅ Swagger/OpenAPI documentation
- ✅ CORS enabled
- ✅ Environment variable configuration
- ✅ Error handling middleware
- ✅ **JWT Authentication & Authorization**
- ✅ **Access & Refresh Token Management**
- ✅ **Password Hashing with Bcrypt**
- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Multi-Tenant Support**
- ✅ CRUD operations for tenants, users, and roles
- ✅ Input validation
- ✅ Session management

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/) (v5.7 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/minfop/ELF_finance_api.git
cd ELF_finance_api
```

2. Install dependencies:
```bash
npm install
```

> The project includes authentication packages: `jsonwebtoken` and `bcryptjs`

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secrets in `.env`:
   ```
   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=elf_finance
   DB_PORT=3306
   
   # JWT (change these in production!)
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. Set up the MySQL database:
   - Open MySQL command line or any MySQL client
   - Run the SQL scripts:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p elf_finance < database/auth_schema.sql
   ```
   Or manually execute the SQL commands in both files
   
   > `auth_schema.sql` adds password field to users and creates refresh_tokens table

## Running the Application

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

Once the server is running, you can access the Swagger API documentation at:

```
http://localhost:3000/api-docs
```

This interactive documentation allows you to:
- View all available endpoints
- Test API calls directly from the browser
- See request/response schemas
- Understand required parameters

## API Endpoints

### Home
- `GET /` - Welcome message and API information

### Authentication 🔐
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/validate` - Validate access token
- `POST /api/auth/logout` - Logout (revoke refresh token)
- `POST /api/auth/logout-all` - Logout from all devices (requires auth)
- `POST /api/auth/change-password` - Change password (requires auth)
- `GET /api/auth/me` - Get current user info (requires auth)
- `GET /api/auth/sessions` - Get active sessions (requires auth)

### Tenants
- `GET /api/tenants` - Get all tenants (Monsters only)
- `GET /api/tenants/active` - Get active tenants
- `GET /api/tenants/:id` - Get a specific tenant by ID
- `POST /api/tenants` - Create a new tenant (auto-creates admin user) ⭐
- `PUT /api/tenants/:id` - Update a tenant
- `PATCH /api/tenants/:id/deactivate` - Deactivate a tenant
- `DELETE /api/tenants/:id` - Delete a tenant

### Users
- `GET /api/users` - Get all users
- `GET /api/users/active` - Get active users
- `GET /api/users/tenant/:tenantId` - Get users by tenant
- `GET /api/users/role/:roleId` - Get users by role
- `GET /api/users/:id` - Get a specific user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `PATCH /api/users/:id/deactivate` - Deactivate a user
- `DELETE /api/users/:id` - Delete a user

### Example API Calls

#### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

#### Access Protected Endpoint:
```bash
# Use the access token from login response
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get all users:
```bash
curl http://localhost:3000/api/users
```

#### Create a new tenant (with auto-admin user):
```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Company",
    "phoneNumber": "+1234567890",
    "adminName": "Admin User",
    "adminEmail": "admin@newcompany.com",
    "adminPassword": "SecurePass123!"
  }'
```

#### Create a new user:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "name": "John Doe",
    "roleId": 2,
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "password": "password123"
  }'
```

#### Refresh Token:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

For more examples, see [Authentication Documentation](./docs/AUTHENTICATION.md)

## Project Structure

```
ELF_finance_api/
├── config/
│   ├── database.js          # MySQL database configuration
│   └── swagger.js           # Swagger documentation setup
├── controllers/
│   ├── authController.js    # Authentication controllers
│   ├── tenantController.js  # Tenant controllers
│   └── userController.js    # User controllers
├── database/
│   ├── auth_schema.sql      # Authentication tables schema
│   └── schema.sql           # Database schema and sample data
├── docs/
│   ├── AUTHENTICATION.md    # Complete authentication guide
│   └── AUTH_SETUP.md        # Quick setup guide
├── middleware/
│   └── authMiddleware.js    # JWT authentication middleware
├── models/
│   ├── authModel.js         # Refresh token operations
│   ├── tenantModel.js       # Tenant database operations
│   └── userModel.js         # User database operations
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── tenantRoutes.js      # Tenant routes
│   └── userRoutes.js        # User routes
├── services/
│   ├── authService.js       # Authentication business logic
│   ├── tenantService.js     # Tenant business logic
│   └── userService.js       # User business logic
├── utils/
│   └── jwtUtils.js          # JWT token utilities
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
├── README.md                # Project documentation
└── server.js                # Main application entry point
```

## Database Schema

### Tenants Table
```sql
CREATE TABLE tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(20),
  isActive BIT DEFAULT 1,
  createdAt DATE
);
```

### Roles Table
```sql
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255)
);
```

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenantId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  roleId INT NOT NULL,
  phoneNumber VARCHAR(20),
  email VARCHAR(100) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  isActive BIT,
  createdAt DATE,
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (roleId) REFERENCES roles(id)
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isRevoked BIT DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - MySQL client for Node.js
- **JWT (jsonwebtoken)** - Token-based authentication
- **Bcrypt.js** - Password hashing
- **Swagger UI Express** - API documentation
- **Swagger JSDoc** - Generate Swagger docs from JSDoc comments
- **dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing middleware
- **Nodemon** - Development auto-restart tool

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | MySQL database name | elf_finance |
| DB_PORT | MySQL port | 3306 |
| JWT_SECRET | Secret key for access tokens | - |
| JWT_REFRESH_SECRET | Secret key for refresh tokens | - |
| JWT_EXPIRES_IN | Access token expiration | 1h |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration | 7d |

## Authentication & Authorization

The API uses **JWT (JSON Web Token)** for authentication:

1. **Login** to get access and refresh tokens
2. **Include access token** in Authorization header for protected routes:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```
3. **Refresh** the access token using refresh token when expired
4. **Logout** to revoke refresh tokens

### JWT Token Payload

Access tokens contain:
- `userId` - User ID
- `tenantId` - Tenant ID (for multi-tenancy)
- `roleId` - Role ID (for RBAC)
- `name` - User name
- `email` - User email

### Protected Routes

Use the authentication middleware to protect routes:

```javascript
const { authenticateToken } = require('./middleware/authMiddleware');

router.get('/protected', authenticateToken, (req, res) => {
  // Access user info from req.user
  res.json({ user: req.user });
});
```

For complete authentication documentation, see [Authentication Guide](./docs/AUTHENTICATION.md) and [Setup Guide](./docs/AUTH_SETUP.md).

## Error Handling

The API includes comprehensive error handling:

- **400** - Bad Request (invalid input)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (valid token but insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error (database/server errors)

All errors return a JSON response with the following structure:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@elffinance.com or open an issue in the repository.

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify database credentials in `.env`
- Check if the database exists
- Ensure the MySQL user has proper permissions

### Port Already in Use
- Change the PORT in `.env` to a different port
- Or stop the process using the current port

### Module Not Found Errors
- Run `npm install` to install all dependencies
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and run `npm install` again
