-- Phase 1: Drop old account tables and fix FK references
-- Date: 2026-01-05
-- IMPORTANT: Run this ONLY after code changes are deployed

-- Step 1: Backup old tables
CREATE TABLE IF NOT EXISTS temple_admins_backup AS SELECT * FROM temple_admins;
CREATE TABLE IF NOT EXISTS system_admins_backup AS SELECT * FROM system_admins;

-- Step 2: Drop old FK constraints
ALTER TABLE system_logs DROP FOREIGN KEY IF EXISTS system_logs_ibfk_1;
ALTER TABLE system_settings DROP FOREIGN KEY IF EXISTS system_settings_ibfk_1;
ALTER TABLE temple_applications DROP FOREIGN KEY IF EXISTS temple_applications_ibfk_2;
ALTER TABLE user_reports DROP FOREIGN KEY IF EXISTS user_reports_ibfk_1;

-- Step 3: Drop old tables
DROP TABLE IF EXISTS temple_admins;
DROP TABLE IF EXISTS system_admins;

-- Step 4: Recreate FK constraints pointing to super_admin_users
ALTER TABLE system_logs
ADD CONSTRAINT fk_system_logs_super_admin
FOREIGN KEY (admin_id) REFERENCES super_admin_users(id) ON DELETE SET NULL;

ALTER TABLE system_settings
ADD CONSTRAINT fk_system_settings_super_admin
FOREIGN KEY (updated_by) REFERENCES super_admin_users(id) ON DELETE SET NULL;

ALTER TABLE temple_applications
ADD CONSTRAINT fk_temple_applications_super_admin
FOREIGN KEY (reviewed_by) REFERENCES super_admin_users(id) ON DELETE SET NULL;

ALTER TABLE user_reports
ADD CONSTRAINT fk_user_reports_super_admin
FOREIGN KEY (handler_id) REFERENCES super_admin_users(id) ON DELETE SET NULL;

-- Verification
SELECT 'Phase 1 migration completed' AS status;
