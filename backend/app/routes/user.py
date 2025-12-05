"""
使用者管理 API
"""
from flask import Blueprint, request
from app import db
from app.models.user import User
from app.utils.auth import token_required
from app.utils.response import success_response, error_response

bp = Blueprint('user', __name__, url_prefix='/api/user')

@bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """
    獲取個人資料
    GET /api/user/profile
    Header: Authorization: Bearer <token>
    """
    try:
        # 獲取統計資訊
        total_amulets = current_user.amulets.count()
        total_checkins = current_user.checkins.count()
        total_redemptions = current_user.redemptions.count()

        profile = current_user.to_dict()
        profile['statistics'] = {
            'total_amulets': total_amulets,
            'total_checkins': total_checkins,
            'total_redemptions': total_redemptions
        }

        return success_response(profile, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """
    更新個人資料
    PUT /api/user/profile
    Header: Authorization: Bearer <token>
    Body: {
        "name": "新名稱"
    }
    """
    try:
        data = request.get_json()

        # 可更新的欄位
        if 'name' in data:
            if not data['name'] or len(data['name'].strip()) == 0:
                return error_response('名稱不能為空', 400)
            current_user.name = data['name'].strip()

        db.session.commit()

        return success_response(current_user.to_dict(), '更新成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

@bp.route('/password', methods=['PUT'])
@token_required
def change_password(current_user):
    """
    修改密碼
    PUT /api/user/password
    Header: Authorization: Bearer <token>
    Body: {
        "old_password": "舊密碼",
        "new_password": "新密碼"
    }
    """
    try:
        data = request.get_json()

        # 驗證必填欄位
        if not data or 'old_password' not in data or 'new_password' not in data:
            return error_response('缺少必填欄位', 400)

        old_password = data['old_password']
        new_password = data['new_password']

        # 驗證舊密碼
        if not current_user.check_password(old_password):
            return error_response('舊密碼錯誤', 401)

        # 驗證新密碼長度
        if len(new_password) < 6:
            return error_response('新密碼長度至少 6 個字元', 400)

        # 新舊密碼不能相同
        if old_password == new_password:
            return error_response('新密碼不能與舊密碼相同', 400)

        # 更新密碼
        current_user.set_password(new_password)
        db.session.commit()

        return success_response(None, '密碼修改成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'修改失敗: {str(e)}', 500)

@bp.route('/email', methods=['PUT'])
@token_required
def change_email(current_user):
    """
    修改 Email
    PUT /api/user/email
    Header: Authorization: Bearer <token>
    Body: {
        "email": "new@example.com",
        "password": "密碼驗證"
    }
    """
    try:
        data = request.get_json()

        # 驗證必填欄位
        if not data or 'email' not in data or 'password' not in data:
            return error_response('缺少必填欄位', 400)

        new_email = data['email'].strip().lower()
        password = data['password']

        # 驗證密碼
        if not current_user.check_password(password):
            return error_response('密碼錯誤', 401)

        # 驗證 Email 格式
        if '@' not in new_email or '.' not in new_email:
            return error_response('Email 格式錯誤', 400)

        # 檢查新 Email 是否已被使用
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user and existing_user.id != current_user.id:
            return error_response('該 Email 已被使用', 400)

        # 不能與當前 Email 相同
        if current_user.email == new_email:
            return error_response('新 Email 不能與當前 Email 相同', 400)

        # 更新 Email
        current_user.email = new_email
        db.session.commit()

        return success_response({'email': new_email}, 'Email 修改成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'修改失敗: {str(e)}', 500)

@bp.route('/account', methods=['DELETE'])
@token_required
def delete_account(current_user):
    """
    刪除帳號（硬刪除）
    DELETE /api/user/account
    Header: Authorization: Bearer <token>
    Body: {
        "password": "密碼驗證",
        "confirmation": "DELETE"
    }
    """
    try:
        data = request.get_json()

        # 驗證必填欄位
        if not data or 'password' not in data or 'confirmation' not in data:
            return error_response('缺少必填欄位', 400)

        password = data['password']
        confirmation = data['confirmation']

        # 驗證密碼
        if not current_user.check_password(password):
            return error_response('密碼錯誤', 401)

        # 驗證確認字串
        if confirmation != 'DELETE':
            return error_response('確認字串錯誤，請輸入 DELETE', 400)

        # 不允許刪除管理員帳號
        if current_user.role == 'admin':
            return error_response('管理員帳號無法刪除', 403)

        # 刪除用戶（級聯刪除關聯資料）
        user_email = current_user.email
        db.session.delete(current_user)
        db.session.commit()

        return success_response(
            {'deleted_email': user_email},
            '帳號已刪除',
            200
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f'刪除失敗: {str(e)}', 500)

@bp.route('/statistics', methods=['GET'])
@token_required
def get_statistics(current_user):
    """
    獲取用戶統計資訊
    GET /api/user/statistics
    Header: Authorization: Bearer <token>
    """
    try:
        from app.models.redemption import Redemption
        from sqlalchemy import func

        # 護身符統計
        total_amulets = current_user.amulets.count()
        active_amulets = current_user.amulets.filter_by(status='active').count()

        # 簽到統計
        total_checkins = current_user.checkins.count()

        # 兌換統計
        total_redemptions = current_user.redemptions.count()
        pending_redemptions = current_user.redemptions.filter_by(status='pending').count()
        completed_redemptions = current_user.redemptions.filter_by(status='completed').count()

        # 功德值統計
        total_points_used = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            Redemption.user_id == current_user.id,
            Redemption.status != 'cancelled'
        ).scalar() or 0

        statistics = {
            'amulets': {
                'total': total_amulets,
                'active': active_amulets
            },
            'checkins': {
                'total': total_checkins
            },
            'redemptions': {
                'total': total_redemptions,
                'pending': pending_redemptions,
                'completed': completed_redemptions
            },
            'blessing_points': {
                'current': current_user.blessing_points,
                'total_used': int(total_points_used)
            }
        }

        return success_response(statistics, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)
