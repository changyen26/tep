-- 添加 is_active 欄位到 users 表
ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role;

-- 確保所有現有用戶都是啟用狀態
UPDATE users SET is_active = 1;
