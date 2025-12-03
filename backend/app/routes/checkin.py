"""
打卡 API
"""
from flask import Blueprint, request
from app import db
from app.models.checkin import Checkin
from app.models.amulet import Amulet
from app.models.energy import Energy
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from datetime import datetime, timedelta

bp = Blueprint('checkin', __name__, url_prefix='/api/checkin')

@bp.route('/', methods=['POST'])
@token_required
def create_checkin(current_user):
    """
    創建簽到記錄（每次簽到增加 10 點能量）
    POST /api/checkin/
    Header: Authorization: Bearer <token>
    Body: {
        "amulet_id": 1
    }
    """
    try:
        data = request.get_json()

        if not data or 'amulet_id' not in data:
            return error_response('缺少 amulet_id', 400)

        amulet_id = data['amulet_id']

        # 驗證護身符是否存在且屬於當前用戶
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        # 檢查今天是否已經簽到過
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        existing_checkin = Checkin.query.filter(
            Checkin.amulet_id == amulet_id,
            Checkin.timestamp >= today_start
        ).first()

        if existing_checkin:
            return error_response('今天已經簽到過了', 400)

        # 創建簽到記錄
        checkin = Checkin(
            user_id=current_user.id,
            amulet_id=amulet_id
        )

        # 增加能量（每次簽到 +10）
        energy_added = 10
        amulet.add_energy(energy_added)

        # 記錄能量變化
        energy_log = Energy(
            user_id=current_user.id,
            amulet_id=amulet_id,
            energy_added=energy_added
        )

        db.session.add(checkin)
        db.session.add(energy_log)
        db.session.commit()

        return success_response({
            'checkin': checkin.to_dict(),
            'amulet': amulet.to_dict(),
            'energy_added': energy_added
        }, '簽到成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'簽到失敗: {str(e)}', 500)

@bp.route('/', methods=['GET'])
@token_required
def get_user_checkins(current_user):
    """
    獲取當前用戶的簽到記錄
    GET /api/checkin/
    Header: Authorization: Bearer <token>
    Query: ?amulet_id=1&limit=10  # 可選
    """
    try:
        amulet_id = request.args.get('amulet_id', type=int)
        limit = request.args.get('limit', default=50, type=int)

        query = Checkin.query.filter_by(user_id=current_user.id)

        if amulet_id:
            query = query.filter_by(amulet_id=amulet_id)

        checkins = query.order_by(Checkin.timestamp.desc()).limit(limit).all()

        return success_response({
            'checkins': [checkin.to_dict() for checkin in checkins],
            'count': len(checkins)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/amulet/<int:amulet_id>', methods=['GET'])
@token_required
def get_amulet_checkins(current_user, amulet_id):
    """
    獲取特定護身符的簽到記錄
    GET /api/checkin/amulet/<amulet_id>
    Header: Authorization: Bearer <token>
    """
    try:
        # 驗證護身符屬於當前用戶
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        checkins = Checkin.query.filter_by(amulet_id=amulet_id).order_by(Checkin.timestamp.desc()).all()

        return success_response({
            'amulet': amulet.to_dict(),
            'checkins': [checkin.to_dict() for checkin in checkins],
            'count': len(checkins)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/today', methods=['GET'])
@token_required
def check_today_checkin(current_user):
    """
    檢查今天是否已簽到
    GET /api/checkin/today?amulet_id=1
    Header: Authorization: Bearer <token>
    """
    try:
        amulet_id = request.args.get('amulet_id', type=int)

        if not amulet_id:
            return error_response('缺少 amulet_id', 400)

        # 驗證護身符屬於當前用戶
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        # 檢查今天是否已簽到
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        checkin = Checkin.query.filter(
            Checkin.amulet_id == amulet_id,
            Checkin.timestamp >= today_start
        ).first()

        return success_response({
            'checked_in': checkin is not None,
            'checkin': checkin.to_dict() if checkin else None
        }, '查詢成功', 200)

    except Exception as e:
        return error_response(f'查詢失敗: {str(e)}', 500)
