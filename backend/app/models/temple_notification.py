"""
廟方通知模型
"""
from app import db
from datetime import datetime


class TempleNotification(db.Model):
    __tablename__ = 'temple_notifications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    channels = db.Column(db.JSON, nullable=False, default=lambda: ['line'])
    target_audience = db.Column(db.String(30), nullable=False, default='all')
    # all / active / dormant / new / lamp_expiring / birthday_month / event_registered / custom
    target_event_id = db.Column(db.Integer, db.ForeignKey('temple_events.id'), nullable=True)
    target_filters = db.Column(db.JSON, nullable=True)  # 自訂篩選條件
    target_count = db.Column(db.Integer, default=0)     # 預估受眾人數
    sent_count = db.Column(db.Integer, default=0)        # 實際發送數
    image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='draft', index=True)
    # draft / scheduled / sending / sent / failed
    scheduled_at = db.Column(db.DateTime, nullable=True, index=True)
    sent_at = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    temple = db.relationship('Temple', backref='temple_notifications')
    target_event = db.relationship('TempleEvent', foreign_keys=[target_event_id])
    stats = db.relationship('NotificationStats', backref='notification', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_stats=False):
        data = {
            'id': self.id,
            'templeId': self.temple_id,
            'title': self.title,
            'content': self.content,
            'channels': self.channels or [],
            'targetAudience': self.target_audience,
            'targetEventId': self.target_event_id,
            'targetFilters': self.target_filters,
            'targetCount': self.target_count,
            'sentCount': self.sent_count,
            'imageUrl': self.image_url,
            'status': self.status,
            'scheduledAt': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'sentAt': self.sent_at.isoformat() if self.sent_at else None,
            'createdBy': self.created_by,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_stats:
            stats_dict = {}
            for s in self.stats:
                stats_dict[s.channel] = {
                    'sent': s.sent,
                    'opened': s.opened,
                    'clicked': s.clicked,
                }
            data['stats'] = stats_dict
        return data

    def __repr__(self):
        return f'<TempleNotification {self.title}>'


class NotificationStats(db.Model):
    __tablename__ = 'notification_stats'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    notification_id = db.Column(db.Integer, db.ForeignKey('temple_notifications.id'), nullable=False, index=True)
    channel = db.Column(db.String(10), nullable=False)  # line / app
    sent = db.Column(db.Integer, default=0)
    opened = db.Column(db.Integer, default=0)
    clicked = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'channel': self.channel,
            'sent': self.sent,
            'opened': self.opened,
            'clicked': self.clicked,
        }

    def __repr__(self):
        return f'<NotificationStats {self.notification_id} {self.channel}>'


class NotificationTemplate(db.Model):
    __tablename__ = 'notification_templates'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(20), nullable=False, default='custom')
    # event / reminder / festival / announcement / custom
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    usage_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'templeId': self.temple_id,
            'name': self.name,
            'category': self.category,
            'title': self.title,
            'content': self.content,
            'isDefault': self.is_default,
            'usageCount': self.usage_count,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<NotificationTemplate {self.name}>'
