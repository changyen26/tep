"""
廟方管理員模型（廟方後台）
"""
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class TempleAdminUser(db.Model):
    __tablename__ = 'temple_admin_users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login_at = db.Column(db.DateTime, nullable=True)

    # 關聯
    temple = db.relationship('Temple', backref='admin_users', lazy='joined')

    def set_password(self, password):
        """設定密碼（加密）"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """驗證密碼"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """轉換為字典（不含密碼）"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'temple_id': self.temple_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
            'account_type': 'temple_admin'
        }

    def __repr__(self):
        return f'<TempleAdminUser {self.email} - Temple {self.temple_id}>'
