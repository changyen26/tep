"""
打卡獎勵系統 API
"""
from flask import Blueprint, request
from app import db
from app.models.checkin_reward import CheckinReward
from app.models.reward_claim import RewardClaim
from app.models.temple import Temple
from app.models.temple_admin import TempleAdmin
from app.models.user import User
from app.models.checkin import Checkin
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_

bp = Blueprint('reward', __name__, url_prefix='/api/rewards')

@bp.route('/', methods=['POST'])
@token_required
def create_reward(current_user):
    """
    創建獎勵規則（需廟方管理員權限）
    POST /api/rewards/
    Header: Authorization: Bearer <token>
    Body: {
        "temple_id": 1,  // 可選，NULL 表示全站通用
        "name": "連續打卡7天獎勵",
        "description": "連續打卡7天可獲得額外福德點數",
        "reward_type": "consecutive_days",  // consecutive_days, total_count, first_time, daily_bonus
        "condition_value": 7,
        "reward_points": 100,
        "is_repeatable": true,
        "start_date": "2025-01-01T00:00:00",  // 可選
        "end_date": "2025-12-31T23:59:59"  // 可選
    }
    """
    try:
        data = request.get_json()

        # 驗證必要欄位
        required_fields = ['name', 'reward_type', 'condition_value', 'reward_points']
        for field in required_fields:
            if field not in data:
                return error_response(f'缺少必要欄位: {field}', 400)

        temple_id = data.get('temple_id')

        # 如果指定廟宇，檢查權限
        if temple_id:
            temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
            if not temple:
                return error_response('廟宇不存在或已停用', 404)

            # 檢查是否為該廟宇的管理員
            temple_admin = TempleAdmin.query.filter_by(
                temple_id=temple_id,
                user_id=current_user.id,
                is_active=True
            ).first()

            if not temple_admin or not temple_admin.has_permission('manage_rewards'):
                return error_response('您沒有權限管理此廟宇的獎勵', 403)
        else:
            # 全站獎勵需要系統管理員權限
            if current_user.role != 'admin':
                return error_response('只有系統管理員可以創建全站獎勵', 403)

        # 驗證獎勵類型
        valid_types = ['consecutive_days', 'total_count', 'first_time', 'daily_bonus']
        if data['reward_type'] not in valid_types:
            return error_response(f'無效的獎勵類型，必須是: {", ".join(valid_types)}', 400)

        # 驗證條件值
        if data['condition_value'] <= 0:
            return error_response('條件值必須大於 0', 400)

        # 處理日期
        start_date = None
        end_date = None

        if 'start_date' in data and data['start_date']:
            try:
                start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
            except ValueError:
                return error_response('start_date 格式錯誤', 400)

        if 'end_date' in data and data['end_date']:
            try:
                end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
            except ValueError:
                return error_response('end_date 格式錯誤', 400)

        # 創建獎勵規則
        reward = CheckinReward(
            temple_id=temple_id,
            name=data['name'],
            description=data.get('description'),
            reward_type=data['reward_type'],
            condition_value=data['condition_value'],
            reward_points=data['reward_points'],
            is_repeatable=data.get('is_repeatable', False),
            start_date=start_date,
            end_date=end_date,
            created_by=current_user.id
        )

        db.session.add(reward)
        db.session.commit()

        return success_response(
            reward.to_dict(),
            '獎勵規則創建成功',
            201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f'創建失敗: {str(e)}', 500)

@bp.route('/temple/<int:temple_id>', methods=['GET'])
def get_temple_rewards(temple_id):
    """
    獲取廟宇獎勵規則列表（公開）
    GET /api/rewards/temple/<temple_id>
    Query Parameters:
        - is_active: 是否啟用 (default: true)
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        is_active = request.args.get('is_active', default='true').lower() == 'true'

        # 查詢獎勵規則
        query = CheckinReward.query.filter_by(temple_id=temple_id)

        if is_active:
            query = query.filter_by(is_active=True)
            # 只顯示有效期內的獎勵
            now = datetime.utcnow()
            query = query.filter(
                or_(
                    CheckinReward.start_date.is_(None),
                    CheckinReward.start_date <= now
                )
            ).filter(
                or_(
                    CheckinReward.end_date.is_(None),
                    CheckinReward.end_date >= now
                )
            )

        rewards = query.order_by(CheckinReward.created_at.desc()).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'rewards': [reward.to_dict() for reward in rewards],
            'count': len(rewards)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:reward_id>', methods=['GET'])
@token_required
def get_reward_detail(current_user, reward_id):
    """
    獲取獎勵規則詳情（需廟方管理員權限）
    GET /api/rewards/<reward_id>
    Header: Authorization: Bearer <token>
    """
    try:
        reward = CheckinReward.query.get(reward_id)
        if not reward:
            return error_response('獎勵規則不存在', 404)

        # 檢查權限
        if reward.temple_id:
            # 廟宇專屬獎勵，檢查是否為該廟宇管理員
            temple_admin = TempleAdmin.query.filter_by(
                temple_id=reward.temple_id,
                user_id=current_user.id,
                is_active=True
            ).first()

            if not temple_admin:
                return error_response('您沒有權限查看此獎勵', 403)
        else:
            # 全站獎勵，需要系統管理員權限
            if current_user.role != 'admin':
                return error_response('只有系統管理員可以查看全站獎勵', 403)

        # 獲取領取統計
        claim_count = RewardClaim.query.filter_by(reward_id=reward_id).count()
        total_points_given = db.session.query(
            func.sum(RewardClaim.points_received)
        ).filter(RewardClaim.reward_id == reward_id).scalar() or 0

        reward_data = reward.to_dict()
        reward_data['statistics'] = {
            'total_claims': claim_count,
            'total_points_given': total_points_given
        }

        return success_response(reward_data, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:reward_id>', methods=['PUT'])
@token_required
def update_reward(current_user, reward_id):
    """
    更新獎勵規則（需廟方管理員權限）
    PUT /api/rewards/<reward_id>
    Header: Authorization: Bearer <token>
    Body: {
        "name": "更新後的名稱",
        "description": "更新後的描述",
        "reward_points": 150,
        "is_active": true,
        ...
    }
    """
    try:
        reward = CheckinReward.query.get(reward_id)
        if not reward:
            return error_response('獎勵規則不存在', 404)

        # 檢查權限
        if reward.temple_id:
            temple_admin = TempleAdmin.query.filter_by(
                temple_id=reward.temple_id,
                user_id=current_user.id,
                is_active=True
            ).first()

            if not temple_admin or not temple_admin.has_permission('manage_rewards'):
                return error_response('您沒有權限修改此獎勵', 403)
        else:
            if current_user.role != 'admin':
                return error_response('只有系統管理員可以修改全站獎勵', 403)

        data = request.get_json()

        # 更新欄位
        if 'name' in data:
            reward.name = data['name']
        if 'description' in data:
            reward.description = data['description']
        if 'reward_type' in data:
            valid_types = ['consecutive_days', 'total_count', 'first_time', 'daily_bonus']
            if data['reward_type'] not in valid_types:
                return error_response(f'無效的獎勵類型', 400)
            reward.reward_type = data['reward_type']
        if 'condition_value' in data:
            if data['condition_value'] <= 0:
                return error_response('條件值必須大於 0', 400)
            reward.condition_value = data['condition_value']
        if 'reward_points' in data:
            if data['reward_points'] < 0:
                return error_response('獎勵點數不能為負數', 400)
            reward.reward_points = data['reward_points']
        if 'is_repeatable' in data:
            reward.is_repeatable = data['is_repeatable']
        if 'is_active' in data:
            reward.is_active = data['is_active']

        # 更新日期
        if 'start_date' in data:
            if data['start_date']:
                try:
                    reward.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
                except ValueError:
                    return error_response('start_date 格式錯誤', 400)
            else:
                reward.start_date = None

        if 'end_date' in data:
            if data['end_date']:
                try:
                    reward.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
                except ValueError:
                    return error_response('end_date 格式錯誤', 400)
            else:
                reward.end_date = None

        reward.updated_at = datetime.utcnow()
        db.session.commit()

        return success_response(
            reward.to_dict(),
            '獎勵規則更新成功',
            200
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

@bp.route('/<int:reward_id>', methods=['DELETE'])
@token_required
def delete_reward(current_user, reward_id):
    """
    刪除獎勵規則（需廟方管理員權限，軟刪除）
    DELETE /api/rewards/<reward_id>
    Header: Authorization: Bearer <token>
    """
    try:
        reward = CheckinReward.query.get(reward_id)
        if not reward:
            return error_response('獎勵規則不存在', 404)

        # 檢查權限
        if reward.temple_id:
            temple_admin = TempleAdmin.query.filter_by(
                temple_id=reward.temple_id,
                user_id=current_user.id,
                is_active=True
            ).first()

            if not temple_admin or not temple_admin.has_permission('manage_rewards'):
                return error_response('您沒有權限刪除此獎勵', 403)
        else:
            if current_user.role != 'admin':
                return error_response('只有系統管理員可以刪除全站獎勵', 403)

        # 軟刪除
        reward.is_active = False
        reward.updated_at = datetime.utcnow()
        db.session.commit()

        return success_response(None, '獎勵規則已停用', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'刪除失敗: {str(e)}', 500)

@bp.route('/<int:reward_id>/statistics', methods=['GET'])
@token_required
def get_reward_statistics(current_user, reward_id):
    """
    獲取獎勵發放統計（需廟方管理員權限）
    GET /api/rewards/<reward_id>/statistics
    Header: Authorization: Bearer <token>
    Query Parameters:
        - days: 統計天數 (default: 30)
    """
    try:
        reward = CheckinReward.query.get(reward_id)
        if not reward:
            return error_response('獎勵規則不存在', 404)

        # 檢查權限
        if reward.temple_id:
            temple_admin = TempleAdmin.query.filter_by(
                temple_id=reward.temple_id,
                user_id=current_user.id,
                is_active=True
            ).first()

            if not temple_admin or not temple_admin.has_permission('view_stats'):
                return error_response('您沒有權限查看此獎勵的統計', 403)
        else:
            if current_user.role != 'admin':
                return error_response('只有系統管理員可以查看全站獎勵統計', 403)

        days = request.args.get('days', default=30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)

        # 總領取次數
        total_claims = RewardClaim.query.filter_by(reward_id=reward_id).count()

        # 總發放點數
        total_points = db.session.query(
            func.sum(RewardClaim.points_received)
        ).filter(RewardClaim.reward_id == reward_id).scalar() or 0

        # 期間內領取次數
        period_claims = RewardClaim.query.filter(
            RewardClaim.reward_id == reward_id,
            RewardClaim.claimed_at >= start_date
        ).count()

        # 期間內發放點數
        period_points = db.session.query(
            func.sum(RewardClaim.points_received)
        ).filter(
            RewardClaim.reward_id == reward_id,
            RewardClaim.claimed_at >= start_date
        ).scalar() or 0

        # 獨立領取人數
        unique_users = db.session.query(
            func.count(func.distinct(RewardClaim.user_id))
        ).filter(RewardClaim.reward_id == reward_id).scalar() or 0

        # 每日領取趨勢
        daily_stats = db.session.query(
            func.date(RewardClaim.claimed_at).label('date'),
            func.count(RewardClaim.id).label('claim_count'),
            func.sum(RewardClaim.points_received).label('points_given')
        ).filter(
            RewardClaim.reward_id == reward_id,
            RewardClaim.claimed_at >= start_date
        ).group_by(
            func.date(RewardClaim.claimed_at)
        ).order_by(
            func.date(RewardClaim.claimed_at)
        ).all()

        return success_response({
            'reward': reward.to_simple_dict(),
            'summary': {
                'total_claims': total_claims,
                'total_points_given': total_points,
                'unique_users': unique_users
            },
            'period_stats': {
                'days': days,
                'claims': period_claims,
                'points_given': period_points
            },
            'daily_trend': [
                {
                    'date': stat.date.isoformat(),
                    'claim_count': stat.claim_count,
                    'points_given': stat.points_given
                }
                for stat in daily_stats
            ]
        }, '統計資料獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/', methods=['GET'])
def get_all_rewards():
    """
    獲取所有啟用的獎勵規則（公開）
    GET /api/rewards/
    Query Parameters:
        - temple_id: 廟宇 ID (可選)
        - reward_type: 獎勵類型 (可選)
        - page: 頁碼 (default: 1)
        - per_page: 每頁數量 (default: 20, max: 100)
    """
    try:
        temple_id = request.args.get('temple_id', type=int)
        reward_type = request.args.get('reward_type')
        page = request.args.get('page', default=1, type=int)
        per_page = min(request.args.get('per_page', default=20, type=int), 100)

        # 構建查詢
        query = CheckinReward.query.filter_by(is_active=True)

        # 只顯示有效期內的獎勵
        now = datetime.utcnow()
        query = query.filter(
            or_(
                CheckinReward.start_date.is_(None),
                CheckinReward.start_date <= now
            )
        ).filter(
            or_(
                CheckinReward.end_date.is_(None),
                CheckinReward.end_date >= now
            )
        )

        # 篩選條件
        if temple_id:
            query = query.filter(
                or_(
                    CheckinReward.temple_id == temple_id,
                    CheckinReward.temple_id.is_(None)  # 包含全站通用獎勵
                )
            )

        if reward_type:
            query = query.filter_by(reward_type=reward_type)

        # 分頁
        pagination = query.order_by(
            CheckinReward.reward_points.desc(),
            CheckinReward.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return success_response({
            'rewards': [reward.to_dict() for reward in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/available', methods=['GET'])
@token_required
def get_available_rewards(current_user):
    """
    查看當前使用者可領取的獎勵
    GET /api/rewards/available
    Header: Authorization: Bearer <token>
    Query Parameters:
        - temple_id: 廟宇 ID (可選，篩選特定廟宇獎勵)
    """
    try:
        temple_id = request.args.get('temple_id', type=int)

        # 獲取所有啟用且有效期內的獎勵
        now = datetime.utcnow()
        query = CheckinReward.query.filter_by(is_active=True).filter(
            or_(
                CheckinReward.start_date.is_(None),
                CheckinReward.start_date <= now
            )
        ).filter(
            or_(
                CheckinReward.end_date.is_(None),
                CheckinReward.end_date >= now
            )
        )

        if temple_id:
            query = query.filter(
                or_(
                    CheckinReward.temple_id == temple_id,
                    CheckinReward.temple_id.is_(None)
                )
            )

        rewards = query.all()

        available_rewards = []

        for reward in rewards:
            # 檢查是否符合條件
            is_eligible, progress = _check_reward_eligibility(current_user.id, reward)

            if is_eligible:
                reward_data = reward.to_dict()
                reward_data['progress'] = progress
                available_rewards.append(reward_data)

        return success_response({
            'rewards': available_rewards,
            'count': len(available_rewards)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:reward_id>/claim', methods=['POST'])
@token_required
def claim_reward(current_user, reward_id):
    """
    領取獎勵
    POST /api/rewards/<reward_id>/claim
    Header: Authorization: Bearer <token>
    """
    try:
        reward = CheckinReward.query.get(reward_id)
        if not reward:
            return error_response('獎勵規則不存在', 404)

        if not reward.is_active:
            return error_response('此獎勵已停用', 400)

        # 檢查有效期
        if not reward.is_valid_now():
            return error_response('此獎勵不在有效期內', 400)

        # 檢查是否符合條件
        is_eligible, progress = _check_reward_eligibility(current_user.id, reward)

        if not is_eligible:
            return error_response(f'未達成領取條件。當前進度: {progress}', 400)

        # 檢查是否已領取（若不可重複）
        if not reward.is_repeatable:
            existing_claim = RewardClaim.query.filter_by(
                user_id=current_user.id,
                reward_id=reward_id
            ).first()

            if existing_claim:
                return error_response('您已經領取過此獎勵', 400)

        # 創建領取記錄
        claim = RewardClaim(
            user_id=current_user.id,
            reward_id=reward_id,
            points_received=reward.reward_points,
            claim_type='manual'
        )

        # 增加使用者福德點數
        current_user.blessing_points += reward.reward_points

        db.session.add(claim)
        db.session.commit()

        return success_response({
            'claim': claim.to_dict(),
            'new_blessing_points': current_user.blessing_points,
            'points_received': reward.reward_points
        }, '獎勵領取成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'領取失敗: {str(e)}', 500)

@bp.route('/my-claims', methods=['GET'])
@token_required
def get_my_claims(current_user):
    """
    獲取我的獎勵領取歷史
    GET /api/rewards/my-claims
    Header: Authorization: Bearer <token>
    Query Parameters:
        - page: 頁碼 (default: 1)
        - per_page: 每頁數量 (default: 20, max: 100)
        - reward_type: 獎勵類型篩選 (可選)
    """
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = min(request.args.get('per_page', default=20, type=int), 100)
        reward_type = request.args.get('reward_type')

        # 構建查詢
        query = RewardClaim.query.filter_by(user_id=current_user.id)

        # 根據獎勵類型篩選
        if reward_type:
            query = query.join(CheckinReward).filter(
                CheckinReward.reward_type == reward_type
            )

        # 分頁
        pagination = query.order_by(
            RewardClaim.claimed_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        # 統計資料
        total_claims = RewardClaim.query.filter_by(user_id=current_user.id).count()
        total_points = db.session.query(
            func.sum(RewardClaim.points_received)
        ).filter(RewardClaim.user_id == current_user.id).scalar() or 0

        return success_response({
            'claims': [claim.to_dict() for claim in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            },
            'summary': {
                'total_claims': total_claims,
                'total_points_received': total_points
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)


# ==================== 輔助函數 ====================

def _check_reward_eligibility(user_id, reward):
    """
    檢查使用者是否符合獎勵領取條件

    Args:
        user_id: 使用者 ID
        reward: CheckinReward 物件

    Returns:
        (is_eligible, progress): (是否符合條件, 當前進度資訊)
    """
    try:
        if reward.reward_type == 'consecutive_days':
            # 連續打卡天數檢查
            return _check_consecutive_days(user_id, reward)

        elif reward.reward_type == 'total_count':
            # 累計打卡次數檢查
            return _check_total_count(user_id, reward)

        elif reward.reward_type == 'first_time':
            # 首次打卡檢查
            return _check_first_time(user_id, reward)

        elif reward.reward_type == 'daily_bonus':
            # 每日打卡獎勵檢查
            return _check_daily_bonus(user_id, reward)

        else:
            return False, {'error': '未知的獎勵類型'}

    except Exception as e:
        return False, {'error': str(e)}

def _check_consecutive_days(user_id, reward):
    """檢查連續打卡天數"""
    from app.routes.checkin import _calculate_streak

    # 計算當前連續天數
    current_streak_data = _calculate_streak(user_id)
    current_streak = current_streak_data['current_streak']

    # 如果有指定廟宇，需檢查該廟宇的連續打卡
    if reward.temple_id:
        # 獲取該廟宇的打卡記錄
        checkins = Checkin.query.filter_by(
            user_id=user_id,
            temple_id=reward.temple_id
        ).order_by(Checkin.timestamp.desc()).all()

        if not checkins:
            return False, {'current': 0, 'required': reward.condition_value}

        # 計算該廟宇的連續天數
        streak = 1
        last_date = checkins[0].timestamp.date()

        for i in range(1, len(checkins)):
            checkin_date = checkins[i].timestamp.date()
            diff = (last_date - checkin_date).days

            if diff == 1:
                streak += 1
                last_date = checkin_date
            elif diff > 1:
                break

        is_eligible = streak >= reward.condition_value

        # 檢查是否可重複領取
        if is_eligible and not reward.is_repeatable:
            # 檢查是否已領取過
            existing = RewardClaim.query.filter_by(
                user_id=user_id,
                reward_id=reward.id
            ).first()
            if existing:
                return False, {
                    'current': streak,
                    'required': reward.condition_value,
                    'reason': '已領取過（不可重複）'
                }

        return is_eligible, {
            'current': streak,
            'required': reward.condition_value,
            'temple_name': reward.temple.name if reward.temple else None
        }
    else:
        # 全站連續打卡檢查
        is_eligible = current_streak >= reward.condition_value

        if is_eligible and not reward.is_repeatable:
            existing = RewardClaim.query.filter_by(
                user_id=user_id,
                reward_id=reward.id
            ).first()
            if existing:
                return False, {
                    'current': current_streak,
                    'required': reward.condition_value,
                    'reason': '已領取過（不可重複）'
                }

        return is_eligible, {
            'current': current_streak,
            'required': reward.condition_value
        }

def _check_total_count(user_id, reward):
    """檢查累計打卡次數"""
    # 如果有指定廟宇，統計該廟宇的打卡次數
    if reward.temple_id:
        count = Checkin.query.filter_by(
            user_id=user_id,
            temple_id=reward.temple_id
        ).count()

        temple_name = reward.temple.name if reward.temple else None
    else:
        # 全站累計打卡次數
        count = Checkin.query.filter_by(user_id=user_id).count()
        temple_name = None

    is_eligible = count >= reward.condition_value

    # 檢查是否可重複領取
    if is_eligible and not reward.is_repeatable:
        existing = RewardClaim.query.filter_by(
            user_id=user_id,
            reward_id=reward.id
        ).first()
        if existing:
            return False, {
                'current': count,
                'required': reward.condition_value,
                'temple_name': temple_name,
                'reason': '已領取過（不可重複）'
            }

    return is_eligible, {
        'current': count,
        'required': reward.condition_value,
        'temple_name': temple_name
    }

def _check_first_time(user_id, reward):
    """檢查首次打卡"""
    if not reward.temple_id:
        return False, {'error': '首次打卡獎勵必須指定廟宇'}

    # 檢查該廟宇的打卡記錄
    first_checkin = Checkin.query.filter_by(
        user_id=user_id,
        temple_id=reward.temple_id
    ).order_by(Checkin.timestamp.asc()).first()

    if not first_checkin:
        return False, {
            'reason': '尚未在此廟宇打卡',
            'temple_name': reward.temple.name if reward.temple else None
        }

    # 檢查是否已領取過
    existing = RewardClaim.query.filter_by(
        user_id=user_id,
        reward_id=reward.id
    ).first()

    if existing:
        return False, {
            'reason': '已領取過首次打卡獎勵',
            'temple_name': reward.temple.name if reward.temple else None
        }

    return True, {
        'first_checkin_date': first_checkin.timestamp.isoformat(),
        'temple_name': reward.temple.name if reward.temple else None
    }

def _check_daily_bonus(user_id, reward):
    """檢查每日打卡獎勵"""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    # 檢查今天是否已打卡
    if reward.temple_id:
        today_checkin = Checkin.query.filter(
            Checkin.user_id == user_id,
            Checkin.temple_id == reward.temple_id,
            Checkin.timestamp >= today_start,
            Checkin.timestamp < today_end
        ).first()

        temple_name = reward.temple.name if reward.temple else None
    else:
        today_checkin = Checkin.query.filter(
            Checkin.user_id == user_id,
            Checkin.timestamp >= today_start,
            Checkin.timestamp < today_end
        ).first()

        temple_name = None

    if not today_checkin:
        return False, {
            'reason': '今日尚未打卡',
            'temple_name': temple_name
        }

    # 檢查今天是否已領取過此獎勵
    today_claim = RewardClaim.query.filter(
        RewardClaim.user_id == user_id,
        RewardClaim.reward_id == reward.id,
        RewardClaim.claimed_at >= today_start,
        RewardClaim.claimed_at < today_end
    ).first()

    if today_claim:
        return False, {
            'reason': '今日已領取過此獎勵',
            'temple_name': temple_name,
            'claimed_at': today_claim.claimed_at.isoformat()
        }

    return True, {
        'today_checkin': today_checkin.timestamp.isoformat(),
        'temple_name': temple_name
    }
