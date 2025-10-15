-- Customers table schema with all fields
-- Updated: 2025-10-15

-- Create customers table (complete schema)
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenantId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  photo LONGTEXT,
  documents LONGTEXT,
  longitude DECIMAL(11, 8),
  latitude DECIMAL(10, 8),
  place VARCHAR(100),
  identifyNumber VARCHAR(100),
  addidtionalMobile VARCHAR(15),
  address VARCHAR(500),
  referenceById INT,
  isActive BIT(1) DEFAULT 1,
  createdAt DATE DEFAULT (CURDATE()),
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  FOREIGN KEY (referenceById) REFERENCES customers(id),
  INDEX idx_tenant_id (tenantId),
  INDEX idx_email (email),
  INDEX idx_phone (phoneNumber),
  INDEX idx_reference_by (referenceById)
);

-- Add new columns to existing customers table (if table already exists)
-- Run these ALTER statements if you're updating an existing database

-- Add location fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS place VARCHAR(100);

-- Add identification and contact fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS identifyNumber VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS addidtionalMobile VARCHAR(15);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address VARCHAR(500);

-- Add reference customer field (self-referencing foreign key)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS referenceById INT;
ALTER TABLE customers ADD CONSTRAINT IF NOT EXISTS fk_customers_referenceBy_id 
    FOREIGN KEY (referenceById) REFERENCES customers(id);

-- Sample customer data with new fields
INSERT INTO customers (
  tenantId, name, phoneNumber, email, 
  longitude, latitude, place, identifyNumber, 
  addidtionalMobile, address, referenceById, 
  isActive, createdAt
) VALUES
  (1, 'John Doe', '+1234567890', 'john@example.com', 
   80.12345678, 6.12345678, 'Colombo', '123456789V', 
   '+9876543210', '123 Main Street, Colombo', NULL, 
   1, CURDATE()),
  (1, 'Jane Smith', '+1234567891', 'jane@example.com', 
   80.22345678, 6.22345678, 'Kandy', '987654321V', 
   '+9876543211', '456 Second Street, Kandy', 1, 
   1, CURDATE()),
  (2, 'Bob Johnson', '+1234567892', 'bob@example.com', 
   79.87654321, 6.87654321, 'Galle', '456789123V', 
   NULL, '789 Third Street, Galle', NULL, 
   1, CURDATE())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Query to view customers with reference customer names
SELECT 
  c.id, c.tenantId, c.name, c.phoneNumber, c.email, 
  c.longitude, c.latitude, c.place, c.identifyNumber, 
  c.addidtionalMobile, c.address, c.referenceById, 
  c.isActive, c.createdAt,
  t.name as tenantName,
  ref.name as referenceByName
FROM customers c
LEFT JOIN tenants t ON c.tenantId = t.id
LEFT JOIN customers ref ON c.referenceById = ref.id;

