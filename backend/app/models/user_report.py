"""
用戶檢舉模型
"""
from app import db
from datetime import datetime

class UserReport(db.Model):
    __tablename__ = 'user_reports'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    report_type = db.Column(db.String(30), nullable=False, index=True)  # user, temple, product, comment
    target_type = db.Column(db.String(30), nullable=False)  # user, temple, product, comment
    target_id = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(50), nullable=False)  # spam, inappropriate, fraud, violation, other
    description = db.Column(db.Text, nullable=False)
    evidence_images = db.Column(db.JSON, nullable=True)  # 證據圖片URL列表
    contact_info = db.Column(db.String(200), nullable=True)  # 聯絡資訊（選填）

    # 處理狀態
    status = db.Column(db.String(20), nullable=False, default='pending', index=True)  # pending, processing, resolved, rejected
    handler_id = db.Column(db.Integer, db.ForeignKey('system_admins.id', ondelete='SET NULL'), nullable=True)
    handler_note = db.Column(db.Text, nullable=True)  # 處理備註
    action_taken = db.Column(db.String(100), nullable=True)  # 採取的措施
    handled_at = db.Column(db.DateTime, nullable=True)

    # 時間戳記
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    reporter = db.relationship('User', backref='submitted_reports', lazy=True)
    handler = db.relationship('SystemAdmin', backref='handled_reports', lazy=True)

    def start_processing(self, admin_id):
        """開始處理檢舉"""
        self.status = 'processing'
        self.handler_id = admin_id
        self.updated_at = datetime.utcnow()

    def resolve(self, admin_id, note, action_taken=None):
        """解決檢舉"""
        self.status = 'resolved'
        self.handler_id = admin_id
        self.handler_note = note
        self.action_taken = action_taken
        self.handled_at = datetime.utcnow()

    def reject(self, admin_id, note):
        """拒絕檢舉（檢舉無效）"""
        self.status = 'rejected'
        self.handler_id = admin_id
        self.handler_note = note
        self.handled_at = datetime.utcnow()

    def to_dict(self):
        return {
            'id': self.id,
            'reporter_id': self.reporter_id,
            'reporter_name': self.reporter.name if self.reporter else None,
            'reporter_email': self.reporter.email if self.reporter else None,
            'report_type': self.report_type,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'reason': self.reason,
            'description': self.description,
            'evidence_images': self.evidence_images,
            'contact_info': self.contact_info,
            'status': self.status,
            'handler_id': self.handler_id,
            'handler_name': self.handler.name if self.handler else None,
            'handler_note': self.handler_note,
            'action_taken': self.action_taken,
            'handled_at': self.handled_at.isoformat() if self.handled_at else None,
            'reported_at': self.reported_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版本（供列表使用）"""
        return {
            'id': self.id,
            'reporter_name': self.reporter.name if self.reporter else None,
            'report_type': self.report_type,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'reason': self.reason,
            'status': self.status,
            'reported_at': self.reported_at.isoformat()
        }
