"""
點燈類型模型
"""
from app import db
from datetime import datetime

class LampType(db.Model):
    __tablename__ = 'lamp_types'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    duration_days = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default='active', nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    temple = db.relationship('Temple', backref='lamp_types')
    applications = db.relationship('LampApplication', backref='lamp_type', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'templeId': self.temple_id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else 0,
            'durationDays': self.duration_days,
            'imageUrl': self.image_url,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<LampType {self.name}>'
