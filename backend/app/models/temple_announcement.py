"""
廟宇公告模型
"""
from app import db
from datetime import datetime

class TempleAnnouncement(db.Model):
    __tablename__ = 'temple_announcements'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False, index=True)  # event, festival, maintenance, news, important
    priority = db.Column(db.String(10), default='normal', nullable=False)  # low, normal, high, urgent
    image_url = db.Column(db.String(500), nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    is_published = db.Column(db.Boolean, default=False, nullable=False, index=True)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    temple = db.relationship('Temple', backref='announcements', lazy='joined')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_announcements', lazy='joined')

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'temple_id': self.temple_id,
            'temple_name': self.temple.name if self.temple else None,
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'priority': self.priority,
            'image_url': self.image_url,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_published': self.is_published,
            'view_count': self.view_count,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def to_simple_dict(self):
        """簡化版字典（列表顯示用）"""
        return {
            'id': self.id,
            'temple_id': self.temple_id,
            'temple_name': self.temple.name if self.temple else None,
            'title': self.title,
            'type': self.type,
            'priority': self.priority,
            'image_url': self.image_url,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_published': self.is_published,
            'view_count': self.view_count,
            'created_at': self.created_at.isoformat()
        }

    def increment_view_count(self):
        """增加瀏覽次數"""
        self.view_count += 1
        db.session.commit()

    def __repr__(self):
        return f'<TempleAnnouncement {self.title}>'
