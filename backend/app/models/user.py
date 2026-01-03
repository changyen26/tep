"""
使用者模型
"""
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # user, admin
    blessing_points = db.Column(db.Integer, default=0, nullable=False)  # 祝福點數/功德值
    is_active = db.Column(db.Boolean, default=True, nullable=False)  # 使用者啟用狀態
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # 關聯
    amulets = db.relationship('Amulet', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    checkins = db.relationship('Checkin', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    energy_logs = db.relationship('Energy', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    addresses = db.relationship('Address', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    redemptions = db.relationship('Redemption', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        """設定密碼（加密）"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """驗證密碼"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """轉換為字典（不含密碼）"""
        result = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'blessing_points': self.blessing_points,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

        # 如果是 temple_admin，添加 temple_id
        if self.role == 'temple_admin':
            # 從 TempleAdmin 關聯中獲取 temple_id
            from app.models.temple_admin import TempleAdmin
            temple_admin = TempleAdmin.query.filter_by(
                user_id=self.id,
                is_active=True
            ).first()
            if temple_admin:
                result['temple_id'] = temple_admin.temple_id

        return result

    def __repr__(self):
        return f'<User {self.email}>'
