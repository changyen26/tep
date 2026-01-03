#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
修復資料庫：添加 is_active 欄位
"""
import pymysql
import sys

# 資料庫連線設定
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'amulet_system',
    'charset': 'utf8mb4'
}

def main():
    try:
        # 連線資料庫
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print("Checking users table...")

        # 檢查 is_active 欄位是否已存在
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_active'")
        result = cursor.fetchone()

        if result:
            print("is_active already exists")
        else:
            print("Adding is_active column...")
            cursor.execute("""
                ALTER TABLE users
                ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role
            """)
            print("is_active column added successfully")

        # 確保所有用戶都是啟用狀態
        cursor.execute("UPDATE users SET is_active = 1")
        affected = cursor.rowcount
        print(f"Updated {affected} users")

        # 提交變更
        conn.commit()
        print("\nDatabase fixed successfully!")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
