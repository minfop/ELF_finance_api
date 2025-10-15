-- Create installments table
CREATE TABLE IF NOT EXISTS installments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loanId INT NOT NULL,
  tenantId INT NOT NULL,
  dueAt DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  remainAmount DECIMAL(15,2) NOT NULL,
  cashInHand DECIMAL(15,2) NOT NULL DEFAULT 0,
  cashInOnline DECIMAL(15,2) NOT NULL DEFAULT 0,
  status ENUM('PAID','MISSED','PARTIALLY') DEFAULT 'MISSED',
  collectedBy INT NOT NULL,
  nextDue TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loanId) REFERENCES loans(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (collectedBy) REFERENCES users(id),
  INDEX idx_loan_id (loanId),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_status (status),
  INDEX idx_due_at (dueAt)
);

-- Insert sample installments for existing loans
-- Assuming loan ID 1 has 30 day installments
INSERT INTO installments (loanId, tenantId, dueAt, amount, remainAmount, cashInHand, cashInOnline, status, collectedBy, nextDue) VALUES
  (1, 1, CURDATE(), 383.33, 0, 383.33, 0, 'PAID', 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY)),
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 383.33, 0, 383.33, 0, 'PAID', 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 383.33, 383.33, 0, 0, 'MISSED', 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 383.33, 383.33, 0, 0, 'MISSED', 1, DATE_ADD(CURDATE(), INTERVAL 4 DAY)),
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 383.33, 383.33, 0, 0, 'MISSED', 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY));

-- Insert installments for loan ID 2 (7 day installments)
INSERT INTO installments (loanId, tenantId, dueAt, amount, remainAmount, cashInHand, cashInOnline, status, collectedBy, nextDue) VALUES
  (2, 1, CURDATE(), 785.71, 0, 785.71, 0, 'PAID', 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
  (2, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 785.71, 785.71, 0, 0, 'MISSED', 1, DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
  (2, 1, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 785.71, 785.71, 0, 0, 'MISSED', 1, DATE_ADD(CURDATE(), INTERVAL 21 DAY));

-- Display installments
SELECT * FROM installments;

