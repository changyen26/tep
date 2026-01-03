"""
SQLAlchemy Mapper 初始化檢查
=============================

檢查所有 models 是否能成功初始化，不會出現 mapper failed to initialize 錯誤

執行方式：
    cd backend
    python check_mapper.py
"""

import os
import sys

# 設定環境變數
os.environ['FLASK_ENV'] = 'development'
os.environ['FLASK_DEBUG'] = '1'

print("=" * 80)
print(" SQLAlchemy Mapper 初始化檢查")
print("=" * 80)

try:
    print("\n[1/4] 載入 Flask app...")
    from app import create_app

    print("[2/4] 建立 app 實例...")
    app = create_app()

    print("[3/4] 測試 app context...")
    with app.app_context():
        from app import db

        print("[4/4] 檢查所有 models...")

        # 嘗試 import 所有 models（這會觸發 mapper 初始化）
        from app.models import (
            User, PublicUser, TempleAdminUser, SuperAdminUser,
            Amulet, Checkin, Energy, Temple, Product, Address, Redemption,
            TempleAnnouncement, TempleAdmin, CheckinReward, RewardClaim,
            SystemAdmin, TempleApplication, SystemSettings, SystemLog,
            UserReport, Notification, NotificationSettings,
            TempleEvent, EventRegistration
        )

        print("\n[OK] 所有 models 載入成功！")

        # 列出所有 models
        print(f"\n總共 {len(db.Model.__subclasses__())} 個 models：")
        for model in sorted(db.Model.__subclasses__(), key=lambda m: m.__name__):
            tablename = getattr(model, '__tablename__', 'N/A')
            print(f"  - {model.__name__:30s} -> {tablename}")

        # 檢查關鍵 relationships
        print("\n檢查關鍵 relationships:")

        # User relationships
        print("\n  User model:")
        print(f"    - amulets: {hasattr(User, 'amulets')}")
        print(f"    - checkins: {hasattr(User, 'checkins')}")
        print(f"    - energy_logs: {hasattr(User, 'energy_logs')}")
        print(f"    - addresses: {hasattr(User, 'addresses')}")
        print(f"    - redemptions: {hasattr(User, 'redemptions')}")

        # PublicUser relationships (應該沒有)
        print("\n  PublicUser model:")
        print(f"    - amulets: {hasattr(PublicUser, 'amulets')} (應為 False)")
        print(f"    - checkins: {hasattr(PublicUser, 'checkins')} (應為 False)")

        # TempleAdminUser relationships
        print("\n  TempleAdminUser model:")
        print(f"    - temple: {hasattr(TempleAdminUser, 'temple')}")

        # Temple relationships
        print("\n  Temple model:")
        print(f"    - checkins: {hasattr(Temple, 'checkins')}")
        print(f"    - admin_users (backref): {hasattr(Temple, 'admin_users')}")

        print("\n" + "=" * 80)
        print("[SUCCESS] Mapper 初始化成功！沒有錯誤！")
        print("=" * 80)

except ImportError as e:
    print(f"\n[ERROR] Import 錯誤: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

except Exception as e:
    print(f"\n[ERROR] Mapper 初始化失敗:")
    print(f"   錯誤類型: {type(e).__name__}")
    print(f"   錯誤訊息: {str(e)}")
    print("\n完整 traceback:")
    import traceback
    traceback.print_exc()

    # 檢查是否為 mapper 錯誤
    error_msg = str(e).lower()
    if 'mapper' in error_msg or 'foreignkey' in error_msg or 'relationship' in error_msg:
        print("\n" + "=" * 80)
        print("[ERROR] 這是 SQLAlchemy mapper/relationship 錯誤！")
        print("=" * 80)
        print("\n常見原因：")
        print("  1. ForeignKey 定義錯誤或不存在")
        print("  2. relationship backref 衝突（兩個 model 定義相同的 backref）")
        print("  3. relationship 的 foreign_keys 或 primaryjoin 錯誤")
        print("  4. 表名稱不匹配（如 ForeignKey('temple.id') 但表名是 'temples'）")

    sys.exit(1)
