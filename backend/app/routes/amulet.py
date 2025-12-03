"""
平安符 API
"""
from flask import Blueprint, request
from app import db
from app.models.amulet import Amulet
from app.utils.auth import token_required
from app.utils.response import success_response, error_response

bp = Blueprint('amulet', __name__, url_prefix='/api/amulet')

@bp.route('/', methods=['POST'])
@token_required
def create_amulet(current_user):
    """
    創建新的護身符
    POST /api/amulet/
    Header: Authorization: Bearer <token>
    Body: {
        "energy": 0  # 可選，預設為 0
    }
    """
    try:
        data = request.get_json() or {}
        initial_energy = data.get('energy', 0)

        # 驗證能量值
        if not isinstance(initial_energy, int) or initial_energy < 0:
            return error_response('能量值必須為非負整數', 400)

        # 創建護身符
        amulet = Amulet(
            user_id=current_user.id,
            energy=initial_energy,
            status='active'
        )

        db.session.add(amulet)
        db.session.commit()

        return success_response(amulet.to_dict(), '護身符創建成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'創建失敗: {str(e)}', 500)

@bp.route('/', methods=['GET'])
@token_required
def get_user_amulets(current_user):
    """
    獲取當前用戶的所有護身符
    GET /api/amulet/
    Header: Authorization: Bearer <token>
    Query: ?status=active  # 可選，篩選狀態
    """
    try:
        status = request.args.get('status')

        query = Amulet.query.filter_by(user_id=current_user.id)

        if status:
            query = query.filter_by(status=status)

        amulets = query.order_by(Amulet.created_at.desc()).all()

        return success_response({
            'amulets': [amulet.to_dict() for amulet in amulets],
            'count': len(amulets)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:amulet_id>', methods=['GET'])
@token_required
def get_amulet(current_user, amulet_id):
    """
    獲取單個護身符詳情
    GET /api/amulet/<amulet_id>
    Header: Authorization: Bearer <token>
    """
    try:
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()

        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        return success_response(amulet.to_dict(), '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:amulet_id>', methods=['PATCH'])
@token_required
def update_amulet(current_user, amulet_id):
    """
    更新護身符狀態
    PATCH /api/amulet/<amulet_id>
    Header: Authorization: Bearer <token>
    Body: {
        "status": "inactive"  # active, inactive, expired
    }
    """
    try:
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()

        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        data = request.get_json()

        if 'status' in data:
            valid_statuses = ['active', 'inactive', 'expired']
            if data['status'] not in valid_statuses:
                return error_response(f'狀態必須是 {", ".join(valid_statuses)} 之一', 400)
            amulet.status = data['status']

        db.session.commit()

        return success_response(amulet.to_dict(), '更新成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

@bp.route('/<int:amulet_id>', methods=['DELETE'])
@token_required
def delete_amulet(current_user, amulet_id):
    """
    刪除護身符
    DELETE /api/amulet/<amulet_id>
    Header: Authorization: Bearer <token>
    """
    try:
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()

        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        db.session.delete(amulet)
        db.session.commit()

        return success_response(None, '刪除成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'刪除失敗: {str(e)}', 500)
