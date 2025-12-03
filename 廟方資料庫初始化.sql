-- ============================================================================
-- 廟方管理系統 - 資料庫擴充腳本
-- ============================================================================
-- 說明: 此腳本為平安符打卡系統新增廟方管理功能
-- 版本: 1.0.0
-- 日期: 2025-01-15
-- ============================================================================

USE temple_checkin;

-- ============================================================================
-- 修改現有 temples 表,新增管理欄位
-- ============================================================================

ALTER TABLE temples 
ADD COLUMN contact_person VARCHAR(50) COMMENT '聯絡人' AFTER description,
ADD COLUMN contact_phone VARCHAR(20) COMMENT '聯絡電話' AFTER contact_person,
ADD COLUMN contact_email VARCHAR(120) COMMENT '聯絡信箱' AFTER contact_phone,
ADD COLUMN opening_hours JSON COMMENT '開放時間' AFTER contact_email,
ADD COLUMN facilities JSON COMMENT '設施資訊' AFTER opening_hours,
ADD COLUMN default_points INT DEFAULT 10 COMMENT '預設打卡功德值' AFTER facilities,
ADD COLUMN website_url VARCHAR(200) COMMENT '官方網站' AFTER default_points,
ADD COLUMN facebook_url VARCHAR(200) COMMENT 'Facebook 粉絲頁' AFTER website_url,
ADD COLUMN instagram_url VARCHAR(200) COMMENT 'Instagram' AFTER facebook_url;

-- ============================================================================
-- 資料表建立
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 廟宇管理員關聯表 (temple_admins)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS temple_admins;
CREATE TABLE temple_admins (
    id VARCHAR(36) PRIMARY KEY COMMENT '管理員關聯 UUID',
    temple_id VARCHAR(36) NOT NULL COMMENT '廟宇 ID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者 ID',
    role ENUM('owner', 'manager', 'staff') NOT NULL DEFAULT 'manager' COMMENT '角色',
    permissions JSON COMMENT '權限設定',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    created_by VARCHAR(36) COMMENT '建立者 ID',
    
    UNIQUE KEY uk_temple_user (temple_id, user_id),
    INDEX idx_temple_id (temple_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_role (role),
    
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='廟宇管理員關聯表';

-- ----------------------------------------------------------------------------
-- 廟宇公告表 (temple_announcements)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS temple_announcements;
CREATE TABLE temple_announcements (
    id VARCHAR(36) PRIMARY KEY COMMENT '公告 UUID',
    temple_id VARCHAR(36) NOT NULL COMMENT '廟宇 ID',
    title VARCHAR(200) NOT NULL COMMENT '公告標題',
    content TEXT NOT NULL COMMENT '公告內容',
    type ENUM('event', 'festival', 'maintenance', 'news', 'important') NOT NULL COMMENT '公告類型',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' COMMENT '優先級',
    image_url VARCHAR(500) COMMENT '公告圖片',
    start_date DATETIME COMMENT '開始顯示時間',
    end_date DATETIME COMMENT '結束顯示時間',
    is_published BOOLEAN DEFAULT FALSE COMMENT '是否發布',
    view_count INT DEFAULT 0 COMMENT '瀏覽次數',
    created_by VARCHAR(36) COMMENT '建立者 ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    
    INDEX idx_temple_id (temple_id),
    INDEX idx_is_published (is_published),
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='廟宇公告表';

-- ----------------------------------------------------------------------------
-- 廟宇專屬商品表 (temple_products)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS temple_products;
CREATE TABLE temple_products (
    id VARCHAR(36) PRIMARY KEY COMMENT '商品 UUID',
    temple_id VARCHAR(36) NOT NULL COMMENT '廟宇 ID',
    name VARCHAR(100) NOT NULL COMMENT '商品名稱',
    description TEXT COMMENT '商品描述',
    category VARCHAR(50) NOT NULL COMMENT '商品分類',
    merit_points INT NOT NULL COMMENT '所需功德值',
    stock_quantity INT DEFAULT 0 COMMENT '庫存數量',
    image_url VARCHAR(500) COMMENT '商品圖片',
    images JSON COMMENT '多張圖片',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否上架',
    is_exclusive BOOLEAN DEFAULT FALSE COMMENT '是否為限定商品',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_by VARCHAR(36) COMMENT '建立者 ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    
    INDEX idx_temple_id (temple_id),
    INDEX idx_is_active (is_active),
    INDEX idx_category (category),
    INDEX idx_merit_points (merit_points),
    
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='廟宇專屬商品表';

-- ----------------------------------------------------------------------------
-- 打卡獎勵設定表 (checkin_rewards)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS checkin_rewards;
CREATE TABLE checkin_rewards (
    id VARCHAR(36) PRIMARY KEY COMMENT '獎勵設定 UUID',
    temple_id VARCHAR(36) NOT NULL COMMENT '廟宇 ID',
    reward_type ENUM('special_date', 'time_slot', 'consecutive', 'first_visit', 'milestone', 'festival') 
        NOT NULL COMMENT '獎勵類型',
    name VARCHAR(100) NOT NULL COMMENT '獎勵名稱',
    description TEXT COMMENT '獎勵說明',
    bonus_points INT NOT NULL COMMENT '額外功德值',
    condition_value INT COMMENT '條件值(如連續天數、第N次等)',
    start_date DATETIME COMMENT '開始時間',
    end_date DATETIME COMMENT '結束時間',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    max_uses INT COMMENT '最大使用次數(NULL=無限制)',
    used_count INT DEFAULT 0 COMMENT '已使用次數',
    created_by VARCHAR(36) COMMENT '建立者 ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    INDEX idx_temple_id (temple_id),
    INDEX idx_is_active (is_active),
    INDEX idx_reward_type (reward_type),
    INDEX idx_dates (start_date, end_date),
    
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡獎勵設定表';

-- ----------------------------------------------------------------------------
-- 獎勵領取記錄表 (reward_claims)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS reward_claims;
CREATE TABLE reward_claims (
    id VARCHAR(36) PRIMARY KEY COMMENT '領取記錄 UUID',
    reward_id VARCHAR(36) NOT NULL COMMENT '獎勵設定 ID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者 ID',
    checkin_id VARCHAR(36) NOT NULL COMMENT '打卡記錄 ID',
    bonus_points INT NOT NULL COMMENT '獲得的額外功德值',
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '領取時間',
    
    INDEX idx_reward_id (reward_id),
    INDEX idx_user_id (user_id),
    INDEX idx_checkin_id (checkin_id),
    INDEX idx_claimed_at (claimed_at),
    
    FOREIGN KEY (reward_id) REFERENCES checkin_rewards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='獎勵領取記錄表';

-- ============================================================================
-- 測試資料插入
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 更新現有廟宇的管理資訊
-- ----------------------------------------------------------------------------
UPDATE temples 
SET 
    contact_person = '王主委',
    contact_phone = '02-23021270',
    contact_email = 'longshan@temple.com',
    opening_hours = JSON_OBJECT(
        'monday', JSON_OBJECT('open', '06:00', 'close', '21:00'),
        'tuesday', JSON_OBJECT('open', '06:00', 'close', '21:00'),
        'wednesday', JSON_OBJECT('open', '06:00', 'close', '21:00'),
        'thursday', JSON_OBJECT('open', '06:00', 'close', '21:00'),
        'friday', JSON_OBJECT('open', '06:00', 'close', '21:00'),
        'saturday', JSON_OBJECT('open', '06:00', 'close', '22:00'),
        'sunday', JSON_OBJECT('open', '06:00', 'close', '22:00'),
        'notes', '初一、十五開放至午夜'
    ),
    facilities = JSON_OBJECT(
        'parking', true,
        'wheelchair_accessible', true,
        'restroom', true,
        'prayer_room', true,
        'gift_shop', true,
        'cafe', false
    ),
    default_points = 10,
    website_url = 'https://www.lungshan.org.tw',
    facebook_url = 'https://facebook.com/lungshan.temple'
WHERE id = '750e8400-e29b-41d4-a716-446655440001'; -- 龍山寺

-- ----------------------------------------------------------------------------
-- 插入廟宇管理員 (讓 admin_user 成為龍山寺的管理員)
-- ----------------------------------------------------------------------------
INSERT INTO temple_admins (id, temple_id, user_id, role, permissions, is_active) VALUES
-- admin_user 是龍山寺的擁有者
('tadmin-0001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'owner',
 JSON_OBJECT(
     'manage_info', true,
     'view_stats', true,
     'manage_products', true,
     'manage_announcements', true,
     'manage_rewards', true,
     'manage_admins', true
 ), TRUE),

-- test_user 是行天宮的管理員
('tadmin-0002', '750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'manager',
 JSON_OBJECT(
     'manage_info', true,
     'view_stats', true,
     'manage_products', true,
     'manage_announcements', true,
     'manage_rewards', false,
     'manage_admins', false
 ), TRUE);

-- ----------------------------------------------------------------------------
-- 插入測試公告
-- ----------------------------------------------------------------------------
INSERT INTO temple_announcements (id, temple_id, title, content, type, priority, image_url, start_date, end_date, is_published, view_count, created_by) VALUES
-- 龍山寺的公告
('announce-0001', '750e8400-e29b-41d4-a716-446655440001', 
 '2025年新春祈福法會',
 '本寺將於農曆正月初一至十五舉辦新春祈福法會，歡迎信眾參加。法會時間為每日上午9點至下午5點，現場提供平安米結緣。',
 'festival', 'high', 'https://example.com/announcements/newyear.jpg',
 '2025-01-29 00:00:00', '2025-02-12 23:59:59', TRUE, 350, '550e8400-e29b-41d4-a716-446655440002'),

('announce-0002', '750e8400-e29b-41d4-a716-446655440001',
 '觀音菩薩聖誕千秋',
 '農曆二月十九日為觀音菩薩聖誕，當日打卡功德值加倍，歡迎信眾前來參拜。',
 'event', 'urgent', 'https://example.com/announcements/guanyin.jpg',
 '2025-03-15 00:00:00', '2025-03-19 23:59:59', TRUE, 520, '550e8400-e29b-41d4-a716-446655440002'),

('announce-0003', '750e8400-e29b-41d4-a716-446655440001',
 '廟宇維護公告',
 '本寺將於3月20日進行例行性維護，當日暫停開放，造成不便敬請見諒。',
 'maintenance', 'normal', NULL,
 '2025-03-10 00:00:00', '2025-03-20 23:59:59', TRUE, 120, '550e8400-e29b-41d4-a716-446655440002'),

-- 行天宮的公告
('announce-0004', '750e8400-e29b-41d4-a716-446655440002',
 '關聖帝君聖誕慶典',
 '農曆六月二十四日為關聖帝君聖誕，本宮將舉辦盛大慶典活動。',
 'festival', 'high', 'https://example.com/announcements/guandi.jpg',
 '2025-07-10 00:00:00', '2025-07-19 23:59:59', TRUE, 280, '550e8400-e29b-41d4-a716-446655440001');

-- ----------------------------------------------------------------------------
-- 插入廟宇專屬商品
-- ----------------------------------------------------------------------------
INSERT INTO temple_products (id, temple_id, name, description, category, merit_points, stock_quantity, image_url, is_active, is_exclusive, created_by) VALUES
-- 龍山寺專屬商品
('tprod-0001', '750e8400-e29b-41d4-a716-446655440001',
 '龍山寺限定平安符',
 '龍山寺限定款平安符，由法師親自加持，隨身攜帶保平安。',
 'charm', 150, 100, 'https://example.com/temple-products/longshan-charm.jpg', TRUE, TRUE, '550e8400-e29b-41d4-a716-446655440002'),

('tprod-0002', '750e8400-e29b-41d4-a716-446655440001',
 '觀音菩薩吊飾',
 '精緻觀音菩薩造型吊飾，龍山寺獨家販售。',
 'charm', 120, 80, 'https://example.com/temple-products/guanyin-pendant.jpg', TRUE, TRUE, '550e8400-e29b-41d4-a716-446655440002'),

('tprod-0003', '750e8400-e29b-41d4-a716-446655440001',
 '龍山寺紀念T恤',
 '100%純棉T恤，印有龍山寺經典建築圖案。',
 'tshirt', 350, 50, 'https://example.com/temple-products/longshan-tshirt.jpg', TRUE, FALSE, '550e8400-e29b-41d4-a716-446655440002'),

('tprod-0004', '750e8400-e29b-41d4-a716-446655440001',
 '祈福燈籠造型提袋',
 '帆布材質環保提袋，燈籠造型設計。',
 'bag', 250, 60, 'https://example.com/temple-products/lantern-bag.jpg', TRUE, TRUE, '550e8400-e29b-41d4-a716-446655440002'),

-- 行天宮專屬商品
('tprod-0005', '750e8400-e29b-41d4-a716-446655440002',
 '行天宮限定平安符',
 '行天宮關聖帝君加持平安符。',
 'charm', 150, 90, 'https://example.com/temple-products/xingtian-charm.jpg', TRUE, TRUE, '550e8400-e29b-41d4-a716-446655440001'),

('tprod-0006', '750e8400-e29b-41d4-a716-446655440002',
 '關聖帝君書籤',
 '金屬材質關聖帝君造型書籤。',
 'bookmark', 80, 120, 'https://example.com/temple-products/guandi-bookmark.jpg', TRUE, FALSE, '550e8400-e29b-41d4-a716-446655440001');

-- ----------------------------------------------------------------------------
-- 插入打卡獎勵設定
-- ----------------------------------------------------------------------------
INSERT INTO checkin_rewards (id, temple_id, reward_type, name, description, bonus_points, condition_value, start_date, end_date, is_active, max_uses, created_by) VALUES
-- 龍山寺的獎勵
('reward-0001', '750e8400-e29b-41d4-a716-446655440001', 'special_date',
 '觀音菩薩聖誕加倍送',
 '農曆二月十九日觀音菩薩聖誕，打卡功德值雙倍',
 10, NULL, '2025-03-19 00:00:00', '2025-03-19 23:59:59', TRUE, NULL, '550e8400-e29b-41d4-a716-446655440002'),

('reward-0002', '750e8400-e29b-41d4-a716-446655440001', 'consecutive',
 '連續打卡7天獎勵',
 '連續7天來訪，額外獲得50功德值',
 50, 7, NULL, NULL, TRUE, NULL, '550e8400-e29b-41d4-a716-446655440002'),

('reward-0003', '750e8400-e29b-41d4-a716-446655440001', 'milestone',
 '第50次打卡里程碑',
 '累計第50次打卡，獲得100功德值獎勵',
 100, 50, NULL, NULL, TRUE, NULL, '550e8400-e29b-41d4-a716-446655440002'),

('reward-0004', '750e8400-e29b-41d4-a716-446655440001', 'first_visit',
 '首次打卡禮',
 '首次來訪龍山寺，獲得額外20功德值',
 20, NULL, NULL, NULL, TRUE, NULL, '550e8400-e29b-41d4-a716-446655440002'),

-- 行天宮的獎勵
('reward-0005', '750e8400-e29b-41d4-a716-446655440002', 'special_date',
 '關聖帝君聖誕特別獎勵',
 '農曆六月二十四日關聖帝君聖誕，打卡獲得三倍功德值',
 20, NULL, '2025-07-19 00:00:00', '2025-07-19 23:59:59', TRUE, NULL, '550e8400-e29b-41d4-a716-446655440001'),

('reward-0006', '750e8400-e29b-41d4-a716-446655440002', 'consecutive',
 '連續打卡30天大獎',
 '連續30天來訪，獲得200功德值',
 200, 30, NULL, NULL, TRUE, NULL, '550e8400-e29b-41d4-a716-446655440001');

-- ----------------------------------------------------------------------------
-- 插入測試獎勵領取記錄
-- ----------------------------------------------------------------------------
INSERT INTO reward_claims (id, reward_id, user_id, checkin_id, bonus_points) VALUES
-- test_user 領取首次打卡禮
('claim-0001', 'reward-0004', '550e8400-e29b-41d4-a716-446655440001', 
 '850e8400-e29b-41d4-a716-446655440001', 20);

-- ============================================================================
-- 觸發器 (Triggers)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 獎勵領取後更新使用次數
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS after_reward_claim_insert//

CREATE TRIGGER after_reward_claim_insert
AFTER INSERT ON reward_claims
FOR EACH ROW
BEGIN
    -- 增加獎勵使用次數
    UPDATE checkin_rewards 
    SET used_count = used_count + 1
    WHERE id = NEW.reward_id;
    
    -- 增加使用者功德值
    UPDATE users 
    SET blessing_points = blessing_points + NEW.bonus_points
    WHERE id = NEW.user_id;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 公告瀏覽時增加瀏覽次數
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS after_announcement_view//

CREATE TRIGGER after_announcement_view
BEFORE UPDATE ON temple_announcements
FOR EACH ROW
BEGIN
    -- 只在 view_count 增加時觸發
    IF NEW.view_count > OLD.view_count THEN
        SET NEW.updated_at = OLD.updated_at; -- 不更新 updated_at
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- 統計視圖 (Views)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 廟宇管理員統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_temple_admin_stats AS
SELECT 
    t.id as temple_id,
    t.name as temple_name,
    COUNT(ta.id) as admin_count,
    COUNT(CASE WHEN ta.role = 'owner' THEN 1 END) as owner_count,
    COUNT(CASE WHEN ta.role = 'manager' THEN 1 END) as manager_count,
    COUNT(CASE WHEN ta.role = 'staff' THEN 1 END) as staff_count,
    COUNT(CASE WHEN ta.is_active = TRUE THEN 1 END) as active_admin_count
FROM temples t
LEFT JOIN temple_admins ta ON t.id = ta.temple_id
GROUP BY t.id, t.name;

-- ----------------------------------------------------------------------------
-- 廟宇統計總覽視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_temple_overview_stats AS
SELECT 
    t.id,
    t.name,
    t.main_deity,
    COUNT(DISTINCT c.id) as total_checkins,
    COUNT(DISTINCT c.user_id) as unique_visitors,
    SUM(c.blessing_points) as total_points_given,
    COUNT(DISTINCT ta.id) as admin_count,
    COUNT(DISTINCT tp.id) as product_count,
    COUNT(DISTINCT tann.id) as announcement_count,
    COUNT(DISTINCT cr.id) as reward_count
FROM temples t
LEFT JOIN checkins c ON t.id = c.temple_id
LEFT JOIN temple_admins ta ON t.id = ta.temple_id AND ta.is_active = TRUE
LEFT JOIN temple_products tp ON t.id = tp.temple_id AND tp.is_active = TRUE
LEFT JOIN temple_announcements tann ON t.id = tann.temple_id AND tann.is_published = TRUE
LEFT JOIN checkin_rewards cr ON t.id = cr.temple_id AND cr.is_active = TRUE
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.main_deity;

-- ----------------------------------------------------------------------------
-- 公告統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_announcement_stats AS
SELECT 
    tann.id,
    tann.temple_id,
    t.name as temple_name,
    tann.title,
    tann.type,
    tann.priority,
    tann.is_published,
    tann.view_count,
    tann.created_at,
    CASE 
        WHEN tann.start_date IS NULL OR NOW() >= tann.start_date THEN
            CASE 
                WHEN tann.end_date IS NULL OR NOW() <= tann.end_date THEN 'active'
                ELSE 'expired'
            END
        ELSE 'scheduled'
    END as status
FROM temple_announcements tann
JOIN temples t ON tann.temple_id = t.id;

-- ----------------------------------------------------------------------------
-- 獎勵統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_reward_stats AS
SELECT 
    cr.id,
    cr.temple_id,
    t.name as temple_name,
    cr.reward_type,
    cr.name,
    cr.bonus_points,
    cr.is_active,
    cr.used_count,
    cr.max_uses,
    COUNT(rc.id) as claim_count,
    SUM(rc.bonus_points) as total_points_given,
    CASE 
        WHEN cr.max_uses IS NULL THEN 'unlimited'
        WHEN cr.used_count >= cr.max_uses THEN 'exhausted'
        ELSE 'available'
    END as availability_status
FROM checkin_rewards cr
JOIN temples t ON cr.temple_id = t.id
LEFT JOIN reward_claims rc ON cr.id = rc.reward_id
GROUP BY cr.id, cr.temple_id, t.name, cr.reward_type, cr.name, 
         cr.bonus_points, cr.is_active, cr.used_count, cr.max_uses;

-- ----------------------------------------------------------------------------
-- 廟宇商品統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_temple_product_stats AS
SELECT 
    tp.id,
    tp.temple_id,
    t.name as temple_name,
    tp.name as product_name,
    tp.category,
    tp.merit_points,
    tp.stock_quantity,
    tp.is_active,
    tp.is_exclusive,
    COUNT(r.id) as redemption_count,
    SUM(r.quantity) as total_quantity_redeemed
FROM temple_products tp
JOIN temples t ON tp.temple_id = t.id
LEFT JOIN redemptions r ON tp.id = r.product_id AND r.status != 'cancelled'
GROUP BY tp.id, tp.temple_id, t.name, tp.name, tp.category, 
         tp.merit_points, tp.stock_quantity, tp.is_active, tp.is_exclusive;

-- ============================================================================
-- 預存程序 (Stored Procedures)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 檢查使用者是否為廟宇管理員
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_check_temple_admin//

CREATE PROCEDURE sp_check_temple_admin(
    IN p_temple_id VARCHAR(36),
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
    FROM temple_admins
    WHERE temple_id = p_temple_id 
      AND user_id = p_user_id 
      AND is_active = TRUE
    LIMIT 1;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 取得廟宇統計數據
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_temple_stats//

CREATE PROCEDURE sp_get_temple_stats(
    IN p_temple_id VARCHAR(36),
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
    
    -- 回傳統計數據
    SELECT 
        COUNT(*) as total_checkins,
        COUNT(DISTINCT user_id) as unique_visitors,
        SUM(blessing_points) as total_points_given,
        AVG(blessing_points) as avg_points_per_checkin,
        MIN(checkin_time) as first_checkin,
        MAX(checkin_time) as last_checkin
    FROM checkins
    WHERE temple_id = p_temple_id
      AND checkin_time >= v_start_date;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 檢查並自動發放獎勵
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_check_and_grant_rewards//

CREATE PROCEDURE sp_check_and_grant_rewards(
    IN p_checkin_id VARCHAR(36),
    IN p_user_id VARCHAR(36),
    IN p_temple_id VARCHAR(36)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_reward_id VARCHAR(36);
    DECLARE v_reward_type VARCHAR(50);
    DECLARE v_bonus_points INT;
    DECLARE v_condition_value INT;
    
    DECLARE reward_cursor CURSOR FOR
        SELECT id, reward_type, bonus_points, condition_value
        FROM checkin_rewards
        WHERE temple_id = p_temple_id
          AND is_active = TRUE
          AND (start_date IS NULL OR NOW() >= start_date)
          AND (end_date IS NULL OR NOW() <= end_date)
          AND (max_uses IS NULL OR used_count < max_uses);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN reward_cursor;
    
    reward_loop: LOOP
        FETCH reward_cursor INTO v_reward_id, v_reward_type, v_bonus_points, v_condition_value;
        
        IF done THEN
            LEAVE reward_loop;
        END IF;
        
        -- 根據獎勵類型檢查條件
        CASE v_reward_type
            WHEN 'first_visit' THEN
                -- 檢查是否為首次打卡
                IF (SELECT COUNT(*) FROM checkins WHERE user_id = p_user_id AND temple_id = p_temple_id) = 1 THEN
                    INSERT INTO reward_claims (id, reward_id, user_id, checkin_id, bonus_points)
                    VALUES (UUID(), v_reward_id, p_user_id, p_checkin_id, v_bonus_points);
                END IF;
            
            WHEN 'special_date' THEN
                -- 特殊日期獎勵會在當天自動發放
                INSERT INTO reward_claims (id, reward_id, user_id, checkin_id, bonus_points)
                VALUES (UUID(), v_reward_id, p_user_id, p_checkin_id, v_bonus_points);
            
            -- 其他獎勵類型可以在這裡添加
        END CASE;
    END LOOP;
    
    CLOSE reward_cursor;
END//

DELIMITER ;

-- ============================================================================
-- 資料完整性檢查
-- ============================================================================

-- 檢查新增的資料表記錄數
SELECT '廟宇管理員' as table_name, COUNT(*) as record_count FROM temple_admins
UNION ALL
SELECT '廟宇公告', COUNT(*) FROM temple_announcements
UNION ALL
SELECT '廟宇商品', COUNT(*) FROM temple_products
UNION ALL
SELECT '打卡獎勵', COUNT(*) FROM checkin_rewards
UNION ALL
SELECT '獎勵領取', COUNT(*) FROM reward_claims;

-- 檢查廟宇管理員分布
SELECT 
    role,
    COUNT(*) as count,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_count
FROM temple_admins
GROUP BY role;

-- 檢查公告類型分布
SELECT 
    type,
    COUNT(*) as count,
    COUNT(CASE WHEN is_published = TRUE THEN 1 END) as published_count
FROM temple_announcements
GROUP BY type;

-- 檢查獎勵類型分布
SELECT 
    reward_type,
    COUNT(*) as count,
    SUM(used_count) as total_used
FROM checkin_rewards
GROUP BY reward_type;

-- ============================================================================
-- 初始化完成訊息
-- ============================================================================

SELECT 
    '✅ 廟方管理系統初始化完成！' as message,
    CONCAT(
        '管理員: ', (SELECT COUNT(*) FROM temple_admins),
        ' | 公告: ', (SELECT COUNT(*) FROM temple_announcements),
        ' | 商品: ', (SELECT COUNT(*) FROM temple_products),
        ' | 獎勵: ', (SELECT COUNT(*) FROM checkin_rewards)
    ) as statistics;

-- ============================================================================
-- 測試查詢範例
-- ============================================================================

-- 1. 查看廟宇總覽統計
-- SELECT * FROM v_temple_overview_stats;

-- 2. 查看某廟宇的管理員
-- SELECT * FROM temple_admins WHERE temple_id = '750e8400-e29b-41d4-a716-446655440001';

-- 3. 查看有效公告
-- SELECT * FROM v_announcement_stats WHERE status = 'active';

-- 4. 查看獎勵統計
-- SELECT * FROM v_reward_stats;

-- 5. 檢查使用者是否為廟宇管理員
-- CALL sp_check_temple_admin('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', @is_admin, @role, @permissions);
-- SELECT @is_admin, @role, @permissions;

-- 6. 取得廟宇統計
-- CALL sp_get_temple_stats('750e8400-e29b-41d4-a716-446655440001', 'month');

-- ============================================================================
-- 清理腳本 (需要時使用)
-- ============================================================================

-- 刪除廟方相關資料表
-- DROP TABLE IF EXISTS reward_claims;
-- DROP TABLE IF EXISTS checkin_rewards;
-- DROP TABLE IF EXISTS temple_products;
-- DROP TABLE IF EXISTS temple_announcements;
-- DROP TABLE IF EXISTS temple_admins;

-- 刪除視圖
-- DROP VIEW IF EXISTS v_temple_admin_stats;
-- DROP VIEW IF EXISTS v_temple_overview_stats;
-- DROP VIEW IF EXISTS v_announcement_stats;
-- DROP VIEW IF EXISTS v_reward_stats;
-- DROP VIEW IF EXISTS v_temple_product_stats;

-- 刪除預存程序
-- DROP PROCEDURE IF EXISTS sp_check_temple_admin;
-- DROP PROCEDURE IF EXISTS sp_get_temple_stats;
-- DROP PROCEDURE IF EXISTS sp_check_and_grant_rewards;
