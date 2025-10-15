CREATE TABLE IF NOT EXISTS expensesType (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  maxLimit DECIMAL(15,2) DEFAULT NULL,
  tenantId INT NOT NULL,
  isActive BIT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accessUsersId VARCHAR(100) DEFAULT NULL,
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_is_active (isActive)
);

