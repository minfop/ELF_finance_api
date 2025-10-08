-- Create subscriptionPlans table
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
  ('Enterprise Plan', 'yearly', 365, 999.99, 'All features, unlimited users, 100GB storage', 1),
  ('Starter Plan', 'monthly', 30, 29.99, 'Starter features, 5 users, 500MB storage', 1);

-- Display subscription plans
SELECT * FROM subscriptionPlans;

