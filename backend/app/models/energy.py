"""
充能記錄模型
"""
from app import db
from datetime import datetime

class Energy(db.Model):
    __tablename__ = 'energy_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    amulet_id = db.Column(db.Integer, db.ForeignKey('amulets.id'), nullable=False, index=True)
    energy_added = db.Column(db.Integer, nullable=False)  # 增加的能量值（可為負數表示減少）
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amulet_id': self.amulet_id,
            'energy_added': self.energy_added,
            'timestamp': self.timestamp.isoformat()
        }

    def __repr__(self):
        return f'<Energy {self.id} - Amulet {self.amulet_id} - Added {self.energy_added}>'
