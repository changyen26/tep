-- Phase 2: Drop users.role column
-- Date: 2026-01-05
-- IMPORTANT: Run this ONLY after confirming NO code references users.role

-- Step 1: Backup users table structure and data (optional, for safety)
CREATE TABLE IF NOT EXISTS users_backup_before_role_drop AS SELECT * FROM users;

-- Step 2: Drop role column
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Verification
SELECT 'Phase 2 migration completed' AS status;
