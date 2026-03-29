"""
LINE 信眾資料模型
"""
from app import db
from datetime import datetime


class LineUser(db.Model):
    __tablename__ = 'line_users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    line_user_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(100), nullable=True)
    picture_url = db.Column(db.String(500), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    is_following = db.Column(db.Boolean, default=True, nullable=False)
    followed_at = db.Column(db.DateTime, default=datetime.utcnow)
    unfollowed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'lineUserId': self.line_user_id,
            'displayName': self.display_name,
            'pictureUrl': self.picture_url,
            'phone': self.phone,
            'email': self.email,
            'isFollowing': self.is_following,
            'followedAt': self.followed_at.isoformat() if self.followed_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<LineUser {self.display_name} ({self.line_user_id})>'
