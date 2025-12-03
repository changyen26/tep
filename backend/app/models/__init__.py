"""
資料庫模型初始化
"""
from app.models.user import User
from app.models.amulet import Amulet
from app.models.checkin import Checkin
from app.models.energy import Energy
from app.models.temple import Temple

__all__ = ['User', 'Amulet', 'Checkin', 'Energy', 'Temple']
