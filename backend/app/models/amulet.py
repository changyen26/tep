"""
平安符模型
"""
from app import db
from datetime import datetime

class Amulet(db.Model):
    __tablename__ = 'amulets'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    energy = db.Column(db.Integer, default=0, nullable=False)  # 能量值
    status = db.Column(db.String(20), default='active')  # active, inactive, expired
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # 關聯
    checkins = db.relationship('Checkin', backref='amulet', lazy='dynamic', cascade='all, delete-orphan')
    energy_logs = db.relationship('Energy', backref='amulet', lazy='dynamic', cascade='all, delete-orphan')

    def add_energy(self, amount):
        """增加能量"""
        self.energy += amount

    def reduce_energy(self, amount):
        """減少能量"""
        self.energy = max(0, self.energy - amount)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'energy': self.energy,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<Amulet {self.id} - User {self.user_id} - Energy {self.energy}>'
