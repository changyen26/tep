"""
活動報名記錄模型
"""
from app import db
from datetime import datetime

class EventRegistration(db.Model):
    __tablename__ = 'event_registrations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('temple_events.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # 可選：若開放遊客報名
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='registered', nullable=False, index=True)  # registered, canceled, waitlist
    registered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    canceled_at = db.Column(db.DateTime, nullable=True)

    # 關聯
    user = db.relationship('User', foreign_keys=[user_id])

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'eventId': self.event_id,
            'userId': self.user_id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'notes': self.notes,
            'status': self.status,
            'registeredAt': self.registered_at.isoformat() if self.registered_at else None,
            'canceledAt': self.canceled_at.isoformat() if self.canceled_at else None
        }

    def __repr__(self):
        return f'<EventRegistration {self.name} - Event {self.event_id}>'
