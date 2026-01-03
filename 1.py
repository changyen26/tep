"""
生成假數據腳本 - 用於展示系統功能
"""
import sys
import os
from datetime import datetime, timedelta
import random

# 設置路徑
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, db
from app.models.user import User
from app.models.temple import Temple
from app.models.amulet import Amulet
from app.models.checkin import Checkin
from app.models.product import Product
from app.models.redemption import Redemption
from app.models.temple_admin import TempleAdmin
from app.models.system_admin import SystemAdmin
from werkzeug.security import generate_password_hash

def clear_all_data():
    """清除所有數據（謹慎使用）"""
    print("清除現有數據...")
    db.session.query(Redemption).delete()
    db.session.query(Product).delete()
    db.session.query(Checkin).delete()
    db.session.query(Amulet).delete()
    db.session.query(TempleAdmin).delete()
    db.session.query(Temple).delete()
    db.session.query(SystemAdmin).delete()
    db.session.query(User).delete()
    db.session.commit()
    print("數據清除完成")

def create_users():
    """創建使用者"""
    print("\n創建使用者...")
    users = []

    # 創建系統管理員（如果不存在）
    admin_user = User.query.filter_by(email='admin@temple.com').first()
    if not admin_user:
        admin_user = User(
            name='系統管理員',
            email='admin@temple.com',
            password_hash=generate_password_hash('admin123'),
            role='admin',
            blessing_points=0
        )
        db.session.add(admin_user)
        db.session.flush()  # 確保獲取 ID

    # 創建一般使用者
    user_data = [
        {'name': '王小明', 'email': 'ming@example.com', 'points': 850},
        {'name': '李美華', 'email': 'hua@example.com', 'points': 720},
        {'name': '陳建國', 'email': 'kuo@example.com', 'points': 650},
        {'name': '林雅婷', 'email': 'ting@example.com', 'points': 530},
        {'name': '張文傑', 'email': 'jie@example.com', 'points': 480},
        {'name': '黃志明', 'email': 'huang@example.com', 'points': 420},
        {'name': '吳佳玲', 'email': 'wu@example.com', 'points': 380},
        {'name': '蔡依林', 'email': 'tsai@example.com', 'points': 350},
        {'name': '劉建宏', 'email': 'liu@example.com', 'points': 290},
        {'name': '鄭淑芬', 'email': 'cheng@example.com', 'points': 250},
    ]

    for data in user_data:
        # 檢查是否已存在
        existing = User.query.filter_by(email=data['email']).first()
        if existing:
            users.append(existing)
            continue

        user = User(
            name=data['name'],
            email=data['email'],
            password_hash=generate_password_hash('password123'),
            role='user',
            blessing_points=data['points']
        )
        db.session.add(user)
        users.append(user)

    db.session.commit()
    print(f"[OK] 創建了 {len(user_data) + 1} 個使用者（跳過已存在）")
    return [admin_user] + users

def create_temples(users):
    """創建廟宇"""
    print("\n創建廟宇...")
    temples = []

    temple_data = [
        {
            'name': '龍山寺',
            'main_deity': '觀世音菩薩',
            'description': '臺灣最著名的寺廟之一，供奉觀世音菩薩，香火鼎盛，建築精美。',
            'address': '台北市萬華區廣州街211號',
            'latitude': 25.0368,
            'longitude': 121.4996,
            'phone': '02-2302-5162',
            'email': 'longshan@temple.tw',
            'opening_hours': '06:00-22:00',
            'checkin_radius': 100,
            'checkin_merit_points': 10,
            'images': ['https://picsum.photos/400/300?random=1'],
        },
        {
            'name': '行天宮',
            'main_deity': '關聖帝君',
            'description': '供奉關聖帝君，以靈驗著稱，是台北市重要的信仰中心。',
            'address': '台北市中山區民權東路二段109號',
            'latitude': 25.0628,
            'longitude': 121.5333,
            'phone': '02-2502-7924',
            'email': 'xingtian@temple.tw',
            'opening_hours': '04:00-22:00',
            'checkin_radius': 80,
            'checkin_merit_points': 10,
            'images': ['https://picsum.photos/400/300?random=2'],
        },
        {
            'name': '大甲鎮瀾宮',
            'main_deity': '天上聖母',
            'description': '媽祖信仰中心，每年舉辦盛大的媽祖遶境進香活動。',
            'address': '台中市大甲區順天路158號',
            'latitude': 24.3487,
            'longitude': 120.6221,
            'phone': '04-2676-3522',
            'email': 'dajia@temple.tw',
            'opening_hours': '05:00-23:00',
            'checkin_radius': 120,
            'checkin_merit_points': 15,
            'images': ['https://picsum.photos/400/300?random=3'],
        },
        {
            'name': '文昌宮',
            'main_deity': '文昌帝君',
            'description': '供奉文昌帝君，為考生祈福聖地，香火鼎盛。',
            'address': '台北市大同區民權西路98號',
            'latitude': 25.0628,
            'longitude': 121.5133,
            'phone': '02-2558-8731',
            'email': 'wenchang@temple.tw',
            'opening_hours': '06:30-21:00',
            'checkin_radius': 90,
            'checkin_merit_points': 10,
            'images': ['https://picsum.photos/400/300?random=4'],
        },
        {
            'name': '保安宮',
            'main_deity': '保生大帝',
            'description': '主祀保生大帝，為國定古蹟，建築藝術精湛。',
            'address': '台北市大同區哈密街61號',
            'latitude': 25.0732,
            'longitude': 121.5158,
            'phone': '02-2595-1676',
            'email': 'baoan@temple.tw',
            'opening_hours': '06:00-22:00',
            'checkin_radius': 100,
            'checkin_merit_points': 12,
            'images': ['https://picsum.photos/400/300?random=5'],
        },
    ]

    for i, data in enumerate(temple_data):
        temple = Temple(**data)
        temple.is_active = True
        db.session.add(temple)
        temples.append(temple)

    db.session.commit()
    print(f"[OK] 創建了 {len(temples)} 個廟宇")
    return temples

def create_temple_admins(users, temples):
    """創建廟方管理員"""
    print("\n創建廟方管理員...")

    # 為每個廟宇分配一個管理員
    for i, temple in enumerate(temples):
        # 使用 users[i+1] 避開系統管理員
        if i + 1 < len(users):
            admin = TempleAdmin(
                temple_id=temple.id,
                user_id=users[i + 1].id,
                role='owner',
                permissions=['manage_info', 'manage_products', 'view_stats', 'manage_orders'],
                is_active=True
            )
            db.session.add(admin)

            # 更新使用者角色
            users[i + 1].role = 'temple_admin'

    db.session.commit()
    print(f"[OK] 創建了 {len(temples)} 個廟方管理員")

def create_amulets(users):
    """創建平安符"""
    print("\n創建平安符...")
    amulets = []

    # 為大部分使用者創建平安符
    for user in users[1:]:  # 跳過系統管理員
        energy = random.randint(30, 100)
        status = 'active' if energy > 20 else 'inactive'

        amulet = Amulet(
            user_id=user.id,
            energy=energy,
            status=status
        )
        db.session.add(amulet)
        amulets.append(amulet)

    db.session.commit()
    print(f"[OK] 創建了 {len(amulets)} 個平安符")
    return amulets

def create_checkins(users, temples, amulets):
    """創建打卡記錄"""
    print("\n創建打卡記錄...")
    checkins = []

    # 創建 user_id 到 amulet 的映射
    user_amulets = {amulet.user_id: amulet for amulet in amulets}

    # 在過去30天內生成打卡記錄
    for day in range(30):
        date = datetime.now() - timedelta(days=day)

        # 每天隨機讓幾個使用者打卡
        daily_checkin_count = random.randint(3, 8)
        # 只選擇有平安符的使用者
        users_with_amulets = [u for u in users[1:] if u.id in user_amulets]
        selected_users = random.sample(users_with_amulets, min(daily_checkin_count, len(users_with_amulets)))

        for user in selected_users:
            temple = random.choice(temples)
            amulet = user_amulets[user.id]

            checkin = Checkin(
                user_id=user.id,
                amulet_id=amulet.id,
                temple_id=temple.id,
                blessing_points=10,
                timestamp=date,
                latitude=temple.latitude if temple.latitude else None,
                longitude=temple.longitude if temple.longitude else None
            )
            db.session.add(checkin)
            checkins.append(checkin)

    db.session.commit()
    print(f"[OK] 創建了 {len(checkins)} 筆打卡記錄")
    return checkins

def create_products(temples):
    """創建商品"""
    print("\n創建商品...")
    products = []

    product_templates = [
        {
            'name': '平安符',
            'category': '平安符',
            'description': '祈求平安，隨身攜帶保平安。',
            'merit_points': 50,
            'stock': 100,
        },
        {
            'name': '文昌筆',
            'category': '祈福商品',
            'description': '祈求學業進步，考試順利。',
            'merit_points': 80,
            'stock': 50,
        },
        {
            'name': '福袋',
            'category': '祈福商品',
            'description': '招財進寶，好運連連。',
            'merit_points': 100,
            'stock': 30,
        },
        {
            'name': '御守吊飾',
            'category': '文創商品',
            'description': '精美吊飾，保佑出入平安。',
            'merit_points': 60,
            'stock': 80,
        },
        {
            'name': '香包',
            'category': '祈福商品',
            'description': '天然香料，淨化身心。',
            'merit_points': 40,
            'stock': 120,
        },
        {
            'name': '經文手環',
            'category': '文創商品',
            'description': '經文加持，日日平安。',
            'merit_points': 70,
            'stock': 60,
        },
    ]

    # 為每個廟宇創建商品
    for temple in temples:
        # 每個廟宇隨機選擇 3-5 個商品
        selected_products = random.sample(product_templates, random.randint(3, 5))

        for template in selected_products:
            product = Product(
                temple_id=temple.id,
                name=f"{temple.name} {template['name']}",
                category=template['category'],
                description=template['description'],
                merit_points=template['merit_points'],
                stock_quantity=template['stock'],
                images=['https://picsum.photos/300/300?random=' + str(random.randint(10, 100))],
                is_active=True,
                is_featured=random.choice([True, False])
            )
            db.session.add(product)
            products.append(product)

    db.session.commit()
    print(f"[OK] 創建了 {len(products)} 個商品")
    return products

def create_redemptions(users, products):
    """創建兌換訂單"""
    print("\n創建兌換訂單...")
    redemptions = []

    # 創建一些兌換記錄
    for _ in range(20):
        user = random.choice(users[1:])  # 跳過管理員
        product = random.choice(products)

        # 隨機日期（過去30天內）
        days_ago = random.randint(0, 30)
        redeemed_at = datetime.now() - timedelta(days=days_ago)

        # 隨機狀態
        status_weights = [
            ('pending', 0.1),
            ('processing', 0.2),
            ('shipped', 0.3),
            ('completed', 0.35),
            ('cancelled', 0.05)
        ]
        status = random.choices(
            [s[0] for s in status_weights],
            weights=[s[1] for s in status_weights]
        )[0]

        redemption = Redemption(
            user_id=user.id,
            product_id=product.id,
            quantity=1,
            merit_points_used=product.merit_points,
            status=status,
            recipient_name=user.name,
            phone=f'09{random.randint(10000000, 99999999)}',
            city='台北市',
            district='信義區',
            address=f'信義路{random.randint(1, 100)}號',
            redeemed_at=redeemed_at
        )
        db.session.add(redemption)
        redemptions.append(redemption)

    db.session.commit()
    print(f"[OK] 創建了 {len(redemptions)} 筆兌換訂單")
    return redemptions

def create_system_admin():
    """創建系統管理員帳號"""
    print("\n創建系統管理員...")

    # 檢查是否已存在
    existing = SystemAdmin.query.filter_by(username='admin').first()
    if existing:
        print("[OK] 系統管理員已存在")
        return existing

    admin = SystemAdmin(
        username='admin',
        password_hash=generate_password_hash('admin123'),
        name='系統管理員',
        email='admin@temple.com',
        role='super_admin',
        permissions={
            'manage_users': True,
            'manage_temples': True,
            'manage_products': True,
            'manage_orders': True,
            'view_analytics': True,
            'manage_settings': True,
            'manage_reports': True,
            'view_logs': True
        },
        is_active=True
    )
    db.session.add(admin)
    db.session.commit()
    print("[OK] 系統管理員創建成功")
    print("  帳號: admin")
    print("  密碼: admin123")
    return admin

def generate_all_data():
    """生成所有假數據"""
    print("=" * 60)
    print("開始生成展示用假數據")
    print("=" * 60)

    # 清除現有數據（可選）
    # clear_all_data()

    # 創建系統管理員
    admin = create_system_admin()

    # 創建使用者
    users = create_users()

    # 創建廟宇
    temples = create_temples(users)

    # 創建廟方管理員
    create_temple_admins(users, temples)

    # 創建平安符
    amulets = create_amulets(users)

    # 創建打卡記錄
    checkins = create_checkins(users, temples, amulets)

    # 創建商品
    products = create_products(temples)

    # 創建兌換訂單
    redemptions = create_redemptions(users, products)

    print("\n" + "=" * 60)
    print("假數據生成完成！")
    print("=" * 60)
    print("\n登入資訊：")
    print("\n【系統管理員】")
    print("  帳號: admin")
    print("  密碼: admin123")
    print("  登入網址: http://localhost:5173 (system-admin-web)")

    print("\n【廟方管理員】")
    print("  帳號: ming@example.com (龍山寺)")
    print("  密碼: password123")
    print("  登入網址: http://localhost:3000 (frontend)")

    print("\n【一般使用者】")
    print("  帳號: hua@example.com")
    print("  密碼: password123")
    print("  登入網址: http://localhost:3000 (frontend)")

    print("\n數據統計：")
    print(f"  [OK] 使用者: {len(users)} 個")
    print(f"  [OK] 廟宇: {len(temples)} 個")
    print(f"  [OK] 平安符: {len(amulets)} 個")
    print(f"  [OK] 打卡記錄: {len(checkins)} 筆")
    print(f"  [OK] 商品: {len(products)} 個")
    print(f"  [OK] 兌換訂單: {len(redemptions)} 筆")
    print("=" * 60)

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        try:
            generate_all_data()
        except Exception as e:
            print(f"\n[ERROR] 錯誤: {str(e)}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
