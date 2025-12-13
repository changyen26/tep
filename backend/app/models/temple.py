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

    # 廟宇照片與媒體
    images = db.Column(db.JSON, nullable=True)  # 廟宇照片陣列

    # 聯絡資訊
    phone = db.Column(db.String(20), nullable=True)  # 聯絡電話
    email = db.Column(db.String(100), nullable=True)  # 電子郵件
    website = db.Column(db.String(200), nullable=True)  # 官方網站

    # 營業時間
    opening_hours = db.Column(db.JSON, nullable=True)  # 開放時間（JSON格式）

    # 打卡設定
    checkin_radius = db.Column(db.Integer, default=100, nullable=False)  # 打卡範圍（公尺）
    checkin_merit_points = db.Column(db.Integer, default=10, nullable=False)  # 每次打卡基礎福報

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
            'images': self.images,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'opening_hours': self.opening_hours,
            'checkin_radius': self.checkin_radius,
            'checkin_merit_points': self.checkin_merit_points,
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
            'images': self.images,
            'phone': self.phone,
            'is_active': self.is_active
        }

    def __repr__(self):
        return f'<Temple {self.name}>'
