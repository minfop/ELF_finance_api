const mysql = require('mysql2');
require('dotenv').config();
const fs = require('fs');
// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
        ca: fs.readFileSync('./config/ca.pem')
    }
});

// Get promise-based connection
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Error connecting to MySQL Database:', error.message);
    process.exit(1);
  }
};

module.exports = {
  pool: promisePool,
  testConnection
};
