"""
系統日誌模型
"""
from app import db
from datetime import datetime

class SystemLog(db.Model):
    __tablename__ = 'system_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('system_admins.id', ondelete='SET NULL'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action_type = db.Column(db.String(50), nullable=False, index=True)  # login, user_update, temple_approve, etc.
    action_category = db.Column(db.String(30), nullable=False, index=True)  # auth, user_mgmt, temple_mgmt, order_mgmt, system
    target_type = db.Column(db.String(30), nullable=True)  # user, temple, order, product, etc.
    target_id = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    request_method = db.Column(db.String(10), nullable=True)  # GET, POST, PUT, DELETE
    request_path = db.Column(db.String(500), nullable=True)
    request_data = db.Column(db.JSON, nullable=True)  # 敏感資料應過濾
    response_status = db.Column(db.Integer, nullable=True)  # HTTP status code
    changes = db.Column(db.JSON, nullable=True)  # 記錄變更前後的資料
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # 關聯已在 SystemAdmin 中定義 backref
    user = db.relationship('User', backref='system_logs', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'admin_id': self.admin_id,
            'admin_name': self.admin.name if self.admin else None,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'action_type': self.action_type,
            'action_category': self.action_category,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'description': self.description,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'request_method': self.request_method,
            'request_path': self.request_path,
            'request_data': self.request_data,
            'response_status': self.response_status,
            'changes': self.changes,
            'created_at': self.created_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版本（供列表使用）"""
        return {
            'id': self.id,
            'admin_name': self.admin.name if self.admin else None,
            'action_type': self.action_type,
            'action_category': self.action_category,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }

    @staticmethod
    def log_action(admin_id=None, user_id=None, action_type='', action_category='',
                   target_type=None, target_id=None, description='',
                   ip_address=None, user_agent=None, request_method=None,
                   request_path=None, request_data=None, response_status=None, changes=None):
        """記錄操作日誌的快捷方法"""
        log = SystemLog(
            admin_id=admin_id,
            user_id=user_id,
            action_type=action_type,
            action_category=action_category,
            target_type=target_type,
            target_id=target_id,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            request_method=request_method,
            request_path=request_path,
            request_data=request_data,
            response_status=response_status,
            changes=changes
        )
        db.session.add(log)
        return log
