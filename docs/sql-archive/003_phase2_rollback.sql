-- Rollback for Phase 2

-- Restore role column
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER password_hash;

-- Restore role values from backup (if backup exists)
UPDATE users u
INNER JOIN users_backup_before_role_drop b ON u.id = b.id
SET u.role = b.role;

-- Drop backup table
DROP TABLE IF EXISTS users_backup_before_role_drop;
