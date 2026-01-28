"""
點燈申請模型
"""
from app import db
from datetime import datetime

class LampApplication(db.Model):
    __tablename__ = 'lamp_applications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    lamp_type_id = db.Column(db.Integer, db.ForeignKey('lamp_types.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=False, index=True)
    applicant_name = db.Column(db.String(100), nullable=False)
    applicant_phone = db.Column(db.String(20), nullable=False)
    blessing_target = db.Column(db.String(200), nullable=False)
    start_date = db.Column(db.Date, nullable=False, index=True)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False, index=True)
    payment_status = db.Column(db.String(20), default='unpaid', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    user = db.relationship('User', foreign_keys=[user_id])
    temple = db.relationship('Temple', backref='lamp_applications')

    def to_dict(self):
        return {
            'id': self.id,
            'lampTypeId': self.lamp_type_id,
            'userId': self.user_id,
            'templeId': self.temple_id,
            'applicantName': self.applicant_name,
            'applicantPhone': self.applicant_phone,
            'blessingTarget': self.blessing_target,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'paymentStatus': self.payment_status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<LampApplication {self.applicant_name}>'
