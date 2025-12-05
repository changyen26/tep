"""
創建測試系統管理員帳號
"""
from app import create_app, db
from app.models.system_admin import SystemAdmin

app = create_app()

with app.app_context():
    # 檢查是否已存在
    existing = SystemAdmin.query.filter_by(username='admin').first()
    if existing:
        print(f'Admin already exists: {existing.username}')
    else:
        # 創建超級管理員
        admin = SystemAdmin(
            username='admin',
            name='Super Administrator',
            email='admin@temple.com',
            phone='0912345678',
            role='super_admin',
            permissions={
                'manage_users': True,
                'review_temples': True,
                'review_products': True,
                'manage_orders': True,
                'view_analytics': True,
                'manage_settings': True,
                'handle_reports': True,
                'manage_admins': True,
                'view_logs': True
            }
        )
        admin.set_password('admin123')

        db.session.add(admin)
        db.session.commit()

        print(f'Admin created successfully!')
        print(f'Username: {admin.username}')
        print(f'ID: {admin.id}')
        print(f'Role: {admin.role}')
