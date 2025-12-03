"""
廟宇模型
"""
from app import db
from datetime import datetime

class Temple(db.Model):
    __tablename__ = 'temples'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    address = db.Column(db.String(200), nullable=True)
    latitude = db.Column(db.Numeric(10, 8), nullable=True)  # 緯度
    longitude = db.Column(db.Numeric(11, 8), nullable=True)  # 經度
    main_deity = db.Column(db.String(50), nullable=True)  # 主祀神明
    description = db.Column(db.Text, nullable=True)
    nfc_uid = db.Column(db.String(50), unique=True, nullable=True, index=True)  # NFC 標籤 UID
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    checkins = db.relationship('Checkin', backref='temple', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'main_deity': self.main_deity,
            'description': self.description,
            'nfc_uid': self.nfc_uid,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def to_simple_dict(self):
        """簡化版字典（列表顯示用）"""
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'main_deity': self.main_deity,
            'is_active': self.is_active
        }

    def __repr__(self):
        return f'<Temple {self.name}>'
