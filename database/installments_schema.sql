-- Create installments table
CREATE TABLE IF NOT EXISTS installments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loanId INT NOT NULL,
  tenantId INT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('PENDING','PAID','MISSED') DEFAULT 'PENDING',
  collectedBy INT NULL,
  collectedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loanId) REFERENCES loans(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (collectedBy) REFERENCES users(id),
  INDEX idx_loan_id (loanId),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_status (status),
  INDEX idx_date (date)
);

-- Insert sample installments for existing loans
-- Assuming loan ID 1 has 30 day installments
INSERT INTO installments (loanId, tenantId, date, amount, status, collectedBy, collectedAt) VALUES
  (1, 1, CURDATE(), 383.33, 'PAID', 1, CURRENT_TIMESTAMP),
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 383.33, 'PAID', 1, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)),
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 383.33, 'PENDING', NULL, NULL),
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 383.33, 'PENDING', NULL, NULL),
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 383.33, 'PENDING', NULL, NULL);

-- Insert installments for loan ID 2 (7 day installments)
INSERT INTO installments (loanId, tenantId, date, amount, status) VALUES
  (2, 1, CURDATE(), 785.71, 'PAID'),
  (2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 785.71, 'PENDING'),
  (2, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 785.71, 'PENDING');

-- Display installments
SELECT * FROM installments;

