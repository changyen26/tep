"""
打卡獎勵規則模型
"""
from app import db
from datetime import datetime

class CheckinReward(db.Model):
    __tablename__ = 'checkin_rewards'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id', ondelete='CASCADE'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    reward_type = db.Column(db.String(30), nullable=False)  # consecutive_days, total_count, first_time, daily_bonus
    condition_value = db.Column(db.Integer, nullable=False)  # 觸發條件值
    reward_points = db.Column(db.Integer, nullable=False, default=0)
    is_repeatable = db.Column(db.Boolean, default=False)  # 是否可重複領取
    is_active = db.Column(db.Boolean, default=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    temple = db.relationship('Temple', backref='rewards', lazy=True)
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_rewards', lazy=True)
    claims = db.relationship('RewardClaim', backref='reward', lazy=True, cascade='all, delete-orphan')

    def is_valid_now(self):
        """檢查獎勵是否在有效期內"""
        now = datetime.utcnow()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True

    def to_dict(self):
        return {
            'id': self.id,
            'temple_id': self.temple_id,
            'temple_name': self.temple.name if self.temple else '全站通用',
            'name': self.name,
            'description': self.description,
            'reward_type': self.reward_type,
            'condition_value': self.condition_value,
            'reward_points': self.reward_points,
            'is_repeatable': self.is_repeatable,
            'is_active': self.is_active,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版本（供列表使用）"""
        return {
            'id': self.id,
            'name': self.name,
            'reward_type': self.reward_type,
            'condition_value': self.condition_value,
            'reward_points': self.reward_points,
            'is_repeatable': self.is_repeatable,
            'temple_name': self.temple.name if self.temple else '全站通用'
        }
