-- Create loanType table
CREATE TABLE IF NOT EXISTS loanType (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenantId INT NOT NULL,
  collectionType VARCHAR(50) NOT NULL,
  collectionPeriod INT NOT NULL,
  interest INT NOT NULL,
  initialDeduction INT NOT NULL,
  nilCalculation INT NOT NULL,
  isActive BIT DEFAULT 1,
  createdAt DATE DEFAULT (CURDATE()),
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  INDEX idx_tenant_id (tenantId)
);

-- Insert sample loan types
INSERT INTO loanType (tenantId, collectionType, collectionPeriod, interest, initialDeduction, nilCalculation, isActive) VALUES
  (1, 'Daily', 1, 10, 5, 2, 1),
  (1, 'Weekly', 7, 15, 10, 3, 1),
  (1, 'Monthly', 30, 20, 15, 5, 1),
  (2, 'Daily', 1, 12, 8, 2, 1),
  (2, 'Bi-Weekly', 14, 18, 12, 4, 1),
  (3, 'Monthly', 30, 25, 20, 5, 1);

-- Display loan types
SELECT * FROM loanType;

