"""
獎勵領取記錄模型
"""
from app import db
from datetime import datetime

class RewardClaim(db.Model):
    __tablename__ = 'reward_claims'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reward_id = db.Column(db.Integer, db.ForeignKey('checkin_rewards.id', ondelete='CASCADE'), nullable=False)
    points_received = db.Column(db.Integer, nullable=False)
    claim_type = db.Column(db.String(20), default='manual')  # auto, manual
    related_checkin_id = db.Column(db.Integer, db.ForeignKey('checkins.id', ondelete='SET NULL'), nullable=True)
    claimed_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 關聯
    user = db.relationship('User', backref='reward_claims', lazy=True)
    related_checkin = db.relationship('Checkin', backref='reward_claims', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'reward_id': self.reward_id,
            'reward_name': self.reward.name if self.reward else None,
            'points_received': self.points_received,
            'claim_type': self.claim_type,
            'related_checkin_id': self.related_checkin_id,
            'claimed_at': self.claimed_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版本（供列表使用）"""
        return {
            'id': self.id,
            'reward_name': self.reward.name if self.reward else None,
            'points_received': self.points_received,
            'claimed_at': self.claimed_at.isoformat()
        }
