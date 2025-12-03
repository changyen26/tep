-- ============================================================================
-- 系統管理員功能 - 資料庫擴充腳本
-- ============================================================================
-- 說明: 此腳本為平安符打卡系統新增系統管理員功能
-- 版本: 1.0.0
-- 日期: 2025-01-15
-- ============================================================================

USE temple_checkin;

-- ============================================================================
-- 資料表建立
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 系統管理員表 (admin_users)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS admin_users;
CREATE TABLE admin_users (
    id VARCHAR(36) PRIMARY KEY COMMENT '管理員 UUID',
    user_id VARCHAR(36) NOT NULL UNIQUE COMMENT '關聯的使用者 ID',
    role ENUM('super_admin', 'content_manager', 'customer_service', 'data_analyst') 
        NOT NULL DEFAULT 'content_manager' COMMENT '管理員角色',
    permissions JSON COMMENT '權限設定',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    created_by VARCHAR(36) COMMENT '建立者 ID',
    last_login DATETIME COMMENT '最後登入時間',
    
    INDEX idx_user_id (user_id),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統管理員表';

-- ----------------------------------------------------------------------------
-- 廟宇申請表 (temple_applications)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS temple_applications;
CREATE TABLE temple_applications (
    id VARCHAR(36) PRIMARY KEY COMMENT '申請 UUID',
    applicant_id VARCHAR(36) NOT NULL COMMENT '申請人 ID',
    temple_name VARCHAR(100) NOT NULL COMMENT '廟宇名稱',
    address VARCHAR(200) NOT NULL COMMENT '廟宇地址',
    main_deity VARCHAR(50) COMMENT '主祀神明',
    description TEXT COMMENT '廟宇描述',
    contact_person VARCHAR(50) NOT NULL COMMENT '聯絡人',
    contact_phone VARCHAR(20) NOT NULL COMMENT '聯絡電話',
    contact_email VARCHAR(120) NOT NULL COMMENT '聯絡信箱',
    proof_documents JSON COMMENT '證明文件 URLs',
    application_reason TEXT COMMENT '申請理由',
    status ENUM('pending', 'approved', 'rejected', 'on_hold') 
        DEFAULT 'pending' COMMENT '申請狀態',
    reviewed_by VARCHAR(36) COMMENT '審核者 ID',
    reviewed_at DATETIME COMMENT '審核時間',
    review_notes TEXT COMMENT '審核備註',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申請時間',
    
    INDEX idx_applicant_id (applicant_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='廟宇申請表';

-- ----------------------------------------------------------------------------
-- 商品審核表 (product_reviews)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS product_reviews;
CREATE TABLE product_reviews (
    id VARCHAR(36) PRIMARY KEY COMMENT '審核記錄 UUID',
    product_id VARCHAR(36) NOT NULL COMMENT '商品 ID',
    product_type ENUM('general', 'temple') NOT NULL COMMENT '商品類型',
    submitted_by VARCHAR(36) NOT NULL COMMENT '提交者 ID',
    status ENUM('pending', 'approved', 'rejected') 
        DEFAULT 'pending' COMMENT '審核狀態',
    reviewed_by VARCHAR(36) COMMENT '審核者 ID',
    reviewed_at DATETIME COMMENT '審核時間',
    review_notes TEXT COMMENT '審核意見',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交時間',
    
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品審核表';

-- ----------------------------------------------------------------------------
-- 系統日誌表 (system_logs)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS system_logs;
CREATE TABLE system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日誌 ID',
    user_id VARCHAR(36) COMMENT '操作者 ID',
    action VARCHAR(100) NOT NULL COMMENT '操作行為',
    target_type VARCHAR(50) COMMENT '目標類型',
    target_id VARCHAR(36) COMMENT '目標 ID',
    ip_address VARCHAR(45) COMMENT 'IP 位址',
    user_agent VARCHAR(500) COMMENT 'User Agent',
    request_data JSON COMMENT '請求資料',
    response_status INT COMMENT '回應狀態碼',
    error_message TEXT COMMENT '錯誤訊息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作時間',
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_target_type (target_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統日誌表';

-- ----------------------------------------------------------------------------
-- 系統設定表 (system_settings)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY COMMENT '設定 UUID',
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT '設定鍵',
    setting_value TEXT COMMENT '設定值',
    setting_type ENUM('string', 'number', 'boolean', 'json') NOT NULL COMMENT '資料類型',
    category VARCHAR(50) NOT NULL COMMENT '設定分類',
    description TEXT COMMENT '設定說明',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公開',
    updated_by VARCHAR(36) COMMENT '更新者 ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    INDEX idx_category (category),
    INDEX idx_is_public (is_public),
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統設定表';

-- ----------------------------------------------------------------------------
-- 使用者檢舉表 (user_reports)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS user_reports;
CREATE TABLE user_reports (
    id VARCHAR(36) PRIMARY KEY COMMENT '檢舉 UUID',
    reporter_id VARCHAR(36) NOT NULL COMMENT '檢舉人 ID',
    reported_user_id VARCHAR(36) NOT NULL COMMENT '被檢舉人 ID',
    reason ENUM('spam', 'fraud', 'harassment', 'inappropriate_content', 'other') 
        NOT NULL COMMENT '檢舉原因',
    description TEXT COMMENT '詳細說明',
    evidence_urls JSON COMMENT '證據 URLs',
    status ENUM('pending', 'investigating', 'resolved', 'dismissed') 
        DEFAULT 'pending' COMMENT '處理狀態',
    handled_by VARCHAR(36) COMMENT '處理者 ID',
    handled_at DATETIME COMMENT '處理時間',
    action_taken TEXT COMMENT '處理措施',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '檢舉時間',
    
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_reported_user_id (reported_user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='使用者檢舉表';

-- ============================================================================
-- 測試資料插入
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 插入系統管理員 (讓 admin@example.com 成為超級管理員)
-- ----------------------------------------------------------------------------
INSERT INTO admin_users (id, user_id, role, permissions, is_active, last_login) VALUES
-- admin_user 是超級管理員
('admin-0001', '550e8400-e29b-41d4-a716-446655440002', 'super_admin',
 JSON_OBJECT(
     'manage_users', true,
     'manage_temples', true,
     'manage_products', true,
     'manage_orders', true,
     'view_analytics', true,
     'manage_system_settings', true,
     'manage_admins', true
 ), TRUE, NOW());

-- ----------------------------------------------------------------------------
-- 插入測試廟宇申請
-- ----------------------------------------------------------------------------
INSERT INTO temple_applications (
    id, applicant_id, temple_name, address, main_deity, description,
    contact_person, contact_phone, contact_email,
    proof_documents, application_reason, status
) VALUES
-- 待審核的申請
('app-0001', '550e8400-e29b-41d4-a716-446655440001',
 '新北市土地公廟', '新北市新莊區中正路123號', '福德正神',
 '本廟創建於清朝,歷史悠久,香火鼎盛。',
 '張主委', '02-22345678', 'tugong@example.com',
 JSON_ARRAY('https://example.com/docs/cert1.pdf', 'https://example.com/docs/photo1.jpg'),
 '希望加入平台,讓更多信眾能夠方便打卡參拜。', 'pending'),

-- 已通過的申請
('app-0002', '550e8400-e29b-41d4-a716-446655440003',
 '桃園關帝廟', '桃園市桃園區復興路456號', '關聖帝君',
 '本廟供奉關聖帝君,為地方重要信仰中心。',
 '李主委', '03-33456789', 'guandi@example.com',
 JSON_ARRAY('https://example.com/docs/cert2.pdf'),
 '希望透過打卡系統推廣廟宇文化。', 'approved');

-- ----------------------------------------------------------------------------
-- 插入系統設定
-- ----------------------------------------------------------------------------
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, category, description, is_public) VALUES
-- 打卡相關設定
('set-0001', 'default_checkin_points', '10', 'number', 'checkin', '預設打卡獲得的功德值', TRUE),
('set-0002', 'max_daily_checkins', '10', 'number', 'checkin', '每日最多打卡次數', TRUE),
('set-0003', 'checkin_radius_meters', '100', 'number', 'checkin', '打卡有效範圍(公尺)', FALSE),

-- 點數相關設定
('set-0004', 'points_expiry_days', '365', 'number', 'points', '功德值有效期(天)', TRUE),
('set-0005', 'min_redemption_points', '50', 'number', 'points', '最低兌換功德值', TRUE),

-- 商品相關設定
('set-0006', 'enable_product_review', 'true', 'boolean', 'products', '是否啟用商品審核', FALSE),
('set-0007', 'low_stock_threshold', '10', 'number', 'products', '低庫存警示閾值', FALSE),

-- 通知相關設定
('set-0008', 'enable_email_notifications', 'true', 'boolean', 'notifications', '是否啟用Email通知', FALSE),
('set-0009', 'enable_push_notifications', 'true', 'boolean', 'notifications', '是否啟用推播通知', FALSE),

-- 安全相關設定
('set-0010', 'enable_2fa', 'false', 'boolean', 'security', '是否強制雙因素認證', FALSE),
('set-0011', 'password_min_length', '6', 'number', 'security', '密碼最小長度', FALSE),
('set-0012', 'session_timeout_minutes', '60', 'number', 'security', 'Session 過期時間(分鐘)', FALSE);

-- ----------------------------------------------------------------------------
-- 插入測試檢舉記錄
-- ----------------------------------------------------------------------------
INSERT INTO user_reports (
    id, reporter_id, reported_user_id, reason, description,
    evidence_urls, status
) VALUES
-- 待處理的檢舉
('report-0001', '550e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440003', 'spam',
 '該使用者持續發送垃圾訊息打擾其他使用者',
 JSON_ARRAY('https://example.com/evidence/screenshot1.jpg'),
 'pending');

-- ----------------------------------------------------------------------------
-- 插入測試系統日誌
-- ----------------------------------------------------------------------------
INSERT INTO system_logs (user_id, action, target_type, target_id, ip_address, response_status) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'admin_login', NULL, NULL, '192.168.1.100', 200),
('550e8400-e29b-41d4-a716-446655440002', 'user_update', 'user', '550e8400-e29b-41d4-a716-446655440001', '192.168.1.100', 200),
('550e8400-e29b-41d4-a716-446655440002', 'temple_create', 'temple', '750e8400-e29b-41d4-a716-446655440001', '192.168.1.100', 201),
('550e8400-e29b-41d4-a716-446655440001', 'user_login', NULL, NULL, '192.168.1.50', 200),
('550e8400-e29b-41d4-a716-446655440001', 'checkin', 'temple', '750e8400-e29b-41d4-a716-446655440001', '192.168.1.50', 201);

-- ============================================================================
-- 觸發器 (Triggers)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 申請通過後自動建立廟宇和設定管理員
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS after_application_approved//

CREATE TRIGGER after_application_approved
AFTER UPDATE ON temple_applications
FOR EACH ROW
BEGIN
    DECLARE v_temple_id VARCHAR(36);
    DECLARE v_admin_id VARCHAR(36);
    
    -- 當狀態從非 approved 變更為 approved 時
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- 生成 UUID
        SET v_temple_id = UUID();
        SET v_admin_id = UUID();
        
        -- 建立新廟宇
        INSERT INTO temples (
            id, name, address, main_deity, description,
            contact_person, contact_phone, contact_email,
            is_active, created_at
        ) VALUES (
            v_temple_id, NEW.temple_name, NEW.address, NEW.main_deity, NEW.description,
            NEW.contact_person, NEW.contact_phone, NEW.contact_email,
            TRUE, NOW()
        );
        
        -- 設定申請人為廟宇管理員
        INSERT INTO temple_admins (
            id, temple_id, user_id, role, 
            permissions, is_active, created_at, created_by
        ) VALUES (
            v_admin_id, v_temple_id, NEW.applicant_id, 'owner',
            JSON_OBJECT(
                'manage_info', true,
                'view_stats', true,
                'manage_products', true,
                'manage_announcements', true,
                'manage_rewards', true,
                'manage_admins', true
            ),
            TRUE, NOW(), NEW.reviewed_by
        );
    END IF;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 記錄管理員登入時間
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS after_admin_login//

CREATE TRIGGER after_admin_login
BEFORE UPDATE ON admin_users
FOR EACH ROW
BEGIN
    -- 當 last_login 被更新時,更新時間
    IF NEW.last_login != OLD.last_login OR OLD.last_login IS NULL THEN
        SET NEW.last_login = NOW();
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- 統計視圖 (Views)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 系統總覽統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_system_overview_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as active_users,
    (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_users_today,
    (SELECT COUNT(*) FROM temples) as total_temples,
    (SELECT COUNT(*) FROM temples WHERE is_active = TRUE) as active_temples,
    (SELECT COUNT(*) FROM checkins) as total_checkins,
    (SELECT COUNT(*) FROM checkins WHERE DATE(checkin_time) = CURDATE()) as checkins_today,
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as active_products,
    (SELECT COUNT(*) FROM products WHERE stock_quantity < 10) as low_stock_products,
    (SELECT COUNT(*) FROM redemptions) as total_redemptions,
    (SELECT COUNT(*) FROM redemptions WHERE status = 'pending') as pending_redemptions,
    (SELECT SUM(blessing_points) FROM users) as total_points_in_circulation,
    (SELECT SUM(merit_points_used) FROM redemptions) as total_points_redeemed;

-- ----------------------------------------------------------------------------
-- 待處理事項統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_pending_tasks AS
SELECT 
    'temple_applications' as task_type,
    COUNT(*) as count,
    'pending' as status
FROM temple_applications 
WHERE status = 'pending'
UNION ALL
SELECT 
    'product_reviews' as task_type,
    COUNT(*) as count,
    'pending' as status
FROM product_reviews 
WHERE status = 'pending'
UNION ALL
SELECT 
    'redemptions' as task_type,
    COUNT(*) as count,
    'pending' as status
FROM redemptions 
WHERE status = 'pending'
UNION ALL
SELECT 
    'user_reports' as task_type,
    COUNT(*) as count,
    'pending' as status
FROM user_reports 
WHERE status = 'pending';

-- ----------------------------------------------------------------------------
-- 管理員活動統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_admin_activity_stats AS
SELECT 
    au.id,
    u.username,
    u.email,
    au.role,
    au.last_login,
    COUNT(sl.id) as total_actions,
    COUNT(CASE WHEN DATE(sl.created_at) = CURDATE() THEN 1 END) as actions_today,
    MAX(sl.created_at) as last_action
FROM admin_users au
JOIN users u ON au.user_id = u.id
LEFT JOIN system_logs sl ON u.id = sl.user_id
WHERE au.is_active = TRUE
GROUP BY au.id, u.username, u.email, au.role, au.last_login;

-- ----------------------------------------------------------------------------
-- 使用者統計詳細視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_user_detailed_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.blessing_points,
    u.is_active,
    u.is_admin,
    u.created_at,
    COUNT(DISTINCT c.id) as total_checkins,
    COUNT(DISTINCT c.temple_id) as unique_temples_visited,
    COUNT(DISTINCT a.id) as total_amulets,
    COUNT(DISTINCT r.id) as total_redemptions,
    SUM(r.merit_points_used) as total_points_spent,
    MAX(c.checkin_time) as last_checkin,
    DATEDIFF(CURDATE(), MAX(c.checkin_time)) as days_since_last_checkin
FROM users u
LEFT JOIN checkins c ON u.id = c.user_id
LEFT JOIN amulets a ON u.id = a.user_id AND a.is_active = TRUE
LEFT JOIN redemptions r ON u.id = r.user_id AND r.status != 'cancelled'
GROUP BY u.id, u.username, u.email, u.blessing_points, u.is_active, u.is_admin, u.created_at;

-- ============================================================================
-- 預存程序 (Stored Procedures)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 檢查使用者是否為系統管理員
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_check_system_admin//

CREATE PROCEDURE sp_check_system_admin(
    IN p_user_id VARCHAR(36),
    OUT p_is_admin BOOLEAN,
    OUT p_role VARCHAR(20),
    OUT p_permissions JSON
)
BEGIN
    SELECT 
        CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END,
        role,
        permissions
    INTO p_is_admin, p_role, p_permissions
    FROM admin_users
    WHERE user_id = p_user_id 
      AND is_active = TRUE
    LIMIT 1;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 取得系統統計數據
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_system_stats//

CREATE PROCEDURE sp_get_system_stats(
    IN p_period VARCHAR(20)  -- 'today', 'week', 'month', 'year'
)
BEGIN
    DECLARE v_start_date DATETIME;
    
    -- 根據期間設定開始日期
    CASE p_period
        WHEN 'today' THEN 
            SET v_start_date = CURDATE();
        WHEN 'week' THEN 
            SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 7 DAY);
        WHEN 'month' THEN 
            SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 30 DAY);
        WHEN 'year' THEN 
            SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
        ELSE 
            SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 30 DAY);
    END CASE;
    
    -- 使用者統計
    SELECT 
        'users' as metric_type,
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active,
        COUNT(CASE WHEN created_at >= v_start_date THEN 1 END) as new_in_period
    FROM users
    
    UNION ALL
    
    -- 打卡統計
    SELECT 
        'checkins' as metric_type,
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as active,
        COUNT(CASE WHEN checkin_time >= v_start_date THEN 1 END) as new_in_period
    FROM checkins
    
    UNION ALL
    
    -- 兌換統計
    SELECT 
        'redemptions' as metric_type,
        COUNT(*) as total,
        COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as active,
        COUNT(CASE WHEN redeemed_at >= v_start_date THEN 1 END) as new_in_period
    FROM redemptions;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 清理舊日誌
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_cleanup_old_logs//

CREATE PROCEDURE sp_cleanup_old_logs(
    IN p_days_to_keep INT
)
BEGIN
    DECLARE v_cutoff_date DATETIME;
    DECLARE v_deleted_count INT;
    
    SET v_cutoff_date = DATE_SUB(NOW(), INTERVAL p_days_to_keep DAY);
    
    DELETE FROM system_logs 
    WHERE created_at < v_cutoff_date;
    
    SET v_deleted_count = ROW_COUNT();
    
    SELECT v_deleted_count as deleted_logs, v_cutoff_date as cutoff_date;
END//

DELIMITER ;

-- ============================================================================
-- 定期任務建議 (需手動設定 MySQL Event Scheduler)
-- ============================================================================

-- 啟用 Event Scheduler
-- SET GLOBAL event_scheduler = ON;

-- 每天凌晨清理90天前的日誌
-- CREATE EVENT IF NOT EXISTS cleanup_old_logs
-- ON SCHEDULE EVERY 1 DAY
-- STARTS '2025-01-16 00:00:00'
-- DO
-- CALL sp_cleanup_old_logs(90);

-- ============================================================================
-- 資料完整性檢查
-- ============================================================================

-- 檢查新增的資料表記錄數
SELECT '系統管理員' as table_name, COUNT(*) as record_count FROM admin_users
UNION ALL
SELECT '廟宇申請', COUNT(*) FROM temple_applications
UNION ALL
SELECT '商品審核', COUNT(*) FROM product_reviews
UNION ALL
SELECT '系統日誌', COUNT(*) FROM system_logs
UNION ALL
SELECT '系統設定', COUNT(*) FROM system_settings
UNION ALL
SELECT '使用者檢舉', COUNT(*) FROM user_reports;

-- 檢查管理員角色分布
SELECT 
    role,
    COUNT(*) as count,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_count
FROM admin_users
GROUP BY role;

-- 檢查申請狀態分布
SELECT 
    status,
    COUNT(*) as count
FROM temple_applications
GROUP BY status
ORDER BY FIELD(status, 'pending', 'approved', 'rejected', 'on_hold');

-- 檢查系統設定分類
SELECT 
    category,
    COUNT(*) as setting_count
FROM system_settings
GROUP BY category;

-- ============================================================================
-- 初始化完成訊息
-- ============================================================================

SELECT 
    '✅ 系統管理員功能初始化完成！' as message,
    CONCAT(
        '管理員: ', (SELECT COUNT(*) FROM admin_users),
        ' | 申請: ', (SELECT COUNT(*) FROM temple_applications),
        ' | 設定: ', (SELECT COUNT(*) FROM system_settings),
        ' | 日誌: ', (SELECT COUNT(*) FROM system_logs)
    ) as statistics;

-- ============================================================================
-- 測試查詢範例
-- ============================================================================

-- 1. 查看系統總覽統計
-- SELECT * FROM v_system_overview_stats;

-- 2. 查看待處理事項
-- SELECT * FROM v_pending_tasks;

-- 3. 查看管理員活動統計
-- SELECT * FROM v_admin_activity_stats;

-- 4. 查看使用者詳細統計
-- SELECT * FROM v_user_detailed_stats LIMIT 10;

-- 5. 檢查使用者是否為管理員
-- CALL sp_check_system_admin('550e8400-e29b-41d4-a716-446655440002', @is_admin, @role, @permissions);
-- SELECT @is_admin, @role, @permissions;

-- 6. 取得系統統計
-- CALL sp_get_system_stats('month');

-- 7. 清理90天前的日誌
-- CALL sp_cleanup_old_logs(90);

-- ============================================================================
-- 清理腳本 (需要時使用)
-- ============================================================================

-- 刪除系統管理員相關資料表
-- DROP TABLE IF EXISTS user_reports;
-- DROP TABLE IF EXISTS system_settings;
-- DROP TABLE IF EXISTS system_logs;
-- DROP TABLE IF EXISTS product_reviews;
-- DROP TABLE IF EXISTS temple_applications;
-- DROP TABLE IF EXISTS admin_users;

-- 刪除視圖
-- DROP VIEW IF EXISTS v_system_overview_stats;
-- DROP VIEW IF EXISTS v_pending_tasks;
-- DROP VIEW IF EXISTS v_admin_activity_stats;
-- DROP VIEW IF EXISTS v_user_detailed_stats;

-- 刪除預存程序
-- DROP PROCEDURE IF EXISTS sp_check_system_admin;
-- DROP PROCEDURE IF EXISTS sp_get_system_stats;
-- DROP PROCEDURE IF EXISTS sp_cleanup_old_logs;
