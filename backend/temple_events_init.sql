-- 廟方活動報名系統資料表初始化
-- 執行順序：先建 temple_events，再建 event_registrations

-- ===== 1. 廟方活動表 =====
CREATE TABLE IF NOT EXISTS `temple_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `temple_id` INT NOT NULL COMMENT '所屬廟宇ID',
  `title` VARCHAR(200) NOT NULL COMMENT '活動名稱',
  `description` TEXT NOT NULL COMMENT '活動說明',
  `location` VARCHAR(200) NOT NULL COMMENT '活動地點',
  `start_at` DATETIME NOT NULL COMMENT '活動開始時間',
  `end_at` DATETIME NOT NULL COMMENT '活動結束時間',
  `signup_end_at` DATETIME NOT NULL COMMENT '報名截止時間',
  `capacity` INT NOT NULL COMMENT '活動名額',
  `fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '活動費用',
  `cover_image_url` VARCHAR(500) DEFAULT NULL COMMENT '封面圖片URL',
  `status` VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT '活動狀態: draft, published, closed, canceled',
  `created_by` INT NOT NULL COMMENT '建立者ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

  -- 外鍵約束
  CONSTRAINT `fk_temple_events_temple` FOREIGN KEY (`temple_id`) REFERENCES `temples` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_temple_events_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,

  -- 索引（提升查詢效能）
  INDEX `idx_temple_id` (`temple_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_at` (`start_at`),
  INDEX `idx_signup_end_at` (`signup_end_at`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='廟方活動表';

-- ===== 2. 活動報名記錄表 =====
CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL COMMENT '活動ID',
  `user_id` INT DEFAULT NULL COMMENT '使用者ID（可選，開放遊客報名時為NULL）',
  `name` VARCHAR(100) NOT NULL COMMENT '報名者姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '聯絡電話',
  `email` VARCHAR(120) NOT NULL COMMENT '電子郵件',
  `notes` TEXT DEFAULT NULL COMMENT '備註/特殊需求',
  `status` VARCHAR(20) NOT NULL DEFAULT 'registered' COMMENT '報名狀態: registered, canceled, waitlist',
  `registered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '報名時間',
  `canceled_at` DATETIME DEFAULT NULL COMMENT '取消時間',

  -- 外鍵約束
  CONSTRAINT `fk_event_registrations_event` FOREIGN KEY (`event_id`) REFERENCES `temple_events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_event_registrations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,

  -- 索引
  INDEX `idx_event_id` (`event_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_registered_at` (`registered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活動報名記錄表';

-- ===== 3. 複合索引（選用，進一步優化查詢）=====
-- 查詢某活動的某狀態報名記錄
CREATE INDEX `idx_event_status` ON `event_registrations` (`event_id`, `status`);

-- 查詢某廟宇的某狀態活動
CREATE INDEX `idx_temple_status` ON `temple_events` (`temple_id`, `status`);
