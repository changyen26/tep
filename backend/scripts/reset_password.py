"""
重設密碼工具
使用方式：
    python scripts/reset_password.py
"""

import sys
sys.path.insert(0, '.')

from app import create_app, db
from app.models import TempleAdminUser, PublicUser, SuperAdminUser
from werkzeug.security import generate_password_hash

def reset_password():
    app = create_app()

    with app.app_context():
        print("=" * 60)
        print("重設密碼工具")
        print("=" * 60)

        # 選擇帳號類型
        print("\n請選擇帳號類型：")
        print("1. 廟方管理員 (temple_admin)")
        print("2. 一般使用者 (public)")
        print("3. 系統管理員 (super_admin)")

        account_type = input("\n請輸入選項 (1-3): ").strip()

        # 輸入 Email
        email = input("請輸入帳號 Email: ").strip().lower()

        # 查詢帳號
        user = None
        if account_type == '1':
            user = TempleAdminUser.query.filter_by(email=email).first()
            user_type = "廟方管理員"
        elif account_type == '2':
            user = PublicUser.query.filter_by(email=email).first()
            user_type = "一般使用者"
        elif account_type == '3':
            user = SuperAdminUser.query.filter_by(email=email).first()
            user_type = "系統管理員"
        else:
            print("[錯誤] 無效的選項")
            return

        if not user:
            print(f"\n[錯誤] 找不到此 {user_type} 帳號: {email}")
            return

        print(f"\n找到帳號：")
        print(f"  Email: {user.email}")
        print(f"  姓名: {user.name}")
        if hasattr(user, 'temple_id'):
            print(f"  廟宇ID: {user.temple_id}")

        # 輸入新密碼
        new_password = input("\n請輸入新密碼: ").strip()

        if len(new_password) < 6:
            print("[錯誤] 密碼至少需要 6 個字元")
            return

        # 確認
        confirm = input(f"\n確定要重設 {email} 的密碼嗎？(y/n): ").strip().lower()

        if confirm != 'y':
            print("已取消")
            return

        # 重設密碼
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()

        print(f"\n[成功] 密碼已重設！")
        print(f"  Email: {email}")
        print(f"  新密碼: {new_password}")

if __name__ == '__main__':
    reset_password()
