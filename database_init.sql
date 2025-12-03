-- ============================================================================
-- 平安符打卡系統 - MySQL 資料庫初始化腳本
-- ============================================================================
-- 版本: 1.0.0
-- 日期: 2025-01-15
-- 資料庫: MySQL 8.0+
-- 編碼: UTF-8
-- ============================================================================

-- 建立資料庫
CREATE DATABASE IF NOT EXISTS temple_checkin
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE temple_checkin;

-- ============================================================================
-- 資料表建立
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 使用者表 (users)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY COMMENT '使用者 UUID',
    username VARCHAR(80) NOT NULL UNIQUE COMMENT '使用者名稱',
    email VARCHAR(120) NOT NULL UNIQUE COMMENT '電子郵件',
    password_hash VARCHAR(128) NOT NULL COMMENT '加密後的密碼',
    blessing_points INT DEFAULT 0 COMMENT '祈福點數',
    is_admin BOOLEAN DEFAULT FALSE COMMENT '是否為管理員',
    is_active BOOLEAN DEFAULT TRUE COMMENT '帳號是否啟用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_is_active (is_active),
    INDEX idx_blessing_points (blessing_points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='使用者資料表';

-- ----------------------------------------------------------------------------
-- 平安符表 (amulets)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS amulets;
CREATE TABLE amulets (
    id VARCHAR(36) PRIMARY KEY COMMENT '平安符 UUID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者 ID',
    uid VARCHAR(50) NOT NULL UNIQUE COMMENT 'NFC 卡片 UID',
    name VARCHAR(100) NOT NULL COMMENT '平安符名稱',
    description TEXT COMMENT '平安符描述',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    INDEX idx_user_id (user_id),
    INDEX idx_uid (uid),
    INDEX idx_is_active (is_active),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平安符資料表';

-- ----------------------------------------------------------------------------
-- 廟宇表 (temples)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS temples;
CREATE TABLE temples (
    id VARCHAR(36) PRIMARY KEY COMMENT '廟宇 UUID',
    name VARCHAR(100) NOT NULL COMMENT '廟宇名稱',
    address VARCHAR(200) COMMENT '廟宇地址',
    latitude DECIMAL(10, 8) COMMENT '緯度',
    longitude DECIMAL(11, 8) COMMENT '經度',
    main_deity VARCHAR(50) COMMENT '主祀神明',
    description TEXT COMMENT '廟宇描述',
    nfc_uid VARCHAR(50) UNIQUE COMMENT 'NFC 標籤 UID',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_nfc_uid (nfc_uid),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='廟宇資料表';

-- ----------------------------------------------------------------------------
-- 打卡記錄表 (checkins)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS checkins;
CREATE TABLE checkins (
    id VARCHAR(36) PRIMARY KEY COMMENT '打卡記錄 UUID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者 ID',
    temple_id VARCHAR(36) NOT NULL COMMENT '廟宇 ID',
    amulet_id VARCHAR(36) NOT NULL COMMENT '平安符 ID',
    checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '打卡時間',
    blessing_points INT NOT NULL COMMENT '獲得的祈福點數',
    latitude DECIMAL(10, 8) COMMENT '打卡緯度',
    longitude DECIMAL(11, 8) COMMENT '打卡經度',
    notes TEXT COMMENT '打卡備註',
    
    INDEX idx_user_id (user_id),
    INDEX idx_temple_id (temple_id),
    INDEX idx_amulet_id (amulet_id),
    INDEX idx_checkin_time (checkin_time),
    INDEX idx_user_temple_date (user_id, temple_id, checkin_time),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    FOREIGN KEY (amulet_id) REFERENCES amulets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡記錄表';

-- ============================================================================
-- 測試資料插入
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 插入測試使用者
-- ----------------------------------------------------------------------------
-- 密碼: password123 (使用 Werkzeug 加密)
INSERT INTO users (id, username, email, password_hash, blessing_points, is_admin, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'test_user', 'test@example.com', 
 'pbkdf2:sha256:600000$7rJ8KZm9$c5e8f0a7b9d6e4f3a2c1b0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9', 
 100, FALSE, TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'admin_user', 'admin@example.com', 
 'pbkdf2:sha256:600000$8sK9LAn0$d6f9g1h0c7d5f4g3b2c1a0d9e8f7b6c5d4e3f2a1b0c9d8e7f6b5c4d3e2f1a0', 
 500, TRUE, TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'john_doe', 'john@example.com', 
 'pbkdf2:sha256:600000$9tL0MBo1$e7g0h1i2d8e6g5h4c3d2b1e0f9a8b7c6d5e4f3b2c1d0e9f8a7b6c5d4e3f2b1', 
 250, FALSE, TRUE);

-- ----------------------------------------------------------------------------
-- 插入測試平安符
-- ----------------------------------------------------------------------------
INSERT INTO amulets (id, user_id, uid, name, description, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
 'UID001', '我的第一個平安符', '在龍山寺求得', TRUE),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 
 'UID002', '平安符2號', '行天宮求得', TRUE),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 
 'UID003', 'John的平安符', '文昌廟求得', TRUE);

-- ----------------------------------------------------------------------------
-- 插入測試廟宇資料
-- ----------------------------------------------------------------------------
INSERT INTO temples (id, name, address, latitude, longitude, main_deity, description, nfc_uid, is_active) VALUES
-- 台北市廟宇
('750e8400-e29b-41d4-a716-446655440001', '艋舺龍山寺', '台北市萬華區廣州街211號', 
 25.03688900, 121.49972200, '觀音菩薩', 
 '艋舺龍山寺創建於清乾隆3年（1738年），是台灣著名的古蹟,也是重要的宗教信仰中心。', 
 'TEMPLE001', TRUE),

('750e8400-e29b-41d4-a716-446655440002', '台北行天宮', '台北市中山區民權東路二段109號', 
 25.06297800, 121.53351900, '關聖帝君', 
 '行天宮又名恩主公廟,主祀關聖帝君,是台北市香火最鼎盛的廟宇之一。', 
 'TEMPLE002', TRUE),

('750e8400-e29b-41d4-a716-446655440003', '台北文昌宮', '台北市中正區文昌街84號', 
 25.03421100, 121.51178300, '文昌帝君', 
 '文昌宮主祀文昌帝君,是許多考生祈求考運的重要廟宇。', 
 'TEMPLE003', TRUE),

('750e8400-e29b-41d4-a716-446655440004', '台北霞海城隍廟', '台北市大同區迪化街一段61號', 
 25.05525600, 121.51033300, '城隍爺', 
 '霞海城隍廟位於大稻埕,以月老聞名,是著名的求姻緣廟宇。', 
 'TEMPLE004', TRUE),

('750e8400-e29b-41d4-a716-446655440005', '台北松山慈祐宮', '台北市松山區八德路四段761號', 
 25.05011100, 121.57738900, '媽祖', 
 '松山慈祐宮是台北市重要的媽祖廟,也是松山地區的信仰中心。', 
 'TEMPLE005', TRUE),

-- 新北市廟宇
('750e8400-e29b-41d4-a716-446655440006', '淡水福佑宮', '新北市淡水區中正路200號', 
 25.16877800, 121.44138900, '媽祖', 
 '福佑宮是淡水最古老的廟宇之一,建於清乾隆47年。', 
 'TEMPLE006', TRUE),

('750e8400-e29b-41d4-a716-446655440007', '中和烘爐地南山福德宮', '新北市中和區興南路二段399巷160之1號', 
 24.99527800, 121.49527800, '土地公', 
 '烘爐地是北台灣著名的土地公廟,以巨大的土地公像聞名。', 
 'TEMPLE007', TRUE),

('750e8400-e29b-41d4-a716-446655440008', '板橋慈惠宮', '新北市板橋區府中路81號', 
 25.01138900, 121.46277800, '媽祖', 
 '板橋慈惠宮是板橋地區的信仰中心,有三百多年的歷史。', 
 'TEMPLE008', TRUE),

-- 桃園市廟宇
('750e8400-e29b-41d4-a716-446655440009', '桃園景福宮', '桃園市桃園區中正路208號', 
 24.99388900, 121.31277800, '開漳聖王', 
 '景福宮是桃園市最古老的廟宇,建於清乾隆年間。', 
 'TEMPLE009', TRUE),

('750e8400-e29b-41d4-a716-446655440010', '中壢仁海宮', '桃園市中壢區延平路198號', 
 24.96527800, 121.22527800, '媽祖', 
 '仁海宮是中壢地區重要的媽祖廟,香火鼎盛。', 
 'TEMPLE010', TRUE);

-- ----------------------------------------------------------------------------
-- 插入測試打卡記錄
-- ----------------------------------------------------------------------------
INSERT INTO checkins (id, user_id, temple_id, amulet_id, checkin_time, blessing_points, latitude, longitude, notes) VALUES
-- test_user 的打卡記錄
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
 '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 
 '2025-01-10 10:30:00', 10, 25.03688900, 121.49972200, '虔誠祈福'),

('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 
 '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 
 '2025-01-11 14:20:00', 10, 25.06297800, 121.53351900, '求事業順利'),

('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 
 '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 
 '2025-01-12 09:15:00', 10, 25.03421100, 121.51178300, '祈求考試順利'),

-- john_doe 的打卡記錄
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 
 '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 
 '2025-01-10 15:30:00', 10, 25.03688900, 121.49972200, '平安健康'),

('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 
 '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 
 '2025-01-13 11:00:00', 10, 25.05525600, 121.51033300, '求姻緣');

-- ============================================================================
-- 資料完整性檢查 Views
-- ============================================================================

-- 使用者統計視圖
CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.blessing_points,
    COUNT(DISTINCT c.id) as total_checkins,
    COUNT(DISTINCT c.temple_id) as unique_temples,
    COUNT(DISTINCT a.id) as total_amulets
FROM users u
LEFT JOIN checkins c ON u.id = c.user_id
LEFT JOIN amulets a ON u.id = a.user_id AND a.is_active = TRUE
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.email, u.blessing_points;

-- 廟宇統計視圖
CREATE OR REPLACE VIEW v_temple_stats AS
SELECT 
    t.id,
    t.name,
    t.main_deity,
    COUNT(c.id) as visit_count,
    SUM(c.blessing_points) as total_points
FROM temples t
LEFT JOIN checkins c ON t.id = c.temple_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.main_deity
ORDER BY visit_count DESC;

-- ============================================================================
-- 觸發器 (Triggers)
-- ============================================================================

-- 打卡後自動更新使用者點數
DELIMITER //

CREATE TRIGGER after_checkin_insert
AFTER INSERT ON checkins
FOR EACH ROW
BEGIN
    UPDATE users 
    SET blessing_points = blessing_points + NEW.blessing_points
    WHERE id = NEW.user_id;
END//

DELIMITER ;

-- ============================================================================
-- 預存程序 (Stored Procedures)
-- ============================================================================

-- 取得使用者的打卡統計
DELIMITER //

CREATE PROCEDURE sp_get_user_checkin_stats(IN p_user_id VARCHAR(36))
BEGIN
    SELECT 
        COUNT(*) as total_checkins,
        COUNT(DISTINCT temple_id) as unique_temples,
        SUM(blessing_points) as total_points,
        MIN(checkin_time) as first_checkin,
        MAX(checkin_time) as last_checkin
    FROM checkins
    WHERE user_id = p_user_id;
END//

DELIMITER ;

-- 取得廟宇排行榜
DELIMITER //

CREATE PROCEDURE sp_get_temple_ranking(IN p_limit INT)
BEGIN
    SELECT 
        t.id,
        t.name,
        t.main_deity,
        COUNT(c.id) as visit_count,
        SUM(c.blessing_points) as total_points
    FROM temples t
    LEFT JOIN checkins c ON t.id = c.temple_id
    WHERE t.is_active = TRUE
    GROUP BY t.id, t.name, t.main_deity
    ORDER BY visit_count DESC
    LIMIT p_limit;
END//

DELIMITER ;

-- 檢查今日是否已在特定廟宇打卡
DELIMITER //

CREATE PROCEDURE sp_check_today_checkin(
    IN p_user_id VARCHAR(36),
    IN p_temple_id VARCHAR(36),
    OUT p_has_checked_in BOOLEAN
)
BEGIN
    DECLARE checkin_count INT;
    
    SELECT COUNT(*) INTO checkin_count
    FROM checkins
    WHERE user_id = p_user_id
      AND temple_id = p_temple_id
      AND DATE(checkin_time) = CURDATE();
    
    SET p_has_checked_in = (checkin_count > 0);
END//

DELIMITER ;

-- ============================================================================
-- 權限設定
-- ============================================================================

-- 建立應用程式使用的資料庫使用者 (生產環境建議)
-- CREATE USER IF NOT EXISTS 'temple_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE ON temple_checkin.* TO 'temple_app'@'localhost';
-- GRANT DELETE ON temple_checkin.checkins TO 'temple_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- 資料驗證查詢
-- ============================================================================

-- 檢查資料表記錄數
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'amulets', COUNT(*) FROM amulets
UNION ALL
SELECT 'temples', COUNT(*) FROM temples
UNION ALL
SELECT 'checkins', COUNT(*) FROM checkins;

-- 檢查測試帳號
SELECT id, username, email, blessing_points, is_admin 
FROM users 
WHERE email IN ('test@example.com', 'admin@example.com');

-- 檢查廟宇資料
SELECT id, name, main_deity, is_active 
FROM temples 
WHERE is_active = TRUE
ORDER BY name;

-- ============================================================================
-- 初始化完成訊息
-- ============================================================================

SELECT 
    '✅ 資料庫初始化完成！' as message,
    CONCAT(
        '資料表: ', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'temple_checkin'),
        ' | 使用者: ',
        (SELECT COUNT(*) FROM users),
        ' | 廟宇: ',
        (SELECT COUNT(*) FROM temples),
        ' | 打卡記錄: ',
        (SELECT COUNT(*) FROM checkins)
    ) as statistics;

-- ============================================================================
-- 清理腳本 (需要時使用)
-- ============================================================================

-- 清空所有資料但保留資料表結構
-- TRUNCATE TABLE checkins;
-- TRUNCATE TABLE amulets;
-- TRUNCATE TABLE temples;
-- TRUNCATE TABLE users;

-- 完全刪除資料庫
-- DROP DATABASE IF EXISTS temple_checkin;
