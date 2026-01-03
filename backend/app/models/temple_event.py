"""
廟方活動模型
"""
from app import db
from datetime import datetime

class TempleEvent(db.Model):
    __tablename__ = 'temple_events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    start_at = db.Column(db.DateTime, nullable=False, index=True)
    end_at = db.Column(db.DateTime, nullable=False)
    signup_end_at = db.Column(db.DateTime, nullable=False, index=True)
    capacity = db.Column(db.Integer, nullable=False)
    fee = db.Column(db.Numeric(10, 2), default=0, nullable=False)
    cover_image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default='draft', nullable=False, index=True)  # draft, published, closed, canceled
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    registrations = db.relationship('EventRegistration', backref='event', lazy='dynamic', cascade='all, delete-orphan')
    temple = db.relationship('Temple', backref='events')
    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self, include_registered_count=False):
        """轉換為字典"""
        result = {
            'id': self.id,
            'templeId': self.temple_id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'startAt': self.start_at.isoformat() if self.start_at else None,
            'endAt': self.end_at.isoformat() if self.end_at else None,
            'signupEndAt': self.signup_end_at.isoformat() if self.signup_end_at else None,
            'capacity': self.capacity,
            'fee': float(self.fee) if self.fee else 0,
            'coverImageUrl': self.cover_image_url,
            'status': self.status,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

        # 如需包含報名人數
        if include_registered_count:
            registered_count = self.registrations.filter_by(status='registered').count()
            result['registeredCount'] = registered_count

        return result

    def __repr__(self):
        return f'<TempleEvent {self.title}>'
