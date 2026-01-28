-- Rollback for Phase 1

-- Restore old tables
CREATE TABLE temple_admins AS SELECT * FROM temple_admins_backup;
CREATE TABLE system_admins AS SELECT * FROM system_admins_backup;

-- Drop new FK constraints
ALTER TABLE system_logs DROP FOREIGN KEY fk_system_logs_super_admin;
ALTER TABLE system_settings DROP FOREIGN KEY fk_system_settings_super_admin;
ALTER TABLE temple_applications DROP FOREIGN KEY fk_temple_applications_super_admin;
ALTER TABLE user_reports DROP FOREIGN KEY fk_user_reports_super_admin;

-- Restore original FK constraints
ALTER TABLE system_logs ADD CONSTRAINT system_logs_ibfk_1 FOREIGN KEY (admin_id) REFERENCES system_admins(id) ON DELETE SET NULL;
ALTER TABLE system_settings ADD CONSTRAINT system_settings_ibfk_1 FOREIGN KEY (updated_by) REFERENCES system_admins(id) ON DELETE SET NULL;
ALTER TABLE temple_applications ADD CONSTRAINT temple_applications_ibfk_2 FOREIGN KEY (reviewed_by) REFERENCES system_admins(id) ON DELETE SET NULL;
ALTER TABLE user_reports ADD CONSTRAINT user_reports_ibfk_1 FOREIGN KEY (handler_id) REFERENCES system_admins(id) ON DELETE SET NULL;

-- Drop backup tables
DROP TABLE IF EXISTS temple_admins_backup;
DROP TABLE IF EXISTS system_admins_backup;
