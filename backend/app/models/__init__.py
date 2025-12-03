"""
資料庫模型初始化
"""
from app.models.user import User
from app.models.amulet import Amulet
from app.models.checkin import Checkin
from app.models.energy import Energy
from app.models.temple import Temple
from app.models.product import Product
from app.models.address import Address
from app.models.redemption import Redemption

__all__ = ['User', 'Amulet', 'Checkin', 'Energy', 'Temple', 'Product', 'Address', 'Redemption']
