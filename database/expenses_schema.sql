CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expenseId INT NOT NULL,
  userId INT NOT NULL,
  tenantId INT NOT NULL,
  lineTypeId INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  isActive BIT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (expenseId) REFERENCES expensesType(id),
  FOREIGN KEY (lineTypeId) REFERENCES lineType(id),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_user_id (userId),
  INDEX idx_line_type_id (lineTypeId)
);

