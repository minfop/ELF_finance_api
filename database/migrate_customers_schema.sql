-- Migration script to update existing customers table
-- Run this if you already have a customers table

USE elf_finance;

-- Check if columns exist before adding them
-- Add photo column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'elf_finance'
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'photo'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE customers ADD COLUMN photo LONGTEXT DEFAULT NULL AFTER email',
    'SELECT "Column photo already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add documents column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'elf_finance'
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'documents'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE customers ADD COLUMN documents LONGTEXT DEFAULT NULL AFTER photo',
    'SELECT "Column documents already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remove address column if it exists (no longer needed)
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'elf_finance'
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'address'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE customers DROP COLUMN address',
    'SELECT "Column address does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modify createdBy to NOT NULL if it exists
-- Note: This will fail if there are existing NULL values
-- First, update any NULL values to a default user ID (e.g., 1)
UPDATE customers SET createdBy = 1 WHERE createdBy IS NULL;

-- Then modify the column
ALTER TABLE customers MODIFY COLUMN createdBy INT NOT NULL;

-- Verify the changes
DESCRIBE customers;

SELECT 'Migration completed successfully!' AS status;

