-- ============================================
-- 三表帳號系統 - 建表 SQL
-- ============================================

-- 1. 一般使用者表
CREATE TABLE IF NOT EXISTS public_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '使用者名稱',
    email VARCHAR(120) NOT NULL UNIQUE COMMENT '登入信箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '加密密碼',
    blessing_points INT NOT NULL DEFAULT 0 COMMENT '祝福點數/功德值',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '啟用狀態',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    last_login_at DATETIME NULL COMMENT '最後登入時間',
    INDEX idx_email (email),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='一般使用者表（前台用戶）';

-- 2. 廟方管理員表
CREATE TABLE IF NOT EXISTS temple_admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '管理員名稱',
    email VARCHAR(120) NOT NULL UNIQUE COMMENT '登入信箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '加密密碼',
    temple_id INT NOT NULL COMMENT '所屬廟宇ID',
    permission_scope JSON NULL COMMENT '權限範圍（JSON）',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '啟用狀態',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    last_login_at DATETIME NULL COMMENT '最後登入時間',
    CONSTRAINT fk_temple_admin_temple FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_temple_id (temple_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='廟方管理員表（廟方後台）';

-- 3. 系統管理員表
CREATE TABLE IF NOT EXISTS super_admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '管理員名稱',
    email VARCHAR(120) NOT NULL UNIQUE COMMENT '登入信箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '加密密碼',
    permission_scope JSON NULL COMMENT '權限範圍（JSON）',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '啟用狀態',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    last_login_at DATETIME NULL COMMENT '最後登入時間',
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統管理員表（系統管理後台）';
