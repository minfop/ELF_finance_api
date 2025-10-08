-- Create database
CREATE DATABASE IF NOT EXISTS elf_finance;

-- Use the database
USE elf_finance;

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(20),
  isActive BIT DEFAULT 1,
  createdAt DATE
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data for tenants
INSERT INTO tenants (name, phoneNumber, isActive, createdAt) VALUES
  ('ABC Corporation', '+1234567890', 1, CURDATE()),
  ('XYZ Enterprises', '+0987654321', 1, CURDATE()),
  ('Tech Solutions Inc', '+1122334455', 1, CURDATE());

-- Insert sample data for users
INSERT INTO users (name, email) VALUES
  ('John Doe', 'john.doe@example.com'),
  ('Jane Smith', 'jane.smith@example.com'),
  ('Bob Johnson', 'bob.johnson@example.com');

-- Show created tables
SHOW TABLES;

-- Display sample data
SELECT * FROM tenants;
SELECT * FROM users;
