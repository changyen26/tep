-- ============================================
-- 進香登記表 - 建表 SQL
-- ============================================

CREATE TABLE IF NOT EXISTS pilgrimage_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temple_id INT NOT NULL COMMENT '廟宇ID',
    public_user_id INT NULL COMMENT '信眾ID（可選）',
    group_name VARCHAR(200) NULL COMMENT '團體名稱',
    contact_name VARCHAR(100) NOT NULL COMMENT '聯絡人姓名',
    contact_phone VARCHAR(20) NOT NULL COMMENT '聯絡人電話',
    people_count INT NOT NULL DEFAULT 1 COMMENT '預計人數',
    visit_start_at DATETIME NOT NULL COMMENT '預計來訪時間',
    purpose VARCHAR(500) NULL COMMENT '來訪目的',
    needs TEXT NULL COMMENT '特殊需求',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '狀態：pending, confirmed, rejected, completed, canceled',
    assigned_staff VARCHAR(100) NULL COMMENT '指派負責人員',
    admin_note TEXT NULL COMMENT '廟方內部備註',
    reply_message TEXT NULL COMMENT '回覆給信眾的訊息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    CONSTRAINT fk_pilgrimage_visit_temple FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
    CONSTRAINT fk_pilgrimage_visit_user FOREIGN KEY (public_user_id) REFERENCES public_users(id) ON DELETE SET NULL,

    INDEX idx_temple_id (temple_id),
    INDEX idx_public_user_id (public_user_id),
    INDEX idx_status (status),
    INDEX idx_visit_start_at (visit_start_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='進香登記表';
