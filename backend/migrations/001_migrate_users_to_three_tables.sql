-- Migration: Migrate users table to three-table system
-- Date: 2026-01-05

-- Step 1: Migrate public users (role='user')
INSERT INTO public_users (name, email, password_hash, is_active, created_at, blessing_points)
SELECT
    name,
    email,
    password_hash,
    is_active,
    created_at,
    IFNULL(blessing_points, 0)
FROM users
WHERE role = 'user'
AND email NOT IN (SELECT email FROM public_users)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash);

-- Step 2: Migrate temple admins (role='temple_admin')
-- Need to get temple_id from temple_admins table
INSERT INTO temple_admin_users (name, email, password_hash, temple_id, is_active, created_at)
SELECT
    u.name,
    u.email,
    u.password_hash,
    ta.temple_id,
    u.is_active,
    u.created_at
FROM users u
INNER JOIN temple_admins ta ON ta.user_id = u.id
WHERE u.role = 'temple_admin'
AND u.email NOT IN (SELECT email FROM temple_admin_users)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash),
    temple_id = VALUES(temple_id);

-- Step 3: Migrate super admins (role='admin')
INSERT INTO super_admin_users (name, email, password_hash, is_active, created_at)
SELECT
    name,
    email,
    password_hash,
    is_active,
    created_at
FROM users
WHERE role = 'admin'
AND email NOT IN (SELECT email FROM super_admin_users)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash);

-- Step 4: Verify migration
SELECT
    'public_users' as table_name,
    COUNT(*) as count
FROM public_users
UNION ALL
SELECT
    'temple_admin_users',
    COUNT(*)
FROM temple_admin_users
UNION ALL
SELECT
    'super_admin_users',
    COUNT(*)
FROM super_admin_users;
