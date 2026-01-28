"""
系統管理員模型（系統管理後台）
"""
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class SuperAdminUser(db.Model):
    __tablename__ = 'super_admin_users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login_at = db.Column(db.DateTime, nullable=True)

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
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
            'account_type': 'super_admin'
        }

    def __repr__(self):
        return f'<SuperAdminUser {self.email}>'
