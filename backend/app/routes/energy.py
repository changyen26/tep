"""
充能 API
"""
from flask import Blueprint, request
from app import db
from app.models.energy import Energy
from app.models.amulet import Amulet
from app.utils.auth import token_required
from app.utils.response import success_response, error_response

bp = Blueprint('energy', __name__, url_prefix='/api/energy')

@bp.route('/add', methods=['POST'])
@token_required
def add_energy(current_user):
    """
    手動增加能量
    POST /api/energy/add
    Header: Authorization: Bearer <token>
    Body: {
        "amulet_id": 1,
        "amount": 50
    }
    """
    try:
        data = request.get_json()

        if not data or 'amulet_id' not in data or 'amount' not in data:
            return error_response('缺少必要參數', 400)

        amulet_id = data['amulet_id']
        amount = data['amount']

        # 驗證能量值
        if not isinstance(amount, int) or amount <= 0:
            return error_response('能量值必須為正整數', 400)

        # 驗證護身符
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        # 增加能量
        amulet.add_energy(amount)

        # 記錄能量變化
        energy_log = Energy(
            user_id=current_user.id,
            amulet_id=amulet_id,
            energy_added=amount
        )

        db.session.add(energy_log)
        db.session.commit()

        return success_response({
            'amulet': amulet.to_dict(),
            'energy_log': energy_log.to_dict()
        }, '充能成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'充能失敗: {str(e)}', 500)

@bp.route('/consume', methods=['POST'])
@token_required
def consume_energy(current_user):
    """
    消耗能量
    POST /api/energy/consume
    Header: Authorization: Bearer <token>
    Body: {
        "amulet_id": 1,
        "amount": 20
    }
    """
    try:
        data = request.get_json()

        if not data or 'amulet_id' not in data or 'amount' not in data:
            return error_response('缺少必要參數', 400)

        amulet_id = data['amulet_id']
        amount = data['amount']

        # 驗證能量值
        if not isinstance(amount, int) or amount <= 0:
            return error_response('能量值必須為正整數', 400)

        # 驗證護身符
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        # 檢查能量是否足夠
        if amulet.energy < amount:
            return error_response(f'能量不足，當前能量: {amulet.energy}', 400)

        # 減少能量
        amulet.reduce_energy(amount)

        # 記錄能量變化（負數表示消耗）
        energy_log = Energy(
            user_id=current_user.id,
            amulet_id=amulet_id,
            energy_added=-amount
        )

        db.session.add(energy_log)
        db.session.commit()

        return success_response({
            'amulet': amulet.to_dict(),
            'energy_log': energy_log.to_dict()
        }, '能量消耗成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'能量消耗失敗: {str(e)}', 500)

@bp.route('/logs', methods=['GET'])
@token_required
def get_energy_logs(current_user):
    """
    獲取能量記錄
    GET /api/energy/logs
    Header: Authorization: Bearer <token>
    Query: ?amulet_id=1&limit=50  # 可選
    """
    try:
        amulet_id = request.args.get('amulet_id', type=int)
        limit = request.args.get('limit', default=100, type=int)

        query = Energy.query.filter_by(user_id=current_user.id)

        if amulet_id:
            # 驗證護身符屬於當前用戶
            amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
            if not amulet:
                return error_response('護身符不存在或無權訪問', 404)
            query = query.filter_by(amulet_id=amulet_id)

        logs = query.order_by(Energy.timestamp.desc()).limit(limit).all()

        return success_response({
            'logs': [log.to_dict() for log in logs],
            'count': len(logs)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/amulet/<int:amulet_id>', methods=['GET'])
@token_required
def get_amulet_energy_logs(current_user, amulet_id):
    """
    獲取特定護身符的能量記錄
    GET /api/energy/amulet/<amulet_id>
    Header: Authorization: Bearer <token>
    """
    try:
        # 驗證護身符屬於當前用戶
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        logs = Energy.query.filter_by(amulet_id=amulet_id).order_by(Energy.timestamp.desc()).all()

        # 計算總充能和總消耗
        total_added = sum(log.energy_added for log in logs if log.energy_added > 0)
        total_consumed = abs(sum(log.energy_added for log in logs if log.energy_added < 0))

        return success_response({
            'amulet': amulet.to_dict(),
            'logs': [log.to_dict() for log in logs],
            'count': len(logs),
            'statistics': {
                'total_added': total_added,
                'total_consumed': total_consumed,
                'current_energy': amulet.energy
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)
