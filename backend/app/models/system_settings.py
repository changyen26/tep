"""
系統設定模型
"""
from app import db
from datetime import datetime

class SystemSettings(db.Model):
    __tablename__ = 'system_settings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    value = db.Column(db.Text, nullable=True)
    data_type = db.Column(db.String(20), nullable=False, default='string')  # string, integer, boolean, json
    category = db.Column(db.String(50), nullable=False, index=True)  # general, payment, notification, security
    description = db.Column(db.Text, nullable=True)
    is_public = db.Column(db.Boolean, default=False)  # 是否對外開放讀取
    updated_by = db.Column(db.Integer, db.ForeignKey('system_admins.id', ondelete='SET NULL'), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 關聯
    updater = db.relationship('SystemAdmin', backref='updated_settings', lazy=True)

    def get_value(self):
        """根據資料類型返回正確的值"""
        if self.value is None:
            return None

        if self.data_type == 'integer':
            return int(self.value)
        elif self.data_type == 'boolean':
            return self.value.lower() in ('true', '1', 'yes')
        elif self.data_type == 'json':
            import json
            return json.loads(self.value)
        else:  # string
            return self.value

    def set_value(self, value):
        """設置值（自動轉換為字串存儲）"""
        if self.data_type == 'json':
            import json
            self.value = json.dumps(value, ensure_ascii=False)
        else:
            self.value = str(value)

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.get_value(),
            'data_type': self.data_type,
            'category': self.category,
            'description': self.description,
            'is_public': self.is_public,
            'updated_by': self.updated_by,
            'updater_name': self.updater.name if self.updater else None,
            'updated_at': self.updated_at.isoformat(),
            'created_at': self.created_at.isoformat()
        }

    def to_simple_dict(self):
        """簡化版本（供列表使用）"""
        return {
            'key': self.key,
            'value': self.get_value(),
            'category': self.category,
            'description': self.description
        }

    @staticmethod
    def get_setting(key, default=None):
        """獲取設定值的快捷方法"""
        setting = SystemSettings.query.filter_by(key=key).first()
        if setting:
            return setting.get_value()
        return default

    @staticmethod
    def set_setting(key, value, admin_id=None, category='general', data_type='string', description=None):
        """設置設定值的快捷方法"""
        setting = SystemSettings.query.filter_by(key=key).first()
        if setting:
            setting.set_value(value)
            setting.updated_by = admin_id
            setting.updated_at = datetime.utcnow()
        else:
            setting = SystemSettings(
                key=key,
                category=category,
                data_type=data_type,
                description=description,
                updated_by=admin_id
            )
            setting.set_value(value)
            db.session.add(setting)
        return setting
