"""
通知設定模型
"""
from app import db
from datetime import datetime

class NotificationSettings(db.Model):
    __tablename__ = 'notification_settings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)

    # 各類型通知開關
    reward_received = db.Column(db.Boolean, default=True)  # 獎勵發放通知
    redemption_status = db.Column(db.Boolean, default=True)  # 兌換訂單狀態通知
    temple_announcement = db.Column(db.Boolean, default=True)  # 廟宇公告通知
    system_announcement = db.Column(db.Boolean, default=True)  # 系統公告通知
    checkin_milestone = db.Column(db.Boolean, default=True)  # 打卡里程碑通知

    # 推送設定
    push_enabled = db.Column(db.Boolean, default=True)  # 是否啟用推送通知
    email_enabled = db.Column(db.Boolean, default=False)  # 是否啟用郵件通知

    # 時間戳記
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    user = db.relationship('User', backref='notification_settings', lazy=True, uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'reward_received': self.reward_received,
            'redemption_status': self.redemption_status,
            'temple_announcement': self.temple_announcement,
            'system_announcement': self.system_announcement,
            'checkin_milestone': self.checkin_milestone,
            'push_enabled': self.push_enabled,
            'email_enabled': self.email_enabled,
            'updated_at': self.updated_at.isoformat()
        }

    def is_type_enabled(self, notification_type):
        """檢查特定類型的通知是否啟用"""
        return getattr(self, notification_type, True)

    @staticmethod
    def get_or_create(user_id):
        """獲取或創建用戶的通知設定"""
        settings = NotificationSettings.query.filter_by(user_id=user_id).first()
        if not settings:
            settings = NotificationSettings(user_id=user_id)
            db.session.add(settings)
            db.session.flush()
        return settings

    @staticmethod
    def should_send_notification(user_id, notification_type):
        """判斷是否應該發送通知給該用戶"""
        settings = NotificationSettings.query.filter_by(user_id=user_id).first()
        if not settings:
            return True  # 預設允許所有通知
        return settings.is_type_enabled(notification_type)
