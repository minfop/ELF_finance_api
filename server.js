const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const setupSwagger = require('./config/swagger');
const tenantRoutes = require('./routes/tenantRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const customerRoutes = require('./routes/customerRoutes');
const tenantSubscriptionRoutes = require('./routes/tenantSubscriptionRoutes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes');
const loanTypeRoutes = require('./routes/loanTypeRoutes');
const loanRoutes = require('./routes/loanRoutes');
const installmentRoutes = require('./routes/installmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger Documentation
setupSwagger(app);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ELF Finance API',
    version: '1.0.0',
    documentation: `http://localhost:${PORT}/api-docs`
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/tenant-subscriptions', tenantSubscriptionRoutes);
app.use('/api/loan-types', loanTypeRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/installments', installmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏠 Home: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
