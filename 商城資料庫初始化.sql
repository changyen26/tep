-- ============================================================================
-- 商城兌換系統 - 資料庫擴充腳本
-- ============================================================================
-- 說明: 此腳本為平安符打卡系統新增商城兌換功能
-- 版本: 1.0.0
-- 日期: 2025-01-15
-- ============================================================================

USE temple_checkin;

-- ============================================================================
-- 資料表建立
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 商品表 (products)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY COMMENT '商品 UUID',
    name VARCHAR(100) NOT NULL COMMENT '商品名稱',
    description TEXT COMMENT '商品描述',
    category VARCHAR(50) NOT NULL COMMENT '商品分類',
    merit_points INT NOT NULL COMMENT '所需功德值',
    stock_quantity INT DEFAULT 0 COMMENT '庫存數量',
    image_url VARCHAR(500) COMMENT '商品圖片網址',
    images JSON COMMENT '多張圖片 (JSON 陣列)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否上架',
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否精選商品',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_merit_points (merit_points),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ----------------------------------------------------------------------------
-- 收件地址表 (addresses)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS addresses;
CREATE TABLE addresses (
    id VARCHAR(36) PRIMARY KEY COMMENT '地址 UUID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者 ID',
    recipient_name VARCHAR(50) NOT NULL COMMENT '收件人姓名',
    phone VARCHAR(20) NOT NULL COMMENT '聯絡電話',
    postal_code VARCHAR(10) COMMENT '郵遞區號',
    city VARCHAR(20) NOT NULL COMMENT '城市',
    district VARCHAR(20) NOT NULL COMMENT '區域',
    address VARCHAR(200) NOT NULL COMMENT '詳細地址',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否為預設地址',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收件地址表';

-- ----------------------------------------------------------------------------
-- 兌換記錄表 (redemptions)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS redemptions;
CREATE TABLE redemptions (
    id VARCHAR(36) PRIMARY KEY COMMENT '兌換記錄 UUID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者 ID',
    product_id VARCHAR(36) NOT NULL COMMENT '商品 ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '兌換數量',
    merit_points_used INT NOT NULL COMMENT '使用的功德值',
    status ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') 
        NOT NULL DEFAULT 'pending' COMMENT '兌換狀態',
    
    -- 收件資訊
    recipient_name VARCHAR(50) NOT NULL COMMENT '收件人姓名',
    phone VARCHAR(20) NOT NULL COMMENT '聯絡電話',
    postal_code VARCHAR(10) COMMENT '郵遞區號',
    city VARCHAR(20) NOT NULL COMMENT '城市',
    district VARCHAR(20) NOT NULL COMMENT '區域',
    address VARCHAR(200) NOT NULL COMMENT '詳細地址',
    
    -- 物流資訊
    shipping_method VARCHAR(50) COMMENT '配送方式',
    tracking_number VARCHAR(100) COMMENT '物流編號',
    
    -- 備註
    notes TEXT COMMENT '使用者備註',
    admin_notes TEXT COMMENT '管理員備註',
    
    -- 時間記錄
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '兌換時間',
    processed_at DATETIME COMMENT '處理時間',
    shipped_at DATETIME COMMENT '出貨時間',
    completed_at DATETIME COMMENT '完成時間',
    cancelled_at DATETIME COMMENT '取消時間',
    
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_redeemed_at (redeemed_at),
    INDEX idx_user_status (user_id, status),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='兌換記錄表';

-- ============================================================================
-- 測試資料插入
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 插入測試商品
-- ----------------------------------------------------------------------------
INSERT INTO products (id, name, description, category, merit_points, stock_quantity, image_url, is_active, is_featured, sort_order) VALUES
-- 精選商品
('prod-uuid-0001', '平安符吊飾', 
 '精緻手工平安符吊飾,隨身攜帶保平安。採用優質材料製作,設計精美,是您日常出行的最佳守護。', 
 'charm', 100, 50, 'https://example.com/products/charm1.jpg', TRUE, TRUE, 1),

('prod-uuid-0002', '廟宇貼紙組', 
 '精美廟宇貼紙組合包(5入),收錄台灣著名廟宇圖案,適合裝飾筆記本、手機殼等。', 
 'sticker', 50, 100, 'https://example.com/products/sticker1.jpg', TRUE, TRUE, 2),

('prod-uuid-0003', '平安徽章', 
 '可愛平安符造型徽章,金屬材質,可別在包包或衣服上,時尚又有意義。', 
 'badge', 70, 90, 'https://example.com/products/badge1.jpg', TRUE, TRUE, 3),

-- 服飾類
('prod-uuid-0004', '祈福T恤', 
 '100%純棉祈福T恤,舒適又有型。印有精美祈福圖騰,展現個人風格。', 
 'tshirt', 300, 30, 'https://example.com/products/tshirt1.jpg', TRUE, FALSE, 4),

('prod-uuid-0005', '祈福帽T', 
 '連帽運動衫,內刷毛材質,溫暖舒適。胸前印有祈福文字設計。', 
 'hoodie', 500, 20, 'https://example.com/products/hoodie1.jpg', TRUE, FALSE, 5),

-- 生活用品
('prod-uuid-0006', '平安帆布袋', 
 '環保帆布提袋,印有祈福圖騰。容量大,適合日常購物使用。', 
 'bag', 200, 40, 'https://example.com/products/bag1.jpg', TRUE, FALSE, 6),

('prod-uuid-0007', '祈福馬克杯', 
 '陶瓷馬克杯,印有精美廟宇圖案。容量350ml,適合喝咖啡或茶。', 
 'mug', 150, 35, 'https://example.com/products/mug1.jpg', TRUE, FALSE, 7),

('prod-uuid-0008', '平安手機架', 
 '桌上型手機支架,平安符造型設計。可調整角度,穩固好用。', 
 'phone_holder', 120, 45, 'https://example.com/products/phone1.jpg', TRUE, FALSE, 8),

-- 文具類
('prod-uuid-0009', '廟宇明信片組', 
 '精選台灣著名廟宇明信片(10入),高品質印刷,適合收藏或寄送。', 
 'postcard', 80, 60, 'https://example.com/products/postcard1.jpg', TRUE, FALSE, 9),

('prod-uuid-0010', '祈福書籤', 
 '金屬材質祈福書籤,精緻雕刻工藝。讀書時的最佳伴侶。', 
 'bookmark', 60, 80, 'https://example.com/products/bookmark1.jpg', TRUE, FALSE, 10),

('prod-uuid-0011', '廟宇筆記本', 
 'A5尺寸精裝筆記本,封面印有廟宇圖案。內頁100張,適合記事。', 
 'notebook', 180, 40, 'https://example.com/products/notebook1.jpg', TRUE, FALSE, 11),

-- 配件類
('prod-uuid-0012', '廟宇鑰匙圈', 
 '金屬鑰匙圈附平安符吊飾,實用又美觀。送禮自用兩相宜。', 
 'keychain', 90, 70, 'https://example.com/products/keychain1.jpg', TRUE, FALSE, 12),

('prod-uuid-0013', '平安手環', 
 '編織手環附平安符珠飾,可調整大小。多種顏色可選。', 
 'bracelet', 130, 55, 'https://example.com/products/bracelet1.jpg', TRUE, FALSE, 13),

('prod-uuid-0014', '祈福項鍊', 
 '不鏽鋼項鍊附平安符墜飾,防過敏材質。簡約時尚設計。', 
 'necklace', 250, 25, 'https://example.com/products/necklace1.jpg', TRUE, FALSE, 14),

-- 收藏品
('prod-uuid-0015', '廟宇模型擺飾', 
 '精緻廟宇建築模型,手工製作。適合擺放在辦公桌或書櫃。', 
 'model', 800, 10, 'https://example.com/products/model1.jpg', TRUE, FALSE, 15);

-- ----------------------------------------------------------------------------
-- 插入測試地址 (使用現有測試使用者)
-- ----------------------------------------------------------------------------
INSERT INTO addresses (id, user_id, recipient_name, phone, postal_code, city, district, address, is_default) VALUES
-- test_user 的地址
('addr-uuid-0001', '550e8400-e29b-41d4-a716-446655440001', '王小明', '0912345678', 
 '100', '台北市', '中正區', '重慶南路一段122號', TRUE),

('addr-uuid-0002', '550e8400-e29b-41d4-a716-446655440001', '王小明', '0912345678', 
 '220', '新北市', '板橋區', '縣民大道二段7號', FALSE),

-- john_doe 的地址
('addr-uuid-0003', '550e8400-e29b-41d4-a716-446655440003', '李大華', '0923456789', 
 '220', '新北市', '板橋區', '文化路一段188號', TRUE);

-- ----------------------------------------------------------------------------
-- 插入測試兌換記錄
-- ----------------------------------------------------------------------------
INSERT INTO redemptions (
    id, user_id, product_id, quantity, merit_points_used, status,
    recipient_name, phone, postal_code, city, district, address,
    shipping_method, tracking_number, notes,
    redeemed_at, processed_at, shipped_at
) VALUES
-- test_user 的兌換記錄
('redeem-uuid-0001', '550e8400-e29b-41d4-a716-446655440001', 'prod-uuid-0001', 1, 100, 'completed',
 '王小明', '0912345678', '100', '台北市', '中正區', '重慶南路一段122號',
 '宅配', 'TW1234567890', '請小心包裝',
 '2025-01-10 10:30:00', '2025-01-10 15:00:00', '2025-01-11 09:00:00'),

('redeem-uuid-0002', '550e8400-e29b-41d4-a716-446655440001', 'prod-uuid-0002', 2, 100, 'shipped',
 '王小明', '0912345678', '100', '台北市', '中正區', '重慶南路一段122號',
 '宅配', 'TW1234567891', NULL,
 '2025-01-12 14:20:00', '2025-01-12 16:00:00', '2025-01-13 10:00:00'),

('redeem-uuid-0003', '550e8400-e29b-41d4-a716-446655440001', 'prod-uuid-0003', 1, 70, 'processing',
 '王小明', '0912345678', '100', '台北市', '中正區', '重慶南路一段122號',
 NULL, NULL, NULL,
 '2025-01-14 11:00:00', '2025-01-14 14:00:00', NULL),

('redeem-uuid-0004', '550e8400-e29b-41d4-a716-446655440001', 'prod-uuid-0006', 1, 200, 'pending',
 '王小明', '0912345678', '220', '新北市', '板橋區', '縣民大道二段7號',
 NULL, NULL, '希望盡快收到',
 '2025-01-15 09:30:00', NULL, NULL),

-- john_doe 的兌換記錄
('redeem-uuid-0005', '550e8400-e29b-41d4-a716-446655440003', 'prod-uuid-0001', 1, 100, 'completed',
 '李大華', '0923456789', '220', '新北市', '板橋區', '文化路一段188號',
 '宅配', 'TW1234567892', NULL,
 '2025-01-11 15:30:00', '2025-01-11 17:00:00', '2025-01-12 11:00:00');

-- ============================================================================
-- 觸發器 (Triggers)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 兌換後自動扣除功德值和庫存
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS after_redemption_insert//

CREATE TRIGGER after_redemption_insert
AFTER INSERT ON redemptions
FOR EACH ROW
BEGIN
    -- 扣除使用者功德值
    UPDATE users 
    SET blessing_points = blessing_points - NEW.merit_points_used
    WHERE id = NEW.user_id;
    
    -- 減少商品庫存
    UPDATE products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 取消兌換後退還功德值和庫存
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS after_redemption_cancelled//

CREATE TRIGGER after_redemption_cancelled
AFTER UPDATE ON redemptions
FOR EACH ROW
BEGIN
    -- 當狀態變更為 cancelled 時
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- 退還功德值給使用者
        UPDATE users 
        SET blessing_points = blessing_points + NEW.merit_points_used
        WHERE id = NEW.user_id;
        
        -- 恢復商品庫存
        UPDATE products 
        SET stock_quantity = stock_quantity + NEW.quantity
        WHERE id = NEW.product_id;
        
        -- 記錄取消時間
        UPDATE redemptions
        SET cancelled_at = NOW()
        WHERE id = NEW.id;
    END IF;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 設定預設地址時,取消其他預設地址
-- ----------------------------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS before_address_set_default//

CREATE TRIGGER before_address_set_default
BEFORE UPDATE ON addresses
FOR EACH ROW
BEGIN
    -- 如果設定為預設地址
    IF NEW.is_default = TRUE AND OLD.is_default = FALSE THEN
        -- 取消該使用者的其他預設地址
        UPDATE addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- 統計視圖 (Views)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 商品兌換統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_product_redemption_stats AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.merit_points,
    p.stock_quantity,
    p.is_active,
    p.is_featured,
    COUNT(r.id) as redemption_count,
    SUM(r.quantity) as total_quantity_redeemed,
    SUM(r.merit_points_used) as total_points_used,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_count
FROM products p
LEFT JOIN redemptions r ON p.id = r.product_id AND r.status != 'cancelled'
GROUP BY p.id, p.name, p.category, p.merit_points, p.stock_quantity, p.is_active, p.is_featured
ORDER BY redemption_count DESC;

-- ----------------------------------------------------------------------------
-- 使用者兌換統計視圖
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_user_redemption_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.blessing_points,
    COUNT(r.id) as total_redemptions,
    SUM(r.merit_points_used) as total_points_used,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN r.status = 'processing' THEN 1 END) as processing_count,
    COUNT(CASE WHEN r.status = 'shipped' THEN 1 END) as shipped_count,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN r.status = 'cancelled' THEN 1 END) as cancelled_count
FROM users u
LEFT JOIN redemptions r ON u.id = r.user_id
GROUP BY u.id, u.username, u.email, u.blessing_points;

-- ----------------------------------------------------------------------------
-- 熱門商品視圖 (最近30天)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_popular_products_30days AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.merit_points,
    p.image_url,
    COUNT(r.id) as redemption_count_30days,
    SUM(r.quantity) as quantity_redeemed_30days
FROM products p
INNER JOIN redemptions r ON p.id = r.product_id
WHERE r.redeemed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND r.status != 'cancelled'
  AND p.is_active = TRUE
GROUP BY p.id, p.name, p.category, p.merit_points, p.image_url
ORDER BY redemption_count_30days DESC
LIMIT 10;

-- ============================================================================
-- 預存程序 (Stored Procedures)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 檢查商品是否可以兌換
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_check_product_redeemable//

CREATE PROCEDURE sp_check_product_redeemable(
    IN p_product_id VARCHAR(36),
    IN p_quantity INT,
    OUT p_is_redeemable BOOLEAN,
    OUT p_error_message VARCHAR(200)
)
BEGIN
    DECLARE v_is_active BOOLEAN;
    DECLARE v_stock_quantity INT;
    DECLARE v_merit_points INT;
    
    -- 檢查商品是否存在且上架
    SELECT is_active, stock_quantity, merit_points
    INTO v_is_active, v_stock_quantity, v_merit_points
    FROM products
    WHERE id = p_product_id;
    
    IF v_is_active IS NULL THEN
        SET p_is_redeemable = FALSE;
        SET p_error_message = '商品不存在';
    ELSEIF v_is_active = FALSE THEN
        SET p_is_redeemable = FALSE;
        SET p_error_message = '商品已下架';
    ELSEIF v_stock_quantity < p_quantity THEN
        SET p_is_redeemable = FALSE;
        SET p_error_message = CONCAT('庫存不足，目前僅剩 ', v_stock_quantity, ' 件');
    ELSE
        SET p_is_redeemable = TRUE;
        SET p_error_message = NULL;
    END IF;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 取得使用者可兌換的商品 (功德值足夠)
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_affordable_products//

CREATE PROCEDURE sp_get_affordable_products(
    IN p_user_id VARCHAR(36)
)
BEGIN
    DECLARE v_user_points INT;
    
    -- 取得使用者目前功德值
    SELECT blessing_points INTO v_user_points
    FROM users
    WHERE id = p_user_id;
    
    -- 回傳功德值足夠的商品
    SELECT 
        id,
        name,
        description,
        category,
        merit_points,
        stock_quantity,
        image_url,
        is_featured,
        (v_user_points - merit_points) as points_remaining
    FROM products
    WHERE is_active = TRUE
      AND merit_points <= v_user_points
      AND stock_quantity > 0
    ORDER BY merit_points ASC;
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 取得商品分類統計
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_category_stats//

CREATE PROCEDURE sp_get_category_stats()
BEGIN
    SELECT 
        category,
        COUNT(*) as product_count,
        SUM(stock_quantity) as total_stock,
        MIN(merit_points) as min_points,
        MAX(merit_points) as max_points,
        AVG(merit_points) as avg_points
    FROM products
    WHERE is_active = TRUE
    GROUP BY category
    ORDER BY product_count DESC;
END//

DELIMITER ;

-- ============================================================================
-- 資料完整性檢查
-- ============================================================================

-- 檢查新增的資料表記錄數
SELECT '商品表' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT '地址表', COUNT(*) FROM addresses
UNION ALL
SELECT '兌換記錄表', COUNT(*) FROM redemptions;

-- 檢查商品分類分布
SELECT 
    category,
    COUNT(*) as count,
    SUM(stock_quantity) as total_stock
FROM products
WHERE is_active = TRUE
GROUP BY category
ORDER BY count DESC;

-- 檢查兌換狀態分布
SELECT 
    status,
    COUNT(*) as count,
    SUM(merit_points_used) as total_points
FROM redemptions
GROUP BY status
ORDER BY 
    FIELD(status, 'pending', 'processing', 'shipped', 'completed', 'cancelled');

-- ============================================================================
-- 索引效能檢查
-- ============================================================================

-- 檢查 products 資料表索引
SHOW INDEX FROM products;

-- 檢查 addresses 資料表索引
SHOW INDEX FROM addresses;

-- 檢查 redemptions 資料表索引
SHOW INDEX FROM redemptions;

-- ============================================================================
-- 初始化完成訊息
-- ============================================================================

SELECT 
    '✅ 商城兌換系統初始化完成！' as message,
    CONCAT(
        '商品: ', (SELECT COUNT(*) FROM products),
        ' | 地址: ', (SELECT COUNT(*) FROM addresses),
        ' | 兌換記錄: ', (SELECT COUNT(*) FROM redemptions)
    ) as statistics;

-- ============================================================================
-- 測試查詢範例
-- ============================================================================

-- 1. 查看所有上架商品
-- SELECT * FROM products WHERE is_active = TRUE ORDER BY sort_order;

-- 2. 查看精選商品
-- SELECT * FROM products WHERE is_featured = TRUE AND is_active = TRUE;

-- 3. 查看商品兌換統計
-- SELECT * FROM v_product_redemption_stats;

-- 4. 查看使用者兌換統計
-- SELECT * FROM v_user_redemption_stats;

-- 5. 查看熱門商品
-- SELECT * FROM v_popular_products_30days;

-- 6. 檢查商品是否可兌換
-- CALL sp_check_product_redeemable('prod-uuid-0001', 1, @is_redeemable, @error_msg);
-- SELECT @is_redeemable, @error_msg;

-- 7. 取得使用者可兌換的商品
-- CALL sp_get_affordable_products('550e8400-e29b-41d4-a716-446655440001');

-- 8. 取得商品分類統計
-- CALL sp_get_category_stats();

-- ============================================================================
-- 清理腳本 (需要時使用)
-- ============================================================================

-- 清空兌換記錄但保留商品和地址
-- TRUNCATE TABLE redemptions;

-- 完全刪除商城相關資料表
-- DROP TABLE IF EXISTS redemptions;
-- DROP TABLE IF EXISTS addresses;
-- DROP TABLE IF EXISTS products;

-- 刪除視圖
-- DROP VIEW IF EXISTS v_product_redemption_stats;
-- DROP VIEW IF EXISTS v_user_redemption_stats;
-- DROP VIEW IF EXISTS v_popular_products_30days;

-- 刪除預存程序
-- DROP PROCEDURE IF EXISTS sp_check_product_redeemable;
-- DROP PROCEDURE IF EXISTS sp_get_affordable_products;
-- DROP PROCEDURE IF EXISTS sp_get_category_stats;
