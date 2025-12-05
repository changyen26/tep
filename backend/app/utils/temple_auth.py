"""
廟方管理員權限檢查裝飾器
"""
from functools import wraps
from flask import request
from app.models.temple_admin import TempleAdmin
from app.utils.response import error_response

def temple_admin_required(permission=None):
    """
    檢查使用者是否為特定廟宇的管理員

    Args:
        permission: 需要的權限名稱（可選）
                   如：'manage_announcements', 'manage_products' 等

    使用方式:
        @temple_admin_required()
        def some_function(current_user, temple_id):
            pass

        @temple_admin_required('manage_announcements')
        def create_announcement(current_user, temple_id):
            pass
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, temple_id, *args, **kwargs):
            # 查詢使用者在該廟宇的管理員記錄
            temple_admin = TempleAdmin.query.filter_by(
                temple_id=temple_id,
                user_id=current_user.id,
                is_active=True
            ).first()

            if not temple_admin:
                return error_response('您不是該廟宇的管理員', 403)

            # 如果指定了特定權限，檢查是否擁有該權限
            if permission and not temple_admin.has_permission(permission):
                return error_response(f'您沒有 {permission} 權限', 403)

            # 將 temple_admin 物件傳遞給路由函數
            return f(current_user, temple_id, temple_admin, *args, **kwargs)

        return decorated_function
    return decorator

def temple_owner_required(f):
    """
    檢查使用者是否為廟宇的擁有者（owner）
    只有 owner 才能管理其他管理員
    """
    @wraps(f)
    def decorated_function(current_user, temple_id, *args, **kwargs):
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True,
            role='owner'
        ).first()

        if not temple_admin:
            return error_response('只有廟宇擁有者才能執行此操作', 403)

        return f(current_user, temple_id, temple_admin, *args, **kwargs)

    return decorated_function
