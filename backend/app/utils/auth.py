"""
JWT/Token 處理工具
"""
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request
from app.utils.response import error_response
from app import db
from app.models.user import User

def generate_token(user_id, role='user'):
    """
    生成 JWT Token
    """
    secret_key = os.getenv('JWT_SECRET_KEY')
    expiration_hours = int(os.getenv('JWT_EXPIRATION_HOURS', 24))

    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=expiration_hours),
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token

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
    驗證 Token 的裝飾器
    """
    @wraps(f)
    def decorated(*args, **kwargs):
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

        # 查詢用戶
        current_user = User.query.get(payload['user_id'])
        if not current_user:
            return error_response('用戶不存在', 401)

        # 將用戶資訊傳遞給路由函式
        return f(current_user=current_user, *args, **kwargs)

    return decorated

def admin_required(f):
    """
    驗證管理員權限的裝飾器
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # 從 Header 中獲取 Token
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return error_response('Token 格式錯誤', 401)

        if not token:
            return error_response('缺少 Token', 401)

        # 解碼 Token
        payload, error = decode_token(token)
        if error:
            return error_response(error, 401)

        # 查詢用戶
        current_user = User.query.get(payload['user_id'])
        if not current_user:
            return error_response('用戶不存在', 401)

        # 檢查是否為管理員
        if current_user.role != 'admin':
            return error_response('需要管理員權限', 403)

        return f(current_user=current_user, *args, **kwargs)

    return decorated
