"""
建立測試帳號（三表認證系統）
"""

import sys
sys.path.insert(0, '.')

from app import create_app, db
from app.models.temple import Temple
from app.models.public_user import PublicUser
from app.models.temple_admin_user import TempleAdminUser
from app.models.super_admin_user import SuperAdminUser

def create_test_accounts():
    app = create_app()

    with app.app_context():
        print("=" * 60)
        print("建立測試帳號（三表認證系統）")
        print("=" * 60)

        # 建立測試廟宇
        test_temple = Temple.query.filter_by(name='測試廟宇').first()
        if not test_temple:
            test_temple = Temple(
                name='測試廟宇',
                address='台北市信義區測試路1號',
                latitude=25.0330,
                longitude=121.5654,
                main_deity='媽祖',
                description='這是測試用的廟宇',
                phone='02-1234-5678',
                checkin_radius=100,
                checkin_merit_points=10,
                is_active=True
            )
            db.session.add(test_temple)
            db.session.flush()
            print(f"\n[新增] 測試廟宇 (ID: {test_temple.id})")
        else:
            print(f"\n[跳過] 測試廟宇已存在 (ID: {test_temple.id})")

        # 建立廟方管理員
        admin_email = 'admin@temple.com'
        temple_admin = TempleAdminUser.query.filter_by(email=admin_email).first()

        if temple_admin:
            print(f"\n[跳過] 廟方管理員已存在: {admin_email}")
        else:
            temple_admin = TempleAdminUser(
                name='廟宇管理員',
                email=admin_email,
                temple_id=test_temple.id,
                is_active=True
            )
            temple_admin.set_password('admin123')
            db.session.add(temple_admin)
            print(f"\n[新增] 廟方管理員: {admin_email}")
            print(f"         密碼: admin123")
            print(f"         廟宇ID: {test_temple.id}")

        # 建立系統管理員
        super_email = 'super@admin.com'
        super_admin = SuperAdminUser.query.filter_by(email=super_email).first()

        if super_admin:
            print(f"\n[跳過] 系統管理員已存在: {super_email}")
        else:
            super_admin = SuperAdminUser(
                name='系統管理員',
                email=super_email,
                is_active=True
            )
            super_admin.set_password('super123')
            db.session.add(super_admin)
            print(f"\n[新增] 系統管理員: {super_email}")
            print(f"         密碼: super123")

        # 建立一般信眾
        public_email = 'user@example.com'
        public_user = PublicUser.query.filter_by(email=public_email).first()

        if public_user:
            print(f"\n[跳過] 一般信眾已存在: {public_email}")
        else:
            public_user = PublicUser(
                name='測試信眾',
                email=public_email,
                blessing_points=100,
                is_active=True
            )
            public_user.set_password('user123')
            db.session.add(public_user)
            print(f"\n[新增] 一般信眾: {public_email}")
            print(f"         密碼: user123")

        # 提交變更
        db.session.commit()

        print("\n" + "=" * 60)
        print("測試帳號建立完成！")
        print("=" * 60)

        print("\n【廟方管理員】")
        print(f"  Email: admin@temple.com")
        print(f"  密碼: admin123")
        print(f"  登入類型: temple_admin")

        print("\n【系統管理員】")
        print(f"  Email: super@admin.com")
        print(f"  密碼: super123")
        print(f"  登入類型: super_admin")

        print("\n【一般信眾】")
        print(f"  Email: user@example.com")
        print(f"  密碼: user123")
        print(f"  登入類型: public")

        print("\n【登入 API】")
        print("  POST /api/auth/login")
        print('  Body: {"email": "...", "password": "...", "login_type": "..."}')

if __name__ == '__main__':
    create_test_accounts()
