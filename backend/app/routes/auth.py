"""
登入/註冊 API - 三表帳號系統版本
"""
from flask import Blueprint, request
from app import db
from app.models.public_user import PublicUser
from app.models.temple_admin_user import TempleAdminUser
from app.models.super_admin_user import SuperAdminUser
from app.utils.validator import validate_register_data, validate_login_data
from app.utils.auth import generate_token, token_required, temple_admin_token_required, super_admin_token_required
from app.utils.response import success_response, error_response
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    """
    一般使用者註冊（僅限 public_users）
    POST /api/auth/register
    Body: {
        "name": "使用者名稱",
        "email": "user@example.com",
        "password": "password123"
    }
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()

        # 驗證資料
        is_valid, errors = validate_register_data(data)
        if not is_valid:
            return error_response('資料驗證失敗', 400, errors)

        # 檢查 Email 是否已存在（檢查所有三個表）
        email = data['email'].strip().lower()
        if PublicUser.query.filter_by(email=email).first():
            return error_response('此 Email 已被註冊', 400)
        if TempleAdminUser.query.filter_by(email=email).first():
            return error_response('此 Email 已被註冊', 400)
        if SuperAdminUser.query.filter_by(email=email).first():
            return error_response('此 Email 已被註冊', 400)

        # 建立新用戶（僅限 public_users）
        new_user = PublicUser(
            name=data['name'].strip(),
            email=email
        )
        new_user.set_password(data['password'])

        # 儲存到資料庫
        db.session.add(new_user)
        db.session.commit()

        # 生成 Token
        token = generate_token(new_user.id, 'public')

        return success_response({
            'user': new_user.to_dict(),
            'token': token,
            'account_type': 'public'
        }, '註冊成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'註冊失敗: {str(e)}', 500)

@bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """
    統一登入 API - 三表帳號系統
    POST /api/auth/login
    Body: {
        "email": "user@example.com",
        "password": "password123",
        "login_type": "public" | "temple_admin" | "super_admin"  // 預設 "public"
    }
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()

        # 驗證資料
        is_valid, errors = validate_login_data(data)
        if not is_valid:
            return error_response('資料驗證失敗', 400, errors)

        email = data['email'].strip().lower()
        password = data['password']
        login_type = data.get('login_type', 'public')  # 預設為一般使用者

        # 根據 login_type 查詢對應的表
        user = None
        account_type = None

        if login_type == 'public':
            user = PublicUser.query.filter_by(email=email).first()
            account_type = 'public'
        elif login_type == 'temple_admin':
            user = TempleAdminUser.query.filter_by(email=email).first()
            account_type = 'temple_admin'
        elif login_type == 'super_admin':
            user = SuperAdminUser.query.filter_by(email=email).first()
            account_type = 'super_admin'
        else:
            return error_response('無效的 login_type', 400)

        # 驗證用戶和密碼
        if not user or not user.check_password(password):
            return error_response('Email 或密碼錯誤', 401)

        # 檢查帳號是否啟用
        if not user.is_active:
            return error_response('帳號已停用，請聯絡管理員', 403)

        # 更新最後登入時間
        user.last_login_at = datetime.utcnow()
        db.session.commit()

        # 生成 Token（包含 account_type）
        token = generate_token(user.id, account_type)

        # 回傳資料
        response_data = {
            'user': user.to_dict(),
            'token': token,
            'account_type': account_type
        }

        return success_response(response_data, '登入成功', 200)

    except Exception as e:
        return error_response(f'登入失敗: {str(e)}', 500)

@bp.route('/me', methods=['GET', 'OPTIONS'])
@token_required
def get_current_user(current_user, account_type):
    """
    獲取當前用戶資訊（需要 Token）- 三表版本
    GET /api/auth/me
    Header: Authorization: Bearer <token>
    """
    if request.method == 'OPTIONS':
        return '', 204

    return success_response({
        'user': current_user.to_dict(),
        'account_type': account_type
    }, '獲取成功', 200)


@bp.route('/change-password', methods=['PUT', 'OPTIONS'])
@token_required
def change_password(current_user, account_type):
    """
    修改密碼（需要 Token）- 三表版本
    PUT /api/auth/change-password
    Header: Authorization: Bearer <token>
    Body: {
        "old_password": "舊密碼",
        "new_password": "新密碼"
    }
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()

        # 驗證必填欄位
        if not data or 'old_password' not in data or 'new_password' not in data:
            return error_response('缺少必填欄位', 400)

        old_password = data['old_password']
        new_password = data['new_password']

        # 驗證新密碼長度
        if len(new_password) < 6:
            return error_response('新密碼至少需要 6 個字元', 400)

        # 驗證舊密碼
        if not current_user.check_password(old_password):
            return error_response('舊密碼錯誤', 400)

        # 設定新密碼
        current_user.set_password(new_password)
        db.session.commit()

        return success_response(None, '密碼修改成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'修改密碼失敗: {str(e)}', 500)
