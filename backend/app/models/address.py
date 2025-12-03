"""
收件地址模型
"""
from app import db
from datetime import datetime

class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    recipient_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    postal_code = db.Column(db.String(10), nullable=True)
    city = db.Column(db.String(20), nullable=False)
    district = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    is_default = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'recipient_name': self.recipient_name,
            'phone': self.phone,
            'postal_code': self.postal_code,
            'city': self.city,
            'district': self.district,
            'address': self.address,
            'full_address': f"{self.postal_code or ''}{self.city}{self.district}{self.address}",
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Address {self.recipient_name} - {self.city}{self.district}>'
