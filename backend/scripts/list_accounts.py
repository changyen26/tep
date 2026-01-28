"""
列出所有測試帳號
使用方式：
    python scripts/list_accounts.py
"""

import sys
sys.path.insert(0, '.')

from app import create_app, db
from app.models import TempleAdminUser, PublicUser, SuperAdminUser

def list_accounts():
    app = create_app()

    with app.app_context():
        print("=" * 80)
        print("系統帳號列表")
        print("=" * 80)

        # 廟方管理員
        print("\n【廟方管理員】")
        temple_admins = TempleAdminUser.query.all()
        if temple_admins:
            for user in temple_admins:
                print(f"  ID: {user.id}")
                print(f"  Email: {user.email}")
                print(f"  姓名: {user.name}")
                print(f"  廟宇ID: {user.temple_id}")
                print(f"  啟用: {'是' if user.is_active else '否'}")
                print("-" * 40)
        else:
            print("  (無)")

        # 一般使用者
        print("\n【一般使用者】")
        public_users = PublicUser.query.all()
        if public_users:
            for user in public_users:
                print(f"  ID: {user.id}")
                print(f"  Email: {user.email}")
                print(f"  姓名: {user.name}")
                print(f"  功德點數: {user.blessing_points}")
                print(f"  啟用: {'是' if user.is_active else '否'}")
                print("-" * 40)
        else:
            print("  (無)")

        # 系統管理員
        print("\n【系統管理員】")
        super_admins = SuperAdminUser.query.all()
        if super_admins:
            for user in super_admins:
                print(f"  ID: {user.id}")
                print(f"  Email: {user.email}")
                print(f"  姓名: {user.name}")
                print(f"  啟用: {'是' if user.is_active else '否'}")
                print("-" * 40)
        else:
            print("  (無)")

        print("\n" + "=" * 80)
        print(f"總計: {len(temple_admins)} 位廟方管理員, {len(public_users)} 位一般使用者, {len(super_admins)} 位系統管理員")

if __name__ == '__main__':
    list_accounts()
