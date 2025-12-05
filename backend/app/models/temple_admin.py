"""
廟方管理員模型
"""
from app import db
from datetime import datetime

class TempleAdmin(db.Model):
    __tablename__ = 'temple_admins'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False)  # owner, manager, staff
    permissions = db.Column(db.JSON, nullable=True)  # 權限設定 JSON
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # 關聯
    temple = db.relationship('Temple', backref='temple_admins', lazy='joined')
    user = db.relationship('User', foreign_keys=[user_id], backref='managed_temples', lazy='joined')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_temple_admins', lazy='joined')

    # 複合唯一約束（一個使用者在同一廟宇只能有一個角色）
    __table_args__ = (
        db.UniqueConstraint('temple_id', 'user_id', name='unique_temple_user'),
    )

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'temple_id': self.temple_id,
            'temple_name': self.temple.name if self.temple else None,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'role': self.role,
            'permissions': self.permissions or self.get_default_permissions(self.role),
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版字典（列表顯示用）"""
        return {
            'id': self.id,
            'temple_id': self.temple_id,
            'temple_name': self.temple.name if self.temple else None,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'role': self.role,
            'is_active': self.is_active
        }

    @staticmethod
    def get_default_permissions(role):
        """獲取角色的預設權限"""
        permissions_map = {
            'owner': {
                'manage_info': True,
                'view_stats': True,
                'manage_products': True,
                'manage_announcements': True,
                'manage_rewards': True,
                'manage_admins': True
            },
            'manager': {
                'manage_info': True,
                'view_stats': True,
                'manage_products': True,
                'manage_announcements': True,
                'manage_rewards': True,
                'manage_admins': False
            },
            'staff': {
                'manage_info': False,
                'view_stats': True,
                'manage_products': False,
                'manage_announcements': True,
                'manage_rewards': False,
                'manage_admins': False
            }
        }
        return permissions_map.get(role, {})

    def has_permission(self, permission_name):
        """檢查是否有特定權限"""
        perms = self.permissions or self.get_default_permissions(self.role)
        return perms.get(permission_name, False)

    def __repr__(self):
        return f'<TempleAdmin temple={self.temple_id} user={self.user_id} role={self.role}>'
