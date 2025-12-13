"""
商品模型
"""
from app import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    temple_id = db.Column(db.Integer, db.ForeignKey('temples.id'), nullable=True, index=True)  # 所屬廟宇（nullable 供全站商品使用）
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False, index=True)  # charm, tshirt, sticker, etc.
    merit_points = db.Column(db.Integer, nullable=False)  # 所需功德值
    stock_quantity = db.Column(db.Integer, default=0, nullable=False)
    low_stock_threshold = db.Column(db.Integer, default=5, nullable=False)  # 庫存警告閾值
    image_url = db.Column(db.String(500), nullable=True)
    images = db.Column(db.JSON, nullable=True)  # 多張圖片陣列
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    is_featured = db.Column(db.Boolean, default=False, nullable=False)  # 是否精選商品
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    redemptions = db.relationship('Redemption', backref='product', lazy='dynamic')

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'temple_id': self.temple_id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'merit_points': self.merit_points,
            'stock_quantity': self.stock_quantity,
            'low_stock_threshold': self.low_stock_threshold,
            'image_url': self.image_url,
            'images': self.images,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def to_simple_dict(self):
        """簡化版字典（列表頁使用）"""
        return {
            'id': self.id,
            'temple_id': self.temple_id,
            'name': self.name,
            'category': self.category,
            'merit_points': self.merit_points,
            'stock_quantity': self.stock_quantity,
            'low_stock_threshold': self.low_stock_threshold,
            'image_url': self.image_url,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<Product {self.name}>'
