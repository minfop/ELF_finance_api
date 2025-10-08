-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  isActive BIT DEFAULT 1,
  createdAt DATE DEFAULT (CURDATE())
);

-- Insert sample roles
INSERT INTO roles (name, description, isActive) VALUES
  ('admin', 'System Administrator - Full access to all resources', 1),
  ('monsters', 'Monsters role - Special access permissions', 1),
  ('manager', 'Manager - Can manage tenant resources', 1),
  ('user', 'Regular User - Limited access', 1),
  ('viewer', 'Viewer - Read-only access', 1);

-- Display roles
SELECT * FROM roles;

