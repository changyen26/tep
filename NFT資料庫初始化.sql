-- ============================================================================
-- NFT 成就徽章系統 - 資料庫擴充腳本
-- ============================================================================
-- 說明: 此腳本為平安符打卡系統新增 NFT 成就徽章功能
-- 版本: 1.0.0
-- 日期: 2025-01-15
-- ============================================================================

USE temple_checkin;

-- ============================================================================
-- 資料表建立
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 成就類型表 (achievement_types)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS achievement_types;
CREATE TABLE achievement_types (
    id VARCHAR(36) PRIMARY KEY COMMENT '成就類型 UUID',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '成就代碼',
    name VARCHAR(100) NOT NULL COMMENT '成就名稱',
    name_en VARCHAR(100) COMMENT '英文名稱',
    description TEXT COMMENT '成就描述',
    category ENUM(
        'checkin_milestone',
        'temple_collection', 
        'consecutive_checkin',
        'special_achievement',
        'temple_exclusive',
        'seasonal',
        'merit_points'
    ) NOT NULL COMMENT '成就分類',
    icon_url VARCHAR(500) COMMENT '徽章圖示 URL',
    criteria JSON NOT NULL COMMENT '達成條件',
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') 
        DEFAULT 'common' COMMENT '稀有度',
    points_reward INT DEFAULT 0 COMMENT '獎勵功德值',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    display_order INT DEFAULT 0 COMMENT '顯示順序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_rarity (rarity),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就類型表';

-- ----------------------------------------------------------------------------
-- 使用者成就記錄表 (user_achievements)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS user_achievements;
CREATE TABLE user_achievements (
    id VARCHAR(36) PRIMARY KEY COMMENT '記錄 UUID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者 ID',
    achievement_type_id VARCHAR(36) NOT NULL COMMENT '成就類型 ID',
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '解鎖時間',
    related_checkin_id VARCHAR(36) COMMENT '相關打卡記錄',
    related_temple_id VARCHAR(36) COMMENT '相關廟宇',
    achievement_data JSON COMMENT '成就數據快照',
    is_minted BOOLEAN DEFAULT FALSE COMMENT '是否已鑄造 NFT',
    nft_id VARCHAR(36) COMMENT 'NFT 記錄 ID',
    
    UNIQUE KEY uk_user_achievement (user_id, achievement_type_id),
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_type_id (achievement_type_id),
    INDEX idx_unlocked_at (unlocked_at),
    INDEX idx_is_minted (is_minted),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_type_id) REFERENCES achievement_types(id) ON DELETE CASCADE,
    FOREIGN KEY (related_checkin_id) REFERENCES checkins(id) ON DELETE SET NULL,
    FOREIGN KEY (related_temple_id) REFERENCES temples(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='使用者成就記錄表';

-- ----------------------------------------------------------------------------
-- NFT 記錄表 (nfts)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS nfts;
CREATE TABLE nfts (
    id VARCHAR(36) PRIMARY KEY COMMENT 'NFT 記錄 UUID',
    user_id VARCHAR(36) NOT NULL COMMENT '擁有者 ID',
    achievement_id VARCHAR(36) NOT NULL UNIQUE COMMENT '成就記錄 ID',
    token_id BIGINT COMMENT '鏈上 Token ID',
    contract_address VARCHAR(42) COMMENT '智能合約地址',
    wallet_address VARCHAR(42) COMMENT '錢包地址',
    blockchain VARCHAR(20) DEFAULT 'polygon' COMMENT '區塊鏈網路',
    transaction_hash VARCHAR(66) COMMENT '交易雜湊',
    metadata_uri VARCHAR(500) COMMENT 'Metadata URI',
    image_url VARCHAR(500) COMMENT 'NFT 圖片 URL',
    status ENUM('pending', 'minting', 'minted', 'failed') 
        DEFAULT 'pending' COMMENT '鑄造狀態',
    minted_at DATETIME COMMENT '鑄造時間',
    error_message TEXT COMMENT '錯誤訊息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    INDEX idx_user_id (user_id),
    INDEX idx_token_id (token_id),
    INDEX idx_status (status),
    INDEX idx_blockchain (blockchain),
    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_wallet_address (wallet_address),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES user_achievements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='NFT 記錄表';

-- ----------------------------------------------------------------------------
-- NFT Metadata 表 (nft_metadata)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS nft_metadata;
CREATE TABLE nft_metadata (
    id VARCHAR(36) PRIMARY KEY COMMENT 'Metadata UUID',
    nft_id VARCHAR(36) NOT NULL UNIQUE COMMENT 'NFT 記錄 ID',
    name VARCHAR(200) NOT NULL COMMENT 'NFT 名稱',
    description TEXT COMMENT 'NFT 描述',
    image VARCHAR(500) NOT NULL COMMENT '圖片 URL',
    external_url VARCHAR(500) COMMENT '外部連結',
    attributes JSON COMMENT '屬性列表',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='NFT Metadata 表';

-- ----------------------------------------------------------------------------
-- 錢包連接記錄表 (wallet_connections)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS wallet_connections;
CREATE TABLE wallet_connections (
    id VARCHAR(36) PRIMARY KEY COMMENT '記錄 UUID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者 ID',
    wallet_address VARCHAR(42) NOT NULL COMMENT '錢包地址',
    blockchain VARCHAR(20) NOT NULL COMMENT '區塊鏈網路',
    is_primary BOOLEAN DEFAULT FALSE COMMENT '是否為主要錢包',
    verified_at DATETIME COMMENT '驗證時間',
    last_used DATETIME COMMENT '最後使用時間',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '連接時間',
    
    UNIQUE KEY uk_wallet_blockchain (wallet_address, blockchain),
    INDEX idx_user_id (user_id),
    INDEX idx_is_primary (is_primary),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='錢包連接記錄表';

-- ============================================================================
-- 測試資料插入
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 插入成就類型
-- ----------------------------------------------------------------------------

-- 1. 打卡里程碑徽章
INSERT INTO achievement_types (id, code, name, name_en, description, category, icon_url, criteria, rarity, points_reward, display_order) VALUES
('ach-0001', 'FIRST_CHECKIN', '初心不忘', 'First Step', '完成首次打卡,踏上虔誠之路', 
 'checkin_milestone', 'https://cdn.example.com/badges/first_checkin.png',
 JSON_OBJECT('type', 'checkin_count', 'value', 1), 'common', 10, 1),

('ach-0002', 'CHECKIN_10', '十全十美', 'Perfect Ten', '累積打卡 10 次',
 'checkin_milestone', 'https://cdn.example.com/badges/checkin_10.png',
 JSON_OBJECT('type', 'checkin_count', 'value', 10), 'common', 20, 2),

('ach-0003', 'CHECKIN_50', '五十而知天命', 'Half Century', '累積打卡 50 次',
 'checkin_milestone', 'https://cdn.example.com/badges/checkin_50.png',
 JSON_OBJECT('type', 'checkin_count', 'value', 50), 'uncommon', 50, 3),

('ach-0004', 'CHECKIN_100', '百次參拜', 'Century Mark', '累積打卡 100 次',
 'checkin_milestone', 'https://cdn.example.com/badges/checkin_100.png',
 JSON_OBJECT('type', 'checkin_count', 'value', 100), 'rare', 100, 4),

('ach-0005', 'CHECKIN_365', '圓滿之年', 'Full Year', '累積打卡 365 次',
 'checkin_milestone', 'https://cdn.example.com/badges/checkin_365.png',
 JSON_OBJECT('type', 'checkin_count', 'value', 365), 'epic', 365, 5),

('ach-0006', 'CHECKIN_1000', '千里之行', 'Thousand Miles', '累積打卡 1000 次',
 'checkin_milestone', 'https://cdn.example.com/badges/checkin_1000.png',
 JSON_OBJECT('type', 'checkin_count', 'value', 1000), 'legendary', 1000, 6);

-- 2. 廟宇收集徽章
INSERT INTO achievement_types (id, code, name, name_en, description, category, icon_url, criteria, rarity, points_reward, display_order) VALUES
('ach-0007', 'TEMPLE_5', '五方朝聖', 'Five Temples', '參拜 5 座不同的廟宇',
 'temple_collection', 'https://cdn.example.com/badges/temple_5.png',
 JSON_OBJECT('type', 'unique_temples', 'value', 5), 'common', 25, 10),

('ach-0008', 'TEMPLE_10', '十方圓滿', 'Ten Temples', '參拜 10 座不同的廟宇',
 'temple_collection', 'https://cdn.example.com/badges/temple_10.png',
 JSON_OBJECT('type', 'unique_temples', 'value', 10), 'uncommon', 50, 11),

('ach-0009', 'TEMPLE_25', '四分之一收集家', 'Quarter Collector', '參拜 25 座不同的廟宇',
 'temple_collection', 'https://cdn.example.com/badges/temple_25.png',
 JSON_OBJECT('type', 'unique_temples', 'value', 25), 'rare', 125, 12),

('ach-0010', 'TEMPLE_ALL', '完美收集家', 'Perfect Collector', '參拜所有廟宇',
 'temple_collection', 'https://cdn.example.com/badges/temple_all.png',
 JSON_OBJECT('type', 'all_temples', 'value', 1), 'legendary', 500, 13);

-- 3. 連續打卡徽章
INSERT INTO achievement_types (id, code, name, name_en, description, category, icon_url, criteria, rarity, points_reward, display_order) VALUES
('ach-0011', 'STREAK_7', '七日虔誠', 'Week Streak', '連續打卡 7 天',
 'consecutive_checkin', 'https://cdn.example.com/badges/streak_7.png',
 JSON_OBJECT('type', 'consecutive_days', 'value', 7), 'uncommon', 35, 20),

('ach-0012', 'STREAK_30', '三十而立', 'Month Streak', '連續打卡 30 天',
 'consecutive_checkin', 'https://cdn.example.com/badges/streak_30.png',
 JSON_OBJECT('type', 'consecutive_days', 'value', 30), 'rare', 150, 21),

('ach-0013', 'STREAK_100', '百日築基', 'Hundred Days', '連續打卡 100 天',
 'consecutive_checkin', 'https://cdn.example.com/badges/streak_100.png',
 JSON_OBJECT('type', 'consecutive_days', 'value', 100), 'epic', 500, 22),

('ach-0014', 'STREAK_365', '年度虔誠信徒', 'Year Devotee', '連續打卡 365 天',
 'consecutive_checkin', 'https://cdn.example.com/badges/streak_365.png',
 JSON_OBJECT('type', 'consecutive_days', 'value', 365), 'legendary', 1825, 23);

-- 4. 特殊成就徽章
INSERT INTO achievement_types (id, code, name, name_en, description, category, icon_url, criteria, rarity, points_reward, display_order) VALUES
('ach-0015', 'TEMPLE_DEVOTEE', '專屬信徒', 'Devoted Follower', '在同一廟宇打卡 50 次',
 'special_achievement', 'https://cdn.example.com/badges/devotee.png',
 JSON_OBJECT('type', 'single_temple_count', 'value', 50), 'rare', 100, 30),

('ach-0016', 'PILGRIM', '朝聖者', 'Pilgrim', '在同一天打卡 5 座廟宇',
 'special_achievement', 'https://cdn.example.com/badges/pilgrim.png',
 JSON_OBJECT('type', 'same_day_temples', 'value', 5), 'epic', 100, 31),

('ach-0017', 'EARLY_BIRD', '早課虔誠', 'Early Bird', '凌晨時段(05:00-07:00)打卡',
 'special_achievement', 'https://cdn.example.com/badges/early_bird.png',
 JSON_OBJECT('type', 'time_slot', 'start', '05:00', 'end', '07:00'), 'uncommon', 20, 32),

('ach-0018', 'LUNAR_DEVOTEE', '雙倍虔誠', 'Lunar Devotee', '農曆初一、十五打卡',
 'special_achievement', 'https://cdn.example.com/badges/lunar.png',
 JSON_OBJECT('type', 'lunar_date', 'days', JSON_ARRAY(1, 15)), 'rare', 30, 33);

-- 5. 季節/節慶徽章
INSERT INTO achievement_types (id, code, name, name_en, description, category, icon_url, criteria, rarity, points_reward, display_order) VALUES
('ach-0019', 'LUNAR_NEW_YEAR', '新春祈福', 'Lunar New Year', '農曆新年期間打卡',
 'seasonal', 'https://cdn.example.com/badges/new_year.png',
 JSON_OBJECT('type', 'festival', 'name', 'lunar_new_year'), 'rare', 50, 40),

('ach-0020', 'DRAGON_BOAT', '端午祈安', 'Dragon Boat Festival', '端午節打卡',
 'seasonal', 'https://cdn.example.com/badges/dragon_boat.png',
 JSON_OBJECT('type', 'festival', 'name', 'dragon_boat'), 'rare', 50, 41),

('ach-0021', 'MID_AUTUMN', '中秋祈福', 'Mid-Autumn Festival', '中秋節打卡',
 'seasonal', 'https://cdn.example.com/badges/mid_autumn.png',
 JSON_OBJECT('type', 'festival', 'name', 'mid_autumn'), 'rare', 50, 42);

-- 6. 功德成就徽章
INSERT INTO achievement_types (id, code, name, name_en, description, category, icon_url, criteria, rarity, points_reward, display_order) VALUES
('ach-0022', 'MERIT_1000', '功德千分', 'Merit 1K', '累積功德值達 1000',
 'merit_points', 'https://cdn.example.com/badges/merit_1000.png',
 JSON_OBJECT('type', 'total_points', 'value', 1000), 'uncommon', 50, 50),

('ach-0023', 'MERIT_5000', '功德五千', 'Merit 5K', '累積功德值達 5000',
 'merit_points', 'https://cdn.example.com/badges/merit_5000.png',
 JSON_OBJECT('type', 'total_points', 'value', 5000), 'rare', 250, 51),

('ach-0024', 'MERIT_10000', '功德萬分', 'Merit 10K', '累積功德值達 10000',
 'merit_points', 'https://cdn.example.com/badges/merit_10000.png',
 JSON_OBJECT('type', 'total_points', 'value', 10000), 'epic', 500, 52);

-- 7. 廟宇專屬徽章 (範例: 龍山寺)
INSERT INTO achievement_types (id, code, name, name_en, description, category, icon_url, criteria, rarity, points_reward, display_order) VALUES
('ach-0025', 'LONGSHAN_DEVOTEE', '龍山守護者', 'Longshan Guardian', '在龍山寺打卡 100 次',
 'temple_exclusive', 'https://cdn.example.com/badges/longshan.png',
 JSON_OBJECT('type', 'temple_specific', 'temple_id', '750e8400-e29b-41d4-a716-446655440001', 'value', 100),
 'epic', 200, 60);

-- ----------------------------------------------------------------------------
-- 插入測試成就記錄
-- ----------------------------------------------------------------------------
INSERT INTO user_achievements (id, user_id, achievement_type_id, unlocked_at, achievement_data, is_minted) VALUES
-- test_user 解鎖首次打卡
('uach-0001', '550e8400-e29b-41d4-a716-446655440001', 'ach-0001', '2024-12-01 10:00:00',
 JSON_OBJECT('total_checkins', 1, 'achievement_date', '2024-12-01'), TRUE),

-- test_user 解鎖十全十美
('uach-0002', '550e8400-e29b-41d4-a716-446655440001', 'ach-0002', '2024-12-10 14:30:00',
 JSON_OBJECT('total_checkins', 10, 'achievement_date', '2024-12-10'), FALSE),

-- admin_user 解鎖首次打卡
('uach-0003', '550e8400-e29b-41d4-a716-446655440002', 'ach-0001', '2024-11-15 09:00:00',
 JSON_OBJECT('total_checkins', 1, 'achievement_date', '2024-11-15'), TRUE);

-- ----------------------------------------------------------------------------
-- 插入測試 NFT 記錄
-- ----------------------------------------------------------------------------
INSERT INTO nfts (id, user_id, achievement_id, token_id, contract_address, wallet_address, blockchain, transaction_hash, metadata_uri, image_url, status, minted_at) VALUES
('nft-0001', '550e8400-e29b-41d4-a716-446655440001', 'uach-0001',
 1001, '0x1234567890123456789012345678901234567890',
 '0xabcdef1234567890abcdef1234567890abcdef12', 'polygon',
 '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
 'https://ipfs.io/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
 'https://cdn.example.com/nft/1001.png',
 'minted', '2024-12-01 10:05:00'),

('nft-0002', '550e8400-e29b-41d4-a716-446655440002', 'uach-0003',
 1002, '0x1234567890123456789012345678901234567890',
 '0x9876543210987654321098765432109876543210', 'polygon',
 '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
 'https://ipfs.io/ipfs/QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYy',
 'https://cdn.example.com/nft/1002.png',
 'minted', '2024-11-15 09:05:00');

-- ----------------------------------------------------------------------------
-- 插入測試 NFT Metadata
-- ----------------------------------------------------------------------------
INSERT INTO nft_metadata (id, nft_id, name, description, image, external_url, attributes) VALUES
('meta-0001', 'nft-0001', '初心不忘成就 #1001',
 '恭喜您完成首次打卡!這是您虔誠信仰旅程的開始。',
 'https://cdn.example.com/nft/1001.png',
 'https://temple-checkin.app/achievements/uach-0001',
 JSON_ARRAY(
     JSON_OBJECT('trait_type', '成就類型', 'value', '打卡里程碑'),
     JSON_OBJECT('trait_type', '稀有度', 'value', '普通'),
     JSON_OBJECT('trait_type', '解鎖日期', 'value', '2024-12-01'),
     JSON_OBJECT('trait_type', '總打卡次數', 'value', 1, 'display_type', 'number')
 )),

('meta-0002', 'nft-0002', '初心不忘成就 #1002',
 '恭喜您完成首次打卡!這是您虔誠信仰旅程的開始。',
 'https://cdn.example.com/nft/1002.png',
 'https://temple-checkin.app/achievements/uach-0003',
 JSON_ARRAY(
     JSON_OBJECT('trait_type', '成就類型', 'value', '打卡里程碑'),
     JSON_OBJECT('trait_type', '稀有度', 'value', '普通'),
     JSON_OBJECT('trait_type', '解鎖日期', 'value', '2024-11-15'),
     JSON_OBJECT('trait_type', '總打卡次數', 'value', 1, 'display_type', 'number')
 ));

-- ----------------------------------------------------------------------------
-- 插入測試錢包連接
-- ----------------------------------------------------------------------------
INSERT INTO wallet_connections (id, user_id, wallet_address, blockchain, is_primary, verified_at, last_used) VALUES
('wallet-0001', '550e8400-e29b-41d4-a716-446655440001',
 '0xabcdef1234567890abcdef1234567890abcdef12', 'polygon', TRUE,
 '2024-12-01 10:00:00', '2024-12-01 10:05:00'),

('wallet-0002', '550e8400-e29b-41d4-a716-446655440002',
 '0x9876543210987654321098765432109876543210', 'polygon', TRUE,
 '2024-11-15 09:00:00', '2024-11-15 09:05:00');

-- ============================================================================
-- 觸發器 (Triggers)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 成就解鎖後更新 NFT 關聯
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS after_nft_minted//

CREATE TRIGGER after_nft_minted
AFTER UPDATE ON nfts
FOR EACH ROW
BEGIN
    -- 當 NFT 鑄造成功時,更新成就記錄
    IF NEW.status = 'minted' AND OLD.status != 'minted' THEN
        UPDATE user_achievements
        SET is_minted = TRUE,
            nft_id = NEW.id
        WHERE id = NEW.achievement_id;
    END IF;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 打卡後自動檢查成就
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS after_checkin_check_achievements//

CREATE TRIGGER after_checkin_check_achievements
AFTER INSERT ON checkins
FOR EACH ROW
BEGIN
    DECLARE v_total_checkins INT;
    DECLARE v_unique_temples INT;
    
    -- 計算使用者總打卡次數
    SELECT COUNT(*) INTO v_total_checkins
    FROM checkins
    WHERE user_id = NEW.user_id;
    
    -- 計算使用者參拜的不同廟宇數
    SELECT COUNT(DISTINCT temple_id) INTO v_unique_temples
    FROM checkins
    WHERE user_id = NEW.user_id;
    
    -- 檢查並解鎖打卡里程碑成就
    -- 首次打卡
    IF v_total_checkins = 1 THEN
        INSERT IGNORE INTO user_achievements (id, user_id, achievement_type_id, related_checkin_id, achievement_data)
        VALUES (UUID(), NEW.user_id, 'ach-0001', NEW.id,
                JSON_OBJECT('total_checkins', 1, 'achievement_date', DATE(NEW.checkin_time)));
    END IF;
    
    -- 10 次打卡
    IF v_total_checkins = 10 THEN
        INSERT IGNORE INTO user_achievements (id, user_id, achievement_type_id, related_checkin_id, achievement_data)
        VALUES (UUID(), NEW.user_id, 'ach-0002', NEW.id,
                JSON_OBJECT('total_checkins', 10, 'achievement_date', DATE(NEW.checkin_time)));
    END IF;
    
    -- 50 次打卡
    IF v_total_checkins = 50 THEN
        INSERT IGNORE INTO user_achievements (id, user_id, achievement_type_id, related_checkin_id, achievement_data)
        VALUES (UUID(), NEW.user_id, 'ach-0003', NEW.id,
                JSON_OBJECT('total_checkins', 50, 'achievement_date', DATE(NEW.checkin_time)));
    END IF;
    
    -- 100 次打卡
    IF v_total_checkins = 100 THEN
        INSERT IGNORE INTO user_achievements (id, user_id, achievement_type_id, related_checkin_id, achievement_data)
        VALUES (UUID(), NEW.user_id, 'ach-0004', NEW.id,
                JSON_OBJECT('total_checkins', 100, 'achievement_date', DATE(NEW.checkin_time)));
    END IF;
    
    -- 檢查並解鎖廟宇收集成就
    -- 5 座廟宇
    IF v_unique_temples = 5 THEN
        INSERT IGNORE INTO user_achievements (id, user_id, achievement_type_id, related_checkin_id, achievement_data)
        VALUES (UUID(), NEW.user_id, 'ach-0007', NEW.id,
                JSON_OBJECT('unique_temples', 5, 'achievement_date', DATE(NEW.checkin_time)));
    END IF;
    
    -- 10 座廟宇
    IF v_unique_temples = 10 THEN
        INSERT IGNORE INTO user_achievements (id, user_id, achievement_type_id, related_checkin_id, achievement_data)
        VALUES (UUID(), NEW.user_id, 'ach-0008', NEW.id,
                JSON_OBJECT('unique_temples', 10, 'achievement_date', DATE(NEW.checkin_time)));
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- 統計視圖 (Views)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 使用者成就統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_user_achievement_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT ua.id) as total_achievements,
    COUNT(DISTINCT CASE WHEN ua.is_minted = TRUE THEN ua.id END) as minted_achievements,
    COUNT(DISTINCT CASE WHEN at.rarity = 'common' THEN ua.id END) as common_count,
    COUNT(DISTINCT CASE WHEN at.rarity = 'uncommon' THEN ua.id END) as uncommon_count,
    COUNT(DISTINCT CASE WHEN at.rarity = 'rare' THEN ua.id END) as rare_count,
    COUNT(DISTINCT CASE WHEN at.rarity = 'epic' THEN ua.id END) as epic_count,
    COUNT(DISTINCT CASE WHEN at.rarity = 'legendary' THEN ua.id END) as legendary_count,
    SUM(at.points_reward) as total_achievement_points
FROM users u
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN achievement_types at ON ua.achievement_type_id = at.id
GROUP BY u.id, u.username;

-- ----------------------------------------------------------------------------
-- 成就解鎖排行榜視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_achievement_leaderboard AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT ua.id) as total_achievements,
    COUNT(DISTINCT CASE WHEN at.rarity = 'legendary' THEN ua.id END) as legendary_count,
    COUNT(DISTINCT CASE WHEN at.rarity = 'epic' THEN ua.id END) as epic_count,
    SUM(at.points_reward) as total_points,
    MAX(ua.unlocked_at) as last_achievement_date
FROM users u
JOIN user_achievements ua ON u.id = ua.user_id
JOIN achievement_types at ON ua.achievement_type_id = at.id
GROUP BY u.id, u.username
ORDER BY total_achievements DESC, legendary_count DESC, epic_count DESC;

-- ----------------------------------------------------------------------------
-- NFT 統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_nft_stats AS
SELECT 
    COUNT(*) as total_nfts,
    COUNT(CASE WHEN status = 'minted' THEN 1 END) as minted_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'minting' THEN 1 END) as minting_count,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
    COUNT(DISTINCT user_id) as unique_collectors,
    blockchain,
    DATE(created_at) as mint_date
FROM nfts
GROUP BY blockchain, DATE(created_at);

-- ----------------------------------------------------------------------------
-- 成就完成度視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_achievement_completion AS
SELECT 
    at.id,
    at.code,
    at.name,
    at.category,
    at.rarity,
    COUNT(ua.id) as unlock_count,
    COUNT(CASE WHEN ua.is_minted = TRUE THEN 1 END) as minted_count,
    ROUND(COUNT(ua.id) * 100.0 / (SELECT COUNT(*) FROM users), 2) as completion_rate
FROM achievement_types at
LEFT JOIN user_achievements ua ON at.id = ua.achievement_type_id
WHERE at.is_active = TRUE
GROUP BY at.id, at.code, at.name, at.category, at.rarity
ORDER BY unlock_count DESC;

-- ============================================================================
-- 預存程序 (Stored Procedures)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 檢查使用者成就進度
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_check_achievement_progress//

CREATE PROCEDURE sp_check_achievement_progress(
    IN p_user_id VARCHAR(36)
)
BEGIN
    SELECT 
        at.id,
        at.code,
        at.name,
        at.description,
        at.category,
        at.rarity,
        at.icon_url,
        at.criteria,
        at.points_reward,
        CASE 
            WHEN ua.id IS NOT NULL THEN TRUE
            ELSE FALSE
        END as is_unlocked,
        ua.unlocked_at,
        ua.is_minted,
        -- 計算進度
        CASE at.code
            WHEN 'CHECKIN_10' THEN 
                (SELECT COUNT(*) FROM checkins WHERE user_id = p_user_id)
            WHEN 'CHECKIN_50' THEN 
                (SELECT COUNT(*) FROM checkins WHERE user_id = p_user_id)
            WHEN 'CHECKIN_100' THEN 
                (SELECT COUNT(*) FROM checkins WHERE user_id = p_user_id)
            WHEN 'TEMPLE_5' THEN
                (SELECT COUNT(DISTINCT temple_id) FROM checkins WHERE user_id = p_user_id)
            WHEN 'TEMPLE_10' THEN
                (SELECT COUNT(DISTINCT temple_id) FROM checkins WHERE user_id = p_user_id)
            ELSE 0
        END as current_progress
    FROM achievement_types at
    LEFT JOIN user_achievements ua ON at.id = ua.achievement_type_id AND ua.user_id = p_user_id
    WHERE at.is_active = TRUE
    ORDER BY at.display_order;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 鑄造 NFT (模擬)
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_mint_nft//

CREATE PROCEDURE sp_mint_nft(
    IN p_achievement_id VARCHAR(36),
    IN p_wallet_address VARCHAR(42),
    OUT p_nft_id VARCHAR(36)
)
BEGIN
    DECLARE v_user_id VARCHAR(36);
    DECLARE v_achievement_type_id VARCHAR(36);
    DECLARE v_achievement_name VARCHAR(100);
    
    -- 檢查成就是否存在且未鑄造
    SELECT user_id, achievement_type_id
    INTO v_user_id, v_achievement_type_id
    FROM user_achievements
    WHERE id = p_achievement_id
      AND is_minted = FALSE;
    
    IF v_user_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '成就不存在或已鑄造';
    END IF;
    
    -- 取得成就名稱
    SELECT name INTO v_achievement_name
    FROM achievement_types
    WHERE id = v_achievement_type_id;
    
    -- 生成 NFT ID
    SET p_nft_id = UUID();
    
    -- 建立 NFT 記錄
    INSERT INTO nfts (
        id, user_id, achievement_id, wallet_address,
        blockchain, status, created_at
    ) VALUES (
        p_nft_id, v_user_id, p_achievement_id, p_wallet_address,
        'polygon', 'pending', NOW()
    );
    
    -- 實際應用中,這裡會呼叫區塊鏈 API 進行鑄造
    -- 這裡僅模擬成功
    UPDATE nfts
    SET status = 'minted',
        token_id = FLOOR(1000 + RAND() * 9000),
        minted_at = NOW()
    WHERE id = p_nft_id;
END//

DELIMITER ;

-- ============================================================================
-- 資料完整性檢查
-- ============================================================================

-- 檢查新增的資料表記錄數
SELECT '成就類型' as table_name, COUNT(*) as record_count FROM achievement_types
UNION ALL
SELECT '使用者成就', COUNT(*) FROM user_achievements
UNION ALL
SELECT 'NFT記錄', COUNT(*) FROM nfts
UNION ALL
SELECT 'NFT Metadata', COUNT(*) FROM nft_metadata
UNION ALL
SELECT '錢包連接', COUNT(*) FROM wallet_connections;

-- 檢查成就類型分布
SELECT 
    category,
    COUNT(*) as count
FROM achievement_types
WHERE is_active = TRUE
GROUP BY category;

-- 檢查稀有度分布
SELECT 
    rarity,
    COUNT(*) as count
FROM achievement_types
WHERE is_active = TRUE
GROUP BY rarity
ORDER BY FIELD(rarity, 'common', 'uncommon', 'rare', 'epic', 'legendary');

-- 檢查 NFT 狀態分布
SELECT 
    status,
    COUNT(*) as count
FROM nfts
GROUP BY status;

-- ============================================================================
-- 初始化完成訊息
-- ============================================================================

SELECT 
    '✅ NFT 成就徽章系統初始化完成！' as message,
    CONCAT(
        '成就類型: ', (SELECT COUNT(*) FROM achievement_types),
        ' | 使用者成就: ', (SELECT COUNT(*) FROM user_achievements),
        ' | NFT: ', (SELECT COUNT(*) FROM nfts),
        ' | 錢包: ', (SELECT COUNT(*) FROM wallet_connections)
    ) as statistics;

-- ============================================================================
-- 測試查詢範例
-- ============================================================================

-- 1. 查看所有成就類型
-- SELECT * FROM achievement_types WHERE is_active = TRUE ORDER BY display_order;

-- 2. 查看使用者成就統計
-- SELECT * FROM v_user_achievement_stats WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

-- 3. 查看成就排行榜
-- SELECT * FROM v_achievement_leaderboard LIMIT 10;

-- 4. 檢查使用者成就進度
-- CALL sp_check_achievement_progress('550e8400-e29b-41d4-a716-446655440001');

-- 5. 鑄造 NFT (測試)
-- CALL sp_mint_nft('uach-0002', '0xabcdef1234567890abcdef1234567890abcdef12', @nft_id);
-- SELECT @nft_id;

-- 6. 查看 NFT 統計
-- SELECT * FROM v_nft_stats;

-- 7. 查看成就完成度
-- SELECT * FROM v_achievement_completion;

-- ============================================================================
-- 清理腳本 (需要時使用)
-- ============================================================================

-- 刪除 NFT 相關資料表
-- DROP TABLE IF EXISTS nft_metadata;
-- DROP TABLE IF EXISTS nfts;
-- DROP TABLE IF EXISTS user_achievements;
-- DROP TABLE IF EXISTS achievement_types;
-- DROP TABLE IF EXISTS wallet_connections;

-- 刪除視圖
-- DROP VIEW IF EXISTS v_user_achievement_stats;
-- DROP VIEW IF EXISTS v_achievement_leaderboard;
-- DROP VIEW IF EXISTS v_nft_stats;
-- DROP VIEW IF EXISTS v_achievement_completion;

-- 刪除預存程序
-- DROP PROCEDURE IF EXISTS sp_check_achievement_progress;
-- DROP PROCEDURE IF EXISTS sp_mint_nft;
