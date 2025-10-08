-- Migration script to update tenant_subscriptions to tenantSubscriptions
-- Run this if you already have a tenant_subscriptions table

USE elf_finance;

-- Create subscription plans table first
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

-- Create new tenantSubscriptions table
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

-- Migrate data from old table if it exists
INSERT INTO tenantSubscriptions (tenantId, subscriptionPlanId, startDate, endDate, status)
SELECT 
  ts.tenantId,
  CASE 
    WHEN ts.planName LIKE '%Basic%' THEN 1
    WHEN ts.planName LIKE '%Premium%' THEN 2
    WHEN ts.planName LIKE '%Enterprise%' THEN 3
    ELSE 1
  END as subscriptionPlanId,
  ts.startDate,
  COALESCE(ts.endDate, DATE_ADD(ts.startDate, INTERVAL 30 DAY)) as endDate,
  CASE 
    WHEN LOWER(ts.status) = 'active' THEN 'ACTIVE'
    WHEN LOWER(ts.status) = 'cancelled' THEN 'CANCELLED'
    WHEN LOWER(ts.status) = 'expired' THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM tenant_subscriptions ts
WHERE NOT EXISTS (
  SELECT 1 FROM tenantSubscriptions WHERE tenantId = ts.tenantId
);

-- Drop old table (backup first!)
-- Uncomment the following line only after verifying data migration
-- DROP TABLE IF EXISTS tenant_subscriptions;

-- Verify the changes
DESCRIBE subscriptionPlans;
DESCRIBE tenantSubscriptions;

SELECT 'Migration completed successfully!' AS status;
SELECT * FROM subscriptionPlans;
SELECT * FROM tenantSubscriptions;

