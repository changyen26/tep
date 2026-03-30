-- ============================================
-- 資料遷移：從舊 users 表遷移到三表系統
-- ============================================

-- 1. 遷移一般使用者 (role='user')
INSERT INTO public_users (id, name, email, password_hash, blessing_points, is_active, created_at)
SELECT
    id,
    name,
    email,
    password_hash,
    blessing_points,
    is_active,
    created_at
FROM users
WHERE role = 'user';

-- 2. 遷移廟方管理員 (role='temple_admin')
INSERT INTO temple_admin_users (id, name, email, password_hash, temple_id, permission_scope, is_active, created_at)
SELECT
    u.id,
    u.name,
    u.email,
    u.password_hash,
    ta.temple_id,
    NULL as permission_scope,
    u.is_active,
    u.created_at
FROM users u
JOIN temple_admins ta ON u.id = ta.user_id
WHERE u.role = 'temple_admin' AND ta.is_active = 1;

-- 3. 遷移系統管理員 (role='admin')
INSERT INTO super_admin_users (id, name, email, password_hash, permission_scope, is_active, created_at)
SELECT
    u.id,
    u.name,
    u.email,
    u.password_hash,
    NULL as permission_scope,
    u.is_active,
    u.created_at
FROM users u
WHERE u.role = 'admin';

-- 4. （可選）備份舊表後刪除
-- RENAME TABLE users TO users_backup;
-- 註解：建議保留 users_backup 一段時間以便回滾

-- 5. 驗證資料遷移結果
SELECT
    (SELECT COUNT(*) FROM public_users) as public_count,
    (SELECT COUNT(*) FROM temple_admin_users) as temple_admin_count,
    (SELECT COUNT(*) FROM super_admin_users) as super_admin_count,
    (SELECT COUNT(*) FROM users WHERE role='user') as old_user_count,
    (SELECT COUNT(*) FROM users WHERE role='temple_admin') as old_temple_admin_count,
    (SELECT COUNT(*) FROM users WHERE role='admin') as old_admin_count;
