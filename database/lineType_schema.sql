-- Create lineType table
CREATE TABLE IF NOT EXISTS lineType (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tenantId INT NOT NULL,
  loanTypeId INT NOT NULL,
  isActive BIT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accessUsersId VARCHAR(100),
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (loanTypeId) REFERENCES loanType(id),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_loan_type_id (loanTypeId)
);

-- Insert sample line types
INSERT INTO lineType (name, tenantId, loanTypeId, isActive, accessUsersId) VALUES
  ('Line Type A', 1, 1, 1, '1,2,3'),
  ('Line Type B', 1, 2, 1, '1,2'),
  ('Line Type C', 2, 4, 1, '4,5');

-- Display line types
SELECT * FROM lineType;

