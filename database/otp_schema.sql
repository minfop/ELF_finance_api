-- OTP Codes schema for one-time password login
-- Run this after your base schema is applied

CREATE TABLE IF NOT EXISTS otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  otpHash VARCHAR(255) NOT NULL,
  channel VARCHAR(20) DEFAULT 'sms',
  attempts INT DEFAULT 0,
  expiresAt DATETIME NOT NULL,
  isUsed BIT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_expires (userId, expiresAt),
  INDEX idx_is_used (isUsed)
);

-- Optional: cleanup old/used OTPs periodically
-- DELETE FROM otp_codes WHERE isUsed = 1 OR expiresAt < NOW();


