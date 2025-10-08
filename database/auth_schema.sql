-- Update users table to add password field
-- Run this if password column doesn't exist
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) NOT NULL AFTER email;

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isRevoked BIT DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(255)),
  INDEX idx_user_id (userId)
);

-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);

-- Sample user with password (password is: "password123")
-- You should update this after running the application
UPDATE users 
SET password = '$2a$10$rXKZ0yFvK5gXqQxW5Qy1FuFQXZGJzYqFxGjKZQXZGJzYqFxGjKZQXZ'
WHERE email = 'john.doe@example.com';

