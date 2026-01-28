"""
建立 iOS App 測試資料
- 台中大里、霧峰區廟宇（含 GPS 座標）
- 測試帳號
- 測試商品

使用方式：
    cd backend
    python scripts/setup_test_data.py
"""

import sys
sys.path.insert(0, '.')

from app import create_app, db
from app.models.temple import Temple
from app.models.public_user import PublicUser
from app.models.user import User
from app.models.product import Product
from app.models.amulet import Amulet

def setup_test_data():
    app = create_app()

    with app.app_context():
        print("=" * 60)
        print("開始建立 iOS App 測試資料")
        print("=" * 60)

        # ========================================
        # 1. 建立測試廟宇（台中大里、霧峰）
        # ========================================
        print("\n【建立測試廟宇】")

        temples_data = [
            # 大里區廟宇
            {
                'name': '大里福興宮',
                'address': '台中市大里區新興路100號',
                'latitude': 24.1058,
                'longitude': 120.6778,
                'main_deity': '天上聖母（媽祖）',
                'description': '大里福興宮是大里區重要的媽祖廟，香火鼎盛，為當地居民的信仰中心。',
                'phone': '04-2483-1234',
                'checkin_radius': 100,
                'checkin_merit_points': 20,
                'is_active': True
            },
            {
                'name': '大里杙福德宮',
                'address': '台中市大里區大里路200號',
                'latitude': 24.0995,
                'longitude': 120.6850,
                'main_deity': '福德正神（土地公）',
                'description': '大里杙福德宮歷史悠久，是大里區最古老的土地公廟之一。',
                'phone': '04-2486-5678',
                'checkin_radius': 100,
                'checkin_merit_points': 15,
                'is_active': True
            },
            {
                'name': '大里區天公廟',
                'address': '台中市大里區國光路二段100號',
                'latitude': 24.1020,
                'longitude': 120.6920,
                'main_deity': '玉皇大帝',
                'description': '主祀玉皇大帝，是大里區重要的道教宮廟。',
                'phone': '04-2407-1111',
                'checkin_radius': 100,
                'checkin_merit_points': 25,
                'is_active': True
            },
            # 霧峰區廟宇
            {
                'name': '霧峰青桐林福德祠',
                'address': '台中市霧峰區青桐林路50號',
                'latitude': 24.0630,
                'longitude': 120.7010,
                'main_deity': '福德正神（土地公）',
                'description': '位於霧峰青桐林，環境清幽，是當地居民祈福的好去處。',
                'phone': '04-2339-2222',
                'checkin_radius': 100,
                'checkin_merit_points': 15,
                'is_active': True
            },
            {
                'name': '霧峰萬佛寺',
                'address': '台中市霧峰區峰谷路900號',
                'latitude': 24.0580,
                'longitude': 120.6950,
                'main_deity': '釋迦牟尼佛',
                'description': '霧峰萬佛寺莊嚴肅穆，供奉萬尊佛像，是修行者的聖地。',
                'phone': '04-2330-3333',
                'checkin_radius': 150,
                'checkin_merit_points': 30,
                'is_active': True
            },
            {
                'name': '霧峰北柳福德廟',
                'address': '台中市霧峰區北柳里中正路500號',
                'latitude': 24.0650,
                'longitude': 120.6880,
                'main_deity': '福德正神（土地公）',
                'description': '霧峰北柳地區的信仰中心，每年農曆二月初二土地公生日熱鬧非凡。',
                'phone': '04-2332-4444',
                'checkin_radius': 100,
                'checkin_merit_points': 15,
                'is_active': True
            }
        ]

        created_temples = []
        for temple_data in temples_data:
            # 檢查是否已存在
            existing = Temple.query.filter_by(name=temple_data['name']).first()
            if existing:
                print(f"  [跳過] {temple_data['name']} - 已存在 (ID: {existing.id})")
                created_temples.append(existing)
            else:
                temple = Temple(**temple_data)
                db.session.add(temple)
                db.session.flush()  # 取得 ID
                print(f"  [新增] {temple_data['name']} (ID: {temple.id})")
                created_temples.append(temple)

        # ========================================
        # 2. 建立測試帳號（同時在 users 和 public_users 表）
        # ========================================
        print("\n【建立測試帳號】")

        test_user_email = 'test@example.com'

        # 在 users 表建立（供 amulet 外鍵使用）
        test_user = User.query.filter_by(email=test_user_email).first()
        if test_user:
            print(f"  [跳過] users 表帳號已存在: {test_user_email} (ID: {test_user.id})")
        else:
            test_user = User(
                name='測試使用者',
                email=test_user_email,
                blessing_points=500
            )
            test_user.set_password('test1234')
            db.session.add(test_user)
            db.session.flush()
            print(f"  [新增] users 表帳號: {test_user_email} (ID: {test_user.id})")

        # 在 public_users 表建立（供 API 登入使用）
        public_user = PublicUser.query.filter_by(email=test_user_email).first()
        if public_user:
            print(f"  [跳過] public_users 表帳號已存在: {test_user_email} (ID: {public_user.id})")
        else:
            public_user = PublicUser(
                name='測試使用者',
                email=test_user_email,
                blessing_points=500
            )
            public_user.set_password('test1234')
            db.session.add(public_user)
            db.session.flush()
            print(f"  [新增] public_users 表帳號: {test_user_email} (ID: {public_user.id})")

        print(f"         密碼: test1234")

        # ========================================
        # 3. 建立測試護身符
        # ========================================
        print("\n【建立測試護身符】")

        existing_amulet = Amulet.query.filter_by(user_id=test_user.id).first()
        if existing_amulet:
            print(f"  [跳過] 測試護身符已存在 (ID: {existing_amulet.id})")
            test_amulet = existing_amulet
        else:
            test_amulet = Amulet(
                user_id=test_user.id,
                energy=100,
                status='active'
            )
            db.session.add(test_amulet)
            db.session.flush()
            print(f"  [新增] 測試護身符 (ID: {test_amulet.id})")

        # ========================================
        # 4. 測試商品（暫時跳過，資料表結構需更新）
        # ========================================
        print("\n【測試商品】")
        print("  [跳過] 商品建立（打卡測試不需要）")

        # 提交所有變更
        db.session.commit()

        # ========================================
        # 輸出摘要
        # ========================================
        print("\n" + "=" * 60)
        print("測試資料建立完成！")
        print("=" * 60)

        print("\n【測試帳號資訊】")
        print(f"  Email: {test_user_email}")
        print(f"  密碼: test1234")
        print(f"  功德點: {test_user.blessing_points}")
        print(f"  護身符 ID: {test_amulet.id}")

        print("\n【測試廟宇列表】")
        for temple in created_temples:
            print(f"  ID {temple.id}: {temple.name}")
            print(f"      GPS: {temple.latitude}, {temple.longitude}")
            print(f"      打卡功德: {temple.checkin_merit_points} 點")

        print("\n【QR Code 內容格式】")
        print("  格式: temple:{temple_id}")
        print("  範例:")
        for temple in created_temples[:3]:
            print(f"    - {temple.name}: temple:{temple.id}")

if __name__ == '__main__':
    setup_test_data()
