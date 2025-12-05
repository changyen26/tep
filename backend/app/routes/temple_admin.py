"""
廟方管理員 API
"""
from flask import Blueprint, request
from app import db
from app.models.temple_admin import TempleAdmin
from app.models.temple import Temple
from app.models.user import User
from app.utils.auth import token_required
from app.utils.response import success_response, error_response

bp = Blueprint('temple_admin', __name__, url_prefix='/api/temple-admins')

@bp.route('/', methods=['POST'])
@token_required
def add_temple_admin(current_user):
    """
    綁定廟方管理員（需擁有者權限）
    POST /api/temple-admins/
    Header: Authorization: Bearer <token>
    Body: {
        "temple_id": 1,
        "user_id": 2,
        "role": "manager",
        "permissions": {
            "manage_info": true,
            "view_stats": true,
            "manage_products": true,
            "manage_announcements": true,
            "manage_rewards": true,
            "manage_admins": false
        }
    }
    """
    try:
        data = request.get_json()

        # 驗證必要欄位
        required_fields = ['temple_id', 'user_id', 'role']
        for field in required_fields:
            if field not in data:
                return error_response(f'缺少必要欄位: {field}', 400)

        temple_id = data['temple_id']
        new_user_id = data['user_id']
        role = data['role']

        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 驗證要新增的使用者存在
        new_user = User.query.filter_by(id=new_user_id, is_active=True).first()
        if not new_user:
            return error_response('使用者不存在或已停用', 404)

        # 檢查當前使用者是否為該廟宇的擁有者
        current_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True,
            role='owner'
        ).first()

        if not current_admin:
            return error_response('只有廟宇擁有者才能新增管理員', 403)

        # 驗證角色
        valid_roles = ['owner', 'manager', 'staff']
        if role not in valid_roles:
            return error_response(f'無效的角色，必須是: {", ".join(valid_roles)}', 400)

        # 檢查是否已存在
        existing = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=new_user_id
        ).first()

        if existing:
            if existing.is_active:
                return error_response('該使用者已是此廟宇的管理員', 400)
            else:
                # 重新啟用
                existing.is_active = True
                existing.role = role
                existing.permissions = data.get('permissions')
                db.session.commit()
                return success_response(
                    existing.to_dict(),
                    '管理員已重新啟用',
                    200
                )

        # 創建新管理員
        temple_admin = TempleAdmin(
            temple_id=temple_id,
            user_id=new_user_id,
            role=role,
            permissions=data.get('permissions'),
            created_by=current_user.id
        )

        db.session.add(temple_admin)
        db.session.commit()

        return success_response(
            temple_admin.to_dict(),
            '管理員新增成功',
            201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f'新增失敗: {str(e)}', 500)

@bp.route('/temple/<int:temple_id>', methods=['GET'])
@token_required
def get_temple_admins(current_user, temple_id):
    """
    獲取廟宇管理員列表（需管理員權限）
    GET /api/temple-admins/temple/<temple_id>
    Header: Authorization: Bearer <token>
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限（只有該廟宇的管理員才能查看）
        current_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not current_admin:
            return error_response('您不是該廟宇的管理員', 403)

        # 獲取所有管理員
        admins = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            is_active=True
        ).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'admins': [admin.to_dict() for admin in admins],
            'count': len(admins)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:admin_id>', methods=['PUT'])
@token_required
def update_temple_admin(current_user, admin_id):
    """
    更新管理員權限（需擁有者權限）
    PUT /api/temple-admins/<admin_id>
    Header: Authorization: Bearer <token>
    Body: {
        "role": "manager",
        "permissions": {...}
    }
    """
    try:
        temple_admin = TempleAdmin.query.get(admin_id)
        if not temple_admin:
            return error_response('管理員記錄不存在', 404)

        # 檢查當前使用者是否為擁有者
        current_admin = TempleAdmin.query.filter_by(
            temple_id=temple_admin.temple_id,
            user_id=current_user.id,
            is_active=True,
            role='owner'
        ).first()

        if not current_admin:
            return error_response('只有廟宇擁有者才能修改管理員', 403)

        data = request.get_json()

        # 更新角色
        if 'role' in data:
            valid_roles = ['owner', 'manager', 'staff']
            if data['role'] not in valid_roles:
                return error_response(f'無效的角色', 400)
            temple_admin.role = data['role']

        # 更新權限
        if 'permissions' in data:
            temple_admin.permissions = data['permissions']

        db.session.commit()

        return success_response(
            temple_admin.to_dict(),
            '管理員更新成功',
            200
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

@bp.route('/<int:admin_id>', methods=['DELETE'])
@token_required
def remove_temple_admin(current_user, admin_id):
    """
    移除管理員（需擁有者權限）
    DELETE /api/temple-admins/<admin_id>
    Header: Authorization: Bearer <token>
    """
    try:
        temple_admin = TempleAdmin.query.get(admin_id)
        if not temple_admin:
            return error_response('管理員記錄不存在', 404)

        # 檢查當前使用者是否為擁有者
        current_admin = TempleAdmin.query.filter_by(
            temple_id=temple_admin.temple_id,
            user_id=current_user.id,
            is_active=True,
            role='owner'
        ).first()

        if not current_admin:
            return error_response('只有廟宇擁有者才能移除管理員', 403)

        # 不允許移除自己
        if temple_admin.user_id == current_user.id:
            return error_response('不能移除自己的管理員身份', 400)

        # 軟刪除（設為不啟用）
        temple_admin.is_active = False
        db.session.commit()

        return success_response(None, '管理員已移除', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'移除失敗: {str(e)}', 500)

@bp.route('/my-temples', methods=['GET'])
@token_required
def get_my_managed_temples(current_user):
    """
    獲取我管理的廟宇列表
    GET /api/temple-admins/my-temples
    Header: Authorization: Bearer <token>
    """
    try:
        # 查詢當前使用者管理的所有廟宇
        my_admins = TempleAdmin.query.filter_by(
            user_id=current_user.id,
            is_active=True
        ).all()

        temples_data = []
        for admin in my_admins:
            if admin.temple and admin.temple.is_active:
                temple_info = admin.temple.to_dict()
                temple_info['my_role'] = admin.role
                temple_info['my_permissions'] = admin.permissions or admin.get_default_permissions(admin.role)
                temples_data.append(temple_info)

        return success_response({
            'temples': temples_data,
            'count': len(temples_data)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)
