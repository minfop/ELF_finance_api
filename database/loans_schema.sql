-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenantId INT NOT NULL,
  customerId INT NOT NULL,
  principal DECIMAL(15,2) NOT NULL,
  interest DECIMAL(15,2) NOT NULL,
  disbursedAmount DECIMAL(15,2) NOT NULL,
  loanTypeId INT NOT NULL,
  lineTypeId INT NOT NULL,
  totalInstallment INT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  installmentAmount DECIMAL(15,2) NOT NULL,
  initialDeduction INT NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  balanceAmount DECIMAL(15,2) NOT NULL,
  isActive BIT DEFAULT 1,
  status ENUM('ONGOING','COMPLETED','PENDING','NIL') DEFAULT 'ONGOING',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (loanTypeId) REFERENCES loantype(id),
  FOREIGN KEY (lineTypeId) REFERENCES linetype(id),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_customer_id (customerId),
  INDEX idx_loan_type_id (loanTypeId),
  INDEX idx_status (status)
);

-- Insert sample loans
INSERT INTO loans (tenantId, customerId, principal, interest, disbursedAmount, loanTypeId, lineTypeId, totalInstallment, startDate, endDate, installmentAmount, initialDeduction, totalAmount, balanceAmount, isActive, status) VALUES
  (1, 1, 10000.00, 1500.00, 11500.00, 1, 1, 30, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 383.33, 500, 11500.00, 11500.00, 1, 'ONGOING'),
  (1, 1, 5000.00, 500.00, 5500.00, 2, 2, 7, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 785.71, 250, 5500.00, 5500.00, 1, 'ONGOING'),
  (1, 2, 20000.00, 3000.00, 23000.00, 1, 1, 90, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 766.67, 1000, 23000.00, 23000.00, 1, 'ONGOING'),
  (2, 3, 15000.00, 2250.00, 17250.00, 1, 3, 30, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 575.00, 750, 17250.00, 17250.00, 1, 'PENDING');

-- Display loans
SELECT * FROM loans;

