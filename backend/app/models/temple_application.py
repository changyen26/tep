"""
廟宇申請模型
"""
from app import db
from datetime import datetime

class TempleApplication(db.Model):
    __tablename__ = 'temple_applications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    temple_name = db.Column(db.String(100), nullable=False)
    temple_description = db.Column(db.Text, nullable=True)
    address = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    deity_main = db.Column(db.String(50), nullable=True)
    established_year = db.Column(db.Integer, nullable=True)

    # 申請證明文件
    certificate_images = db.Column(db.JSON, nullable=True)  # 廟宇登記證明等文件URL列表
    temple_images = db.Column(db.JSON, nullable=True)  # 廟宇照片URL列表

    # 申請人資訊
    applicant_name = db.Column(db.String(100), nullable=False)
    applicant_phone = db.Column(db.String(20), nullable=False)
    applicant_position = db.Column(db.String(50), nullable=True)  # 廟方職位

    # 審核狀態
    status = db.Column(db.String(20), nullable=False, default='pending', index=True)  # pending, approved, rejected, in_review
    review_note = db.Column(db.Text, nullable=True)  # 審核備註
    reviewed_by = db.Column(db.Integer, db.ForeignKey('system_admins.id', ondelete='SET NULL'), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)

    # 審核後關聯的廟宇ID
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id', ondelete='SET NULL'), nullable=True)

    # 時間戳記
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    applicant = db.relationship('User', backref='temple_applications', lazy=True)
    reviewer = db.relationship('SystemAdmin', backref='reviewed_applications', lazy=True)
    temple = db.relationship('Temple', backref='application', lazy=True)

    def approve(self, admin_id, temple_id, note=None):
        """批准申請"""
        self.status = 'approved'
        self.temple_id = temple_id
        self.reviewed_by = admin_id
        self.reviewed_at = datetime.utcnow()
        if note:
            self.review_note = note

    def reject(self, admin_id, note):
        """拒絕申請"""
        self.status = 'rejected'
        self.reviewed_by = admin_id
        self.reviewed_at = datetime.utcnow()
        self.review_note = note

    def set_in_review(self, admin_id):
        """設為審核中"""
        self.status = 'in_review'
        self.reviewed_by = admin_id
        self.reviewed_at = datetime.utcnow()

    def to_dict(self):
        return {
            'id': self.id,
            'applicant_id': self.applicant_id,
            'applicant_name': self.applicant_name,
            'applicant_phone': self.applicant_phone,
            'applicant_position': self.applicant_position,
            'applicant_user_name': self.applicant.name if self.applicant else None,
            'applicant_user_email': self.applicant.email if self.applicant else None,
            'temple_name': self.temple_name,
            'temple_description': self.temple_description,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'deity_main': self.deity_main,
            'established_year': self.established_year,
            'certificate_images': self.certificate_images,
            'temple_images': self.temple_images,
            'status': self.status,
            'review_note': self.review_note,
            'reviewed_by': self.reviewed_by,
            'reviewer_name': self.reviewer.name if self.reviewer else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'temple_id': self.temple_id,
            'submitted_at': self.submitted_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版本（供列表使用）"""
        return {
            'id': self.id,
            'temple_name': self.temple_name,
            'applicant_name': self.applicant_name,
            'address': self.address,
            'status': self.status,
            'submitted_at': self.submitted_at.isoformat(),
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None
        }
