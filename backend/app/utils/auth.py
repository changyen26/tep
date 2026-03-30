"""
JWT/Token 處理工具 - 三表帳號系統版本（向後兼容）
"""
import jwt
import os
import uuid
from datetime import datetime, timedelta
from functools import wraps
from flask import request
from app.utils.response import error_response
from app.utils.logger import get_logger
from app import db

logger = get_logger('utils.auth')

# Token 有效期設定
ACCESS_TOKEN_HOURS = 1       # Access token 1 小時
REFRESH_TOKEN_DAYS = 7       # Refresh token 7 天


def generate_token(user_id, account_type='public'):
    """
    生成 Access Token（短期）
    """
    secret_key = os.getenv('JWT_SECRET_KEY')
    expiration_hours = int(os.getenv('JWT_EXPIRATION_HOURS', ACCESS_TOKEN_HOURS))

    payload = {
        'user_id': user_id,
        'account_type': account_type,
        'type': 'access',
        'exp': datetime.utcnow() + timedelta(hours=expiration_hours),
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token


def generate_refresh_token(user_id, account_type='public'):
    """
    生成 Refresh Token（長期），並寫入資料庫
    """
    from app.models.refresh_token import RefreshToken

    secret_key = os.getenv('JWT_SECRET_KEY')
    jti = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_DAYS)

    payload = {
        'user_id': user_id,
        'account_type': account_type,
        'type': 'refresh',
        'jti': jti,
        'exp': expires_at,
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, secret_key, algorithm='HS256')

    # 寫入資料庫
    rt = RefreshToken(
        jti=jti,
        user_id=user_id,
        account_type=account_type,
        expires_at=expires_at,
    )
    db.session.add(rt)
    db.session.commit()

    return token


def verify_refresh_token(token):
    """
    驗證 Refresh Token，回傳 (payload, error)
    """
    from app.models.refresh_token import RefreshToken

    payload, error = decode_token(token)
    if error:
        return None, error

    if payload.get('type') != 'refresh':
        return None, '非 Refresh Token'

    jti = payload.get('jti')
    if not jti:
        return None, 'Token 缺少 jti'

    rt = RefreshToken.query.filter_by(jti=jti).first()
    if not rt:
        return None, 'Refresh Token 不存在'

    if not rt.is_valid:
        return None, 'Refresh Token 已失效'

    return payload, None


def revoke_refresh_token(jti):
    """
    撤銷指定的 Refresh Token
    """
    from app.models.refresh_token import RefreshToken

    rt = RefreshToken.query.filter_by(jti=jti).first()
    if rt and not rt.is_revoked:
        rt.revoked_at = datetime.utcnow()
        db.session.commit()
        return True
    return False


def revoke_all_user_tokens(user_id, account_type):
    """
    撤銷該用戶所有 Refresh Token（強制登出所有裝置）
    """
    from app.models.refresh_token import RefreshToken

    tokens = RefreshToken.query.filter_by(
        user_id=user_id,
        account_type=account_type,
        revoked_at=None
    ).all()
    now = datetime.utcnow()
    for t in tokens:
        t.revoked_at = now
    db.session.commit()


def decode_token(token):
    """
    解碼 JWT Token
    """
    try:
        secret_key = os.getenv('JWT_SECRET_KEY')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, 'Token 已過期'
    except jwt.InvalidTokenError:
        return None, 'Token 無效'

def token_required(f):
    """
    驗證 Token 的裝飾器（三表通用版本，向後兼容）
    支援所有三種帳號類型，並向後兼容舊 User model
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # OPTIONS 請求直接放行（CORS preflight）
        if request.method == 'OPTIONS':
            return '', 204

        token = None

        # 從 Header 中獲取 Token
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return error_response('Token 格式錯誤', 401)

        if not token:
            return error_response('缺少 Token', 401)

        # 解碼 Token
        payload, error = decode_token(token)
        if error:
            return error_response(error, 401)

        # 向後兼容：支援舊 token（role）和新 token（account_type）
        account_type = payload.get('account_type') or payload.get('role', 'public')
        user_id = payload.get('user_id')

        if not user_id:
            return error_response('Token 缺少用戶 ID', 401)

        # 根據 account_type 查詢對應的用戶（向後兼容）
        current_user = None

        try:
            if account_type == 'public' or account_type == 'user':
                from app.models.public_user import PublicUser
                current_user = PublicUser.query.get(user_id)

            elif account_type == 'temple_admin':
                from app.models.temple_admin_user import TempleAdminUser
                current_user = TempleAdminUser.query.get(user_id)

            elif account_type == 'super_admin' or account_type == 'admin':
                from app.models.super_admin_user import SuperAdminUser
                current_user = SuperAdminUser.query.get(user_id)

        except Exception as e:
            logger.exception('查詢用戶失敗')
            return error_response('查詢用戶失敗', 500)

        if not current_user:
            return error_response('用戶不存在', 401)

        # 檢查帳號是否啟用
        if hasattr(current_user, 'is_active') and not current_user.is_active:
            return error_response('帳號已停用', 403)

        # 將用戶資訊和帳號類型傳遞給路由函式
        return f(current_user=current_user, account_type=account_type, *args, **kwargs)

    return decorated

def public_user_required(f):
    """
    限定一般使用者（public_users）
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204

        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return error_response('Token 格式錯誤', 401)

        if not token:
            return error_response('缺少 Token', 401)

        payload, error = decode_token(token)
        if error:
            return error_response(error, 401)

        account_type = payload.get('account_type') or payload.get('role', 'public')

        if account_type not in ['public', 'user']:
            return error_response('此功能僅限一般使用者', 403)

        from app.models.public_user import PublicUser
        current_user = PublicUser.query.get(payload['user_id'])

        if not current_user or (hasattr(current_user, 'is_active') and not current_user.is_active):
            return error_response('用戶不存在或已停用', 401)

        return f(current_user=current_user, *args, **kwargs)

    return decorated

def temple_admin_token_required(f):
    """
    限定廟方管理員（temple_admin_users）
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204

        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return error_response('Token 格式錯誤', 401)

        if not token:
            return error_response('缺少 Token', 401)

        payload, error = decode_token(token)
        if error:
            return error_response(error, 401)

        account_type = payload.get('account_type') or payload.get('role')

        if account_type != 'temple_admin':
            return error_response('此功能僅限廟方管理員', 403)

        from app.models.temple_admin_user import TempleAdminUser
        current_user = TempleAdminUser.query.get(payload['user_id'])

        if not current_user or (hasattr(current_user, 'is_active') and not current_user.is_active):
            return error_response('廟方管理員不存在或已停用', 401)

        return f(current_temple_admin=current_user, *args, **kwargs)

    return decorated

def super_admin_token_required(f):
    """
    限定系統管理員（super_admin_users）
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204

        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return error_response('Token 格式錯誤', 401)

        if not token:
            return error_response('缺少 Token', 401)

        payload, error = decode_token(token)
        if error:
            return error_response(error, 401)

        account_type = payload.get('account_type') or payload.get('role')

        if account_type not in ['super_admin', 'admin']:
            return error_response('此功能僅限系統管理員', 403)

        from app.models.super_admin_user import SuperAdminUser
        current_user = SuperAdminUser.query.get(payload['user_id'])

        if not current_user or (hasattr(current_user, 'is_active') and not current_user.is_active):
            return error_response('系統管理員不存在或已停用', 401)

        return f(current_super_admin=current_user, *args, **kwargs)

    return decorated

# ===== 保留舊版 admin_required（向後兼容，但應逐步淘汰）=====
# DEPRECATED: 以下函式預計於 v2.0 移除，新程式碼請使用三表系統的 decorator

def admin_required(f):
    """
    驗證管理員權限的裝飾器（舊版，僅供向後兼容）
    新程式碼請使用 super_admin_token_required

    .. deprecated::
        預計 v2.0 移除，請改用 super_admin_token_required
    """
    import warnings
    warnings.warn('admin_required 已棄用，請改用 super_admin_token_required', DeprecationWarning, stacklevel=2)

    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204

        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return error_response('Token 格式錯誤', 401)

        if not token:
            return error_response('缺少 Token', 401)

        payload, error = decode_token(token)
        if error:
            return error_response(error, 401)

        account_type = payload.get('account_type') or payload.get('role')

        if account_type not in ['admin', 'super_admin']:
            return error_response('需要管理員權限', 403)

        try:
            from app.models.super_admin_user import SuperAdminUser
            current_user = SuperAdminUser.query.get(payload['user_id'])
        except Exception:
            current_user = None

        if not current_user:
            from app.models.super_admin_user import SuperAdminUser
            current_user = SuperAdminUser.query.get(payload['user_id'])
            if not current_user:
                return error_response('管理員不存在', 401)

        return f(current_user=current_user, *args, **kwargs)

    return decorated

# ===== 保留舊版系統管理員相關（向後兼容 SystemAdmin 模型）=====
# DEPRECATED: 以下函式預計於 v2.0 移除

def generate_admin_token(admin_id):
    """
    生成系統管理員 JWT Token（舊版 SystemAdmin，向後兼容）
    新程式碼請使用 generate_token(admin_id, 'super_admin')
    """
    secret_key = os.getenv('JWT_SECRET_KEY')
    expiration_hours = int(os.getenv('ADMIN_JWT_EXPIRATION_HOURS', 8))

    payload = {
        'admin_id': admin_id,
        'type': 'system_admin',
        'exp': datetime.utcnow() + timedelta(hours=expiration_hours),
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token

def admin_token_required(f):
    """
    驗證系統管理員 Token 的裝飾器（舊版 SystemAdmin，向後兼容）
    新程式碼請使用 super_admin_token_required
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204

        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return error_response('Token 格式錯誤', 401)

        if not token:
            return error_response('缺少 Token', 401)

        payload, error = decode_token(token)
        if error:
            return error_response(error, 401)

        if payload.get('type') != 'system_admin':
            return error_response('需要系統管理員權限', 403)

        from app.models.system_admin import SystemAdmin
        current_admin = SystemAdmin.query.get(payload.get('admin_id'))
        if not current_admin:
            return error_response('管理員不存在', 401)

        if not current_admin.is_active:
            return error_response('管理員帳號已停用', 403)

        return f(current_admin=current_admin, *args, **kwargs)

    return decorated

def admin_permission_required(permission_name):
    """
    驗證系統管理員特定權限的裝飾器（舊版 SystemAdmin，向後兼容）
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if request.method == 'OPTIONS':
                return '', 204

            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(' ')[1]
                except IndexError:
                    return error_response('Token 格式錯誤', 401)

            if not token:
                return error_response('缺少 Token', 401)

            payload, error = decode_token(token)
            if error:
                return error_response(error, 401)

            if payload.get('type') != 'system_admin':
                return error_response('需要系統管理員權限', 403)

            from app.models.system_admin import SystemAdmin
            current_admin = SystemAdmin.query.get(payload.get('admin_id'))
            if not current_admin:
                return error_response('管理員不存在', 401)

            if not current_admin.is_active:
                return error_response('管理員帳號已停用', 403)

            if not current_admin.has_permission(permission_name):
                return error_response(f'缺少權限: {permission_name}', 403)

            return f(current_admin=current_admin, *args, **kwargs)

        return decorated
    return decorator
