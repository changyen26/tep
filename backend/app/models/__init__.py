"""
資料庫模型初始化
"""
from app.models.user import User
from app.models.public_user import PublicUser
from app.models.temple_admin_user import TempleAdminUser
from app.models.super_admin_user import SuperAdminUser
from app.models.amulet import Amulet
from app.models.checkin import Checkin
from app.models.energy import Energy
from app.models.temple import Temple
from app.models.product import Product
from app.models.address import Address
from app.models.redemption import Redemption
from app.models.temple_announcement import TempleAnnouncement
from app.models.temple_admin import TempleAdmin
from app.models.checkin_reward import CheckinReward
from app.models.reward_claim import RewardClaim
from app.models.system_admin import SystemAdmin
from app.models.temple_application import TempleApplication
from app.models.system_settings import SystemSettings
from app.models.system_log import SystemLog
from app.models.user_report import UserReport
from app.models.notification import Notification
from app.models.notification_settings import NotificationSettings
from app.models.temple_event import TempleEvent
from app.models.event_registration import EventRegistration

__all__ = ['User', 'PublicUser', 'TempleAdminUser', 'SuperAdminUser', 'Amulet', 'Checkin', 'Energy', 'Temple', 'Product', 'Address', 'Redemption', 'TempleAnnouncement', 'TempleAdmin', 'CheckinReward', 'RewardClaim', 'SystemAdmin', 'TempleApplication', 'SystemSettings', 'SystemLog', 'UserReport', 'Notification', 'NotificationSettings', 'TempleEvent', 'EventRegistration']
