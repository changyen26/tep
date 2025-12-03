"""
打卡記錄模型
"""
from app import db
from datetime import datetime

class Checkin(db.Model):
    __tablename__ = 'checkins'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    amulet_id = db.Column(db.Integer, db.ForeignKey('amulets.id'), nullable=False, index=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=True, index=True)  # 廟宇 ID（可選）
    latitude = db.Column(db.Numeric(10, 8), nullable=True)  # 打卡緯度
    longitude = db.Column(db.Numeric(11, 8), nullable=True)  # 打卡經度
    notes = db.Column(db.Text, nullable=True)  # 打卡備註
    blessing_points = db.Column(db.Integer, default=10, nullable=False)  # 獲得的祝福點數
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amulet_id': self.amulet_id,
            'temple_id': self.temple_id,
            'temple_name': self.temple.name if self.temple else None,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'notes': self.notes,
            'blessing_points': self.blessing_points,
            'timestamp': self.timestamp.isoformat()
        }

    def __repr__(self):
        return f'<Checkin {self.id} - User {self.user_id} - Amulet {self.amulet_id}>'
