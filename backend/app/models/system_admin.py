"""
系統管理員模型
"""
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class SystemAdmin(db.Model):
    __tablename__ = 'system_admins'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), nullable=False, default='admin')  # super_admin, admin, moderator
    permissions = db.Column(db.JSON, nullable=True)  # 權限配置
    is_active = db.Column(db.Boolean, default=True, index=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    last_login_ip = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    created_logs = db.relationship('SystemLog', backref='admin', lazy=True)

    def set_password(self, password):
        """設置密碼（加密）"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """驗證密碼"""
        return check_password_hash(self.password_hash, password)

    def has_permission(self, permission_name):
        """檢查是否擁有特定權限"""
        if self.role == 'super_admin':
            return True
        if not self.permissions:
            return False
        return self.permissions.get(permission_name, False)

    def update_login_info(self, ip_address):
        """更新登入資訊"""
        self.last_login_at = datetime.utcnow()
        self.last_login_ip = ip_address

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'permissions': self.permissions,
            'is_active': self.is_active,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
            'last_login_ip': self.last_login_ip,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版本（供列表使用）"""
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
        }
