"""
兌換記錄模型
"""
from app import db
from datetime import datetime

class Redemption(db.Model):
    __tablename__ = 'redemptions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=True, index=True)  # 所屬廟宇（透過商品關聯）
    quantity = db.Column(db.Integer, default=1, nullable=False)
    merit_points_used = db.Column(db.Integer, nullable=False)  # 使用的功德值

    # 兌換狀態: pending, processing, shipped, completed, cancelled
    status = db.Column(db.String(20), default='pending', nullable=False, index=True)

    # 收件資訊
    recipient_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    postal_code = db.Column(db.String(10), nullable=True)
    city = db.Column(db.String(20), nullable=False)
    district = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)

    # 物流資訊
    shipping_method = db.Column(db.String(50), nullable=True)
    tracking_number = db.Column(db.String(100), nullable=True)

    # 備註
    notes = db.Column(db.Text, nullable=True)  # 使用者備註
    admin_notes = db.Column(db.Text, nullable=True)  # 管理員備註

    # 時間記錄
    redeemed_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    processed_at = db.Column(db.DateTime, nullable=True)
    shipped_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    cancelled_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product': self.product.to_simple_dict() if self.product else None,
            'temple_id': self.temple_id,
            'quantity': self.quantity,
            'merit_points_used': self.merit_points_used,
            'status': self.status,
            'recipient_name': self.recipient_name,
            'phone': self.phone,
            'postal_code': self.postal_code,
            'city': self.city,
            'district': self.district,
            'address': self.address,
            'full_address': f"{self.postal_code or ''}{self.city}{self.district}{self.address}",
            'shipping_method': self.shipping_method,
            'tracking_number': self.tracking_number,
            'notes': self.notes,
            'admin_notes': self.admin_notes,
            'redeemed_at': self.redeemed_at.isoformat(),
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'shipped_at': self.shipped_at.isoformat() if self.shipped_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None
        }

    def to_simple_dict(self):
        """簡化版字典（列表頁使用）"""
        return {
            'id': self.id,
            'temple_id': self.temple_id,
            'product_name': self.product.name if self.product else None,
            'product_image': self.product.image_url if self.product else None,
            'quantity': self.quantity,
            'merit_points_used': self.merit_points_used,
            'status': self.status,
            'redeemed_at': self.redeemed_at.isoformat()
        }

    def __repr__(self):
        return f'<Redemption {self.id} - User {self.user_id} - Product {self.product_id}>'
