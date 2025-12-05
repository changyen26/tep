"""
通知模型
"""
from app import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    type = db.Column(db.String(30), nullable=False, index=True)  # reward_received, redemption_status, temple_announcement, system_announcement, checkin_milestone
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)

    # 關聯資料（可選）
    related_type = db.Column(db.String(30), nullable=True)  # reward, redemption, temple, checkin
    related_id = db.Column(db.Integer, nullable=True)

    # 額外資料（JSON格式）
    data = db.Column(db.JSON, nullable=True)

    # 狀態
    is_read = db.Column(db.Boolean, default=False, index=True)
    read_at = db.Column(db.DateTime, nullable=True)

    # 時間戳記
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # 關聯
    user = db.relationship('User', backref='notifications', lazy=True)

    def mark_as_read(self):
        """標記為已讀"""
        self.is_read = True
        self.read_at = datetime.utcnow()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'content': self.content,
            'related_type': self.related_type,
            'related_id': self.related_id,
            'data': self.data,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版本（供列表使用）"""
        return {
            'id': self.id,
            'type': self.type,
            'title': self.title,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }

    @staticmethod
    def create_notification(user_id, type, title, content, related_type=None, related_id=None, data=None):
        """創建通知的快捷方法"""
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            content=content,
            related_type=related_type,
            related_id=related_id,
            data=data
        )
        db.session.add(notification)
        return notification

    @staticmethod
    def send_reward_notification(user_id, reward_name, points):
        """發送獎勵通知"""
        return Notification.create_notification(
            user_id=user_id,
            type='reward_received',
            title='獲得獎勵',
            content=f'恭喜！您獲得了「{reward_name}」獎勵，獲得 {points} 功德點數',
            related_type='reward',
            data={'points': points, 'reward_name': reward_name}
        )

    @staticmethod
    def send_redemption_notification(user_id, redemption_id, status, product_name):
        """發送兌換訂單狀態通知"""
        status_text = {
            'pending': '待處理',
            'processing': '處理中',
            'shipped': '已出貨',
            'completed': '已完成',
            'cancelled': '已取消'
        }.get(status, status)

        return Notification.create_notification(
            user_id=user_id,
            type='redemption_status',
            title='兌換訂單狀態更新',
            content=f'您的兌換訂單「{product_name}」狀態已更新為：{status_text}',
            related_type='redemption',
            related_id=redemption_id,
            data={'status': status, 'product_name': product_name}
        )

    @staticmethod
    def send_temple_announcement(user_ids, temple_id, title, content):
        """發送廟宇公告（批量）"""
        notifications = []
        for user_id in user_ids:
            notification = Notification.create_notification(
                user_id=user_id,
                type='temple_announcement',
                title=f'【廟宇公告】{title}',
                content=content,
                related_type='temple',
                related_id=temple_id
            )
            notifications.append(notification)
        return notifications

    @staticmethod
    def send_system_announcement(user_ids, title, content):
        """發送系統公告（批量）"""
        notifications = []
        for user_id in user_ids:
            notification = Notification.create_notification(
                user_id=user_id,
                type='system_announcement',
                title=f'【系統公告】{title}',
                content=content
            )
            notifications.append(notification)
        return notifications

    @staticmethod
    def send_checkin_milestone(user_id, milestone_type, value):
        """發送打卡里程碑通知"""
        milestone_text = {
            'consecutive_days': f'連續打卡 {value} 天',
            'total_count': f'累計打卡 {value} 次',
            'first_temple': '首次在廟宇打卡'
        }.get(milestone_type, milestone_type)

        return Notification.create_notification(
            user_id=user_id,
            type='checkin_milestone',
            title='打卡里程碑達成',
            content=f'恭喜！您已達成「{milestone_text}」里程碑！',
            data={'milestone_type': milestone_type, 'value': value}
        )
