-- Update roles table with correct descriptions
UPDATE roles SET description = 'Monster role - Can see all tenants list and tenant subscriptions' WHERE name = 'monsters';
UPDATE roles SET description = 'Admin - Owner of tenant, can access all users and customers in their tenant' WHERE name = 'admin';
UPDATE roles SET description = 'Manager - Manager of tenant, can access all users and customers in their tenant' WHERE name = 'manager';
UPDATE roles SET description = 'Regular User - Limited access' WHERE name = 'user';
UPDATE roles SET description = 'Viewer - Read-only access' WHERE name = 'viewer';

-- Add collectioner role
INSERT INTO roles (name, description, isActive) 
VALUES ('collectioner', 'Collectioner - Can view customer list only (read-only), cannot access users', 1)
ON DUPLICATE KEY UPDATE description = 'Collectioner - Can view customer list only (read-only), cannot access users';

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenantId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  photo LONGTEXT,
  documents LONGTEXT,
  isActive BIT(1) DEFAULT NULL,
  createdAt DATE DEFAULT NULL,
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_email (email)
);

-- Create subscriptionPlans table first
CREATE TABLE IF NOT EXISTS subscriptionPlans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  planName VARCHAR(100) NOT NULL,
  planType VARCHAR(20) NOT NULL,
  duration INT NOT NULL COMMENT 'Duration in days',
  price DECIMAL(10, 2) NOT NULL,
  features TEXT,
  isActive BIT DEFAULT 1,
  createdAt DATE DEFAULT (CURDATE())
);

-- Insert sample subscription plans
INSERT INTO subscriptionPlans (planName, planType, duration, price, features, isActive) VALUES
  ('Basic Plan', 'monthly', 30, 49.99, 'Basic features, 10 users, 1GB storage', 1),
  ('Premium Plan', 'monthly', 30, 99.99, 'Premium features, 50 users, 10GB storage', 1),
  ('Enterprise Plan', 'yearly', 365, 999.99, 'All features, unlimited users, 100GB storage', 1)
ON DUPLICATE KEY UPDATE planName = VALUES(planName);

-- Create tenantSubscriptions table
CREATE TABLE IF NOT EXISTS tenantSubscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenantId INT NOT NULL,
  subscriptionPlanId INT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  status ENUM('ACTIVE','EXPIRED','CANCELLED') DEFAULT 'ACTIVE',
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (subscriptionPlanId) REFERENCES subscriptionPlans(id),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_status (status)
);

-- Insert sample customers
INSERT INTO customers (tenantId, name, phoneNumber, email, photo, documents, isActive, createdAt) VALUES
  (1, 'Customer One', '+1111111111', 'customer1@example.com', NULL, NULL, 1, CURDATE()),
  (1, 'Customer Two', '+2222222222', 'customer2@example.com', NULL, NULL, 1, CURDATE()),
  (2, 'Customer Three', '+3333333333', 'customer3@example.com', NULL, NULL, 1, CURDATE()),
  (3, 'Customer Four', '+4444444444', 'customer4@example.com', NULL, NULL, 1, CURDATE());

-- Insert sample tenant subscriptions
INSERT INTO tenantSubscriptions (tenantId, subscriptionPlanId, startDate, endDate, status) VALUES
  (1, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'ACTIVE'),
  (2, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'ACTIVE'),
  (3, 3, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'ACTIVE');

-- Display data
SELECT * FROM roles;
SELECT * FROM customers;
SELECT * FROM subscriptionPlans;
SELECT * FROM tenantSubscriptions;

