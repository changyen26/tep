"""
登入/註冊 API
"""
from flask import Blueprint, request
from app import db
from app.models.user import User
from app.utils.validator import validate_register_data, validate_login_data
from app.utils.auth import generate_token, token_required
from app.utils.response import success_response, error_response

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """
    用戶註冊
    POST /api/auth/register
    Body: {
        "name": "使用者名稱",
        "email": "user@example.com",
        "password": "password123"
    }
    """
    try:
        data = request.get_json()

        # 驗證資料
        is_valid, errors = validate_register_data(data)
        if not is_valid:
            return error_response('資料驗證失敗', 400, errors)

        # 檢查 Email 是否已存在
        email = data['email'].strip().lower()
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return error_response('此 Email 已被註冊', 400)

        # 建立新用戶
        new_user = User(
            name=data['name'].strip(),
            email=email,
            role='user'
        )
        new_user.set_password(data['password'])

        # 儲存到資料庫
        db.session.add(new_user)
        db.session.commit()

        # 生成 Token
        token = generate_token(new_user.id, new_user.role)

        return success_response({
            'user': new_user.to_dict(),
            'token': token
        }, '註冊成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'註冊失敗: {str(e)}', 500)

@bp.route('/login', methods=['POST'])
def login():
    """
    用戶登入
    POST /api/auth/login
    Body: {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    try:
        data = request.get_json()

        # 驗證資料
        is_valid, errors = validate_login_data(data)
        if not is_valid:
            return error_response('資料驗證失敗', 400, errors)

        # 查詢用戶
        email = data['email'].strip().lower()
        user = User.query.filter_by(email=email).first()

        # 驗證用戶和密碼
        if not user or not user.check_password(data['password']):
            return error_response('Email 或密碼錯誤', 401)

        # 生成 Token
        token = generate_token(user.id, user.role)

        return success_response({
            'user': user.to_dict(),
            'token': token
        }, '登入成功', 200)

    except Exception as e:
        return error_response(f'登入失敗: {str(e)}', 500)

@bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    獲取當前用戶資訊（需要 Token）
    GET /api/auth/me
    Header: Authorization: Bearer <token>
    """
    return success_response(current_user.to_dict(), '獲取成功', 200)
