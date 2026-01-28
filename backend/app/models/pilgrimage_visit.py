"""
進香登記模型
"""
from app import db
from datetime import datetime

class PilgrimageVisit(db.Model):
    __tablename__ = 'pilgrimage_visits'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=False, index=True)
    public_user_id = db.Column(db.Integer, db.ForeignKey('public_users.id'), nullable=True, index=True)  # 可選：若信眾已有帳號
    group_name = db.Column(db.String(200), nullable=True)  # 團體名稱（如：XX進香團）
    contact_name = db.Column(db.String(100), nullable=False)  # 聯絡人姓名
    contact_phone = db.Column(db.String(20), nullable=False)  # 聯絡人電話
    people_count = db.Column(db.Integer, default=1, nullable=False)  # 人數
    visit_start_at = db.Column(db.DateTime, nullable=False, index=True)  # 預計來訪時間
    purpose = db.Column(db.String(500), nullable=True)  # 來訪目的
    needs = db.Column(db.Text, nullable=True)  # 特殊需求（如：需要導覽、香油錢、供品等）
    status = db.Column(db.String(20), default='pending', nullable=False, index=True)  # pending, confirmed, rejected, completed, canceled
    assigned_staff = db.Column(db.String(100), nullable=True)  # 指派負責人員
    admin_note = db.Column(db.Text, nullable=True)  # 廟方內部備註
    reply_message = db.Column(db.Text, nullable=True)  # 回覆給信眾的訊息
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    temple = db.relationship('Temple', backref='pilgrimage_visits')
    public_user = db.relationship('PublicUser', foreign_keys=[public_user_id], backref='pilgrimage_visits')

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'templeId': self.temple_id,
            'publicUserId': self.public_user_id,
            'groupName': self.group_name,
            'contactName': self.contact_name,
            'contactPhone': self.contact_phone,
            'peopleCount': self.people_count,
            'visitStartAt': self.visit_start_at.isoformat() if self.visit_start_at else None,
            'purpose': self.purpose,
            'needs': self.needs,
            'status': self.status,
            'assignedStaff': self.assigned_staff,
            'adminNote': self.admin_note,
            'replyMessage': self.reply_message,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<PilgrimageVisit {self.contact_name} - Temple {self.temple_id}>'
