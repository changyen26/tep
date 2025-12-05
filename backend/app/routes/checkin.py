"""
打卡 API
"""
from flask import Blueprint, request
from app import db
from app.models.checkin import Checkin
from app.models.amulet import Amulet
from app.models.energy import Energy
from app.models.temple import Temple
from app.models.checkin_reward import CheckinReward
from app.models.reward_claim import RewardClaim
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from datetime import datetime, timedelta
from sqlalchemy import func, distinct, or_

bp = Blueprint('checkin', __name__, url_prefix='/api/checkin')

@bp.route('/', methods=['POST'])
@token_required
def create_checkin(current_user):
    """
    創建簽到記錄（每次簽到增加 10 點能量）
    POST /api/checkin/
    Header: Authorization: Bearer <token>
    Body: {
        "amulet_id": 1,
        "temple_id": 1  // 可選
    }
    """
    try:
        data = request.get_json()

        if not data or 'amulet_id' not in data:
            return error_response('缺少 amulet_id', 400)

        amulet_id = data['amulet_id']
        temple_id = data.get('temple_id')  # 可選的廟宇 ID

        # 驗證護身符是否存在且屬於當前用戶
        amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
        if not amulet:
            return error_response('護身符不存在或無權訪問', 404)

        # 如果指定了廟宇，驗證廟宇是否存在
        if temple_id:
            temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
            if not temple:
                return error_response('廟宇不存在或已停用', 404)

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
            amulet_id=amulet_id,
            temple_id=temple_id
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
        db.session.flush()  # 先 flush 讓 checkin 有 ID

        # 自動檢查並發放獎勵
        granted_rewards = _check_and_grant_rewards(current_user, checkin)

        db.session.commit()

        response_data = {
            'checkin': checkin.to_dict(),
            'amulet': amulet.to_dict(),
            'energy_added': energy_added
        }

        # 如果有獲得獎勵，加入回傳資料
        if granted_rewards:
            response_data['rewards_granted'] = granted_rewards
            response_data['new_blessing_points'] = current_user.blessing_points

        return success_response(
            response_data,
            '簽到成功' + (f'，獲得 {len(granted_rewards)} 個獎勵！' if granted_rewards else ''),
            201
        )

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

@bp.route('/history', methods=['GET'])
@token_required
def get_checkin_history(current_user):
    """
    獲取打卡歷史記錄（支援進階篩選）
    GET /api/checkin/history
    Header: Authorization: Bearer <token>
    Query Parameters:
        - start_date: 開始日期 (YYYY-MM-DD, 可選)
        - end_date: 結束日期 (YYYY-MM-DD, 可選)
        - temple_id: 廟宇 ID (可選)
        - amulet_id: 護身符 ID (可選)
        - page: 頁碼 (預設: 1)
        - per_page: 每頁數量 (預設: 20, 最大: 100)
    """
    try:
        # 獲取查詢參數
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        temple_id = request.args.get('temple_id', type=int)
        amulet_id = request.args.get('amulet_id', type=int)
        page = request.args.get('page', default=1, type=int)
        per_page = min(request.args.get('per_page', default=20, type=int), 100)

        # 構建查詢
        query = Checkin.query.filter_by(user_id=current_user.id)

        # 日期範圍篩選
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                query = query.filter(Checkin.timestamp >= start_date)
            except ValueError:
                return error_response('start_date 格式錯誤，應為 YYYY-MM-DD', 400)

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                # 結束日期包含整天（到 23:59:59）
                end_date = end_date.replace(hour=23, minute=59, second=59)
                query = query.filter(Checkin.timestamp <= end_date)
            except ValueError:
                return error_response('end_date 格式錯誤，應為 YYYY-MM-DD', 400)

        # 廟宇篩選
        if temple_id:
            query = query.filter_by(temple_id=temple_id)

        # 護身符篩選
        if amulet_id:
            # 驗證護身符屬於當前用戶
            amulet = Amulet.query.filter_by(id=amulet_id, user_id=current_user.id).first()
            if not amulet:
                return error_response('護身符不存在或無權訪問', 404)
            query = query.filter_by(amulet_id=amulet_id)

        # 分頁查詢
        pagination = query.order_by(Checkin.timestamp.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return success_response({
            'checkins': [checkin.to_dict() for checkin in pagination.items],
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

@bp.route('/stats', methods=['GET'])
@token_required
def get_checkin_stats(current_user):
    """
    獲取打卡統計總覽
    GET /api/checkin/stats
    Header: Authorization: Bearer <token>
    """
    try:
        # 1. 總打卡次數
        total_checkins = Checkin.query.filter_by(user_id=current_user.id).count()

        # 2. 參拜過的廟宇總數（去重）
        total_temples = db.session.query(
            func.count(distinct(Checkin.temple_id))
        ).filter(
            Checkin.user_id == current_user.id,
            Checkin.temple_id.isnot(None)
        ).scalar() or 0

        # 3. 累積獲得的功德值
        total_blessing_points = db.session.query(
            func.sum(Checkin.blessing_points)
        ).filter(Checkin.user_id == current_user.id).scalar() or 0

        # 4. 計算連續打卡天數
        streak_data = _calculate_streak(current_user.id)

        # 5. 最常去的前 5 座廟宇
        top_temples = db.session.query(
            Temple.id,
            Temple.name,
            func.count(Checkin.id).label('visit_count')
        ).join(
            Checkin, Checkin.temple_id == Temple.id
        ).filter(
            Checkin.user_id == current_user.id
        ).group_by(
            Temple.id, Temple.name
        ).order_by(
            func.count(Checkin.id).desc()
        ).limit(5).all()

        # 6. 本月打卡統計
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        monthly_checkins = Checkin.query.filter(
            Checkin.user_id == current_user.id,
            Checkin.timestamp >= month_start
        ).count()

        monthly_points = db.session.query(
            func.sum(Checkin.blessing_points)
        ).filter(
            Checkin.user_id == current_user.id,
            Checkin.timestamp >= month_start
        ).scalar() or 0

        return success_response({
            'total_checkins': total_checkins,
            'total_temples': total_temples,
            'total_blessing_points': int(total_blessing_points),
            'current_streak': streak_data['current_streak'],
            'longest_streak': streak_data['longest_streak'],
            'top_temples': [
                {
                    'temple_id': temple.id,
                    'temple_name': temple.name,
                    'visit_count': temple.visit_count
                }
                for temple in top_temples
            ],
            'this_month': {
                'checkins': monthly_checkins,
                'blessing_points': int(monthly_points)
            }
        }, '統計獲取成功', 200)

    except Exception as e:
        return error_response(f'統計獲取失敗: {str(e)}', 500)

@bp.route('/streak', methods=['GET'])
@token_required
def get_checkin_streak(current_user):
    """
    獲取連續打卡天數
    GET /api/checkin/streak
    Header: Authorization: Bearer <token>
    """
    try:
        streak_data = _calculate_streak(current_user.id)

        # 獲取連續打卡的日期列表（最近 30 天）
        checkin_dates = db.session.query(
            func.date(Checkin.timestamp).label('date')
        ).filter(
            Checkin.user_id == current_user.id,
            Checkin.timestamp >= datetime.utcnow() - timedelta(days=30)
        ).distinct().order_by(
            func.date(Checkin.timestamp).desc()
        ).all()

        dates_list = [date[0].isoformat() for date in checkin_dates]

        return success_response({
            'current_streak': streak_data['current_streak'],
            'longest_streak': streak_data['longest_streak'],
            'recent_checkin_dates': dates_list
        }, '連續天數獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/monthly-stats', methods=['GET'])
@token_required
def get_monthly_stats(current_user):
    """
    獲取月度打卡統計
    GET /api/checkin/monthly-stats?year=2025&month=1
    Header: Authorization: Bearer <token>
    Query Parameters:
        - year: 年份 (預設: 當前年份)
        - month: 月份 1-12 (預設: 當前月份)
    """
    try:
        now = datetime.utcnow()
        year = request.args.get('year', default=now.year, type=int)
        month = request.args.get('month', default=now.month, type=int)

        # 驗證月份有效性
        if month < 1 or month > 12:
            return error_response('月份必須在 1-12 之間', 400)

        # 計算月份起止時間
        month_start = datetime(year, month, 1, 0, 0, 0)
        if month == 12:
            month_end = datetime(year + 1, 1, 1, 0, 0, 0)
        else:
            month_end = datetime(year, month + 1, 1, 0, 0, 0)

        # 查詢該月的所有打卡記錄
        checkins = Checkin.query.filter(
            Checkin.user_id == current_user.id,
            Checkin.timestamp >= month_start,
            Checkin.timestamp < month_end
        ).all()

        # 按日期分組統計
        daily_stats = {}
        for checkin in checkins:
            date_key = checkin.timestamp.date().isoformat()
            if date_key not in daily_stats:
                daily_stats[date_key] = {
                    'date': date_key,
                    'checkin_count': 0,
                    'blessing_points': 0
                }
            daily_stats[date_key]['checkin_count'] += 1
            daily_stats[date_key]['blessing_points'] += checkin.blessing_points

        # 轉換為列表並排序
        daily_list = sorted(daily_stats.values(), key=lambda x: x['date'])

        # 月度總計
        total_checkins = len(checkins)
        total_points = sum(c.blessing_points for c in checkins)

        return success_response({
            'year': year,
            'month': month,
            'total_checkins': total_checkins,
            'total_blessing_points': total_points,
            'daily_stats': daily_list
        }, '月度統計獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

def _calculate_streak(user_id):
    """
    計算連續打卡天數
    """
    # 獲取所有打卡記錄的日期（去重）
    checkin_dates = db.session.query(
        func.date(Checkin.timestamp).label('date')
    ).filter(
        Checkin.user_id == user_id
    ).distinct().order_by(
        func.date(Checkin.timestamp).desc()
    ).all()

    if not checkin_dates:
        return {'current_streak': 0, 'longest_streak': 0}

    # 轉換為日期列表
    dates = [date[0] for date in checkin_dates]

    # 計算當前連續天數
    current_streak = 0
    today = datetime.utcnow().date()
    check_date = today

    for date in dates:
        if date == check_date or date == check_date - timedelta(days=1):
            current_streak += 1
            check_date = date - timedelta(days=1)
        else:
            break

    # 計算最長連續天數
    longest_streak = 0
    temp_streak = 1

    for i in range(len(dates) - 1):
        diff = (dates[i] - dates[i + 1]).days
        if diff == 1:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1

    longest_streak = max(longest_streak, temp_streak)

    return {
        'current_streak': current_streak,
        'longest_streak': longest_streak
    }

def _check_and_grant_rewards(user, checkin):
    """
    檢查並自動發放符合條件的獎勵

    Args:
        user: User 物件
        checkin: Checkin 物件

    Returns:
        list: 發放的獎勵列表
    """
    granted_rewards = []

    try:
        # 獲取所有啟用且有效期內的獎勵規則
        now = datetime.utcnow()
        rewards = CheckinReward.query.filter_by(is_active=True).filter(
            or_(
                CheckinReward.start_date.is_(None),
                CheckinReward.start_date <= now
            )
        ).filter(
            or_(
                CheckinReward.end_date.is_(None),
                CheckinReward.end_date >= now
            )
        ).filter(
            or_(
                CheckinReward.temple_id == checkin.temple_id,
                CheckinReward.temple_id.is_(None)  # 全站通用獎勵
            )
        ).all()

        for reward in rewards:
            # 只自動發放特定類型的獎勵
            auto_grant_types = ['first_time', 'daily_bonus', 'consecutive_days']

            if reward.reward_type not in auto_grant_types:
                continue

            # 檢查是否符合條件
            is_eligible = False

            if reward.reward_type == 'first_time':
                # 首次打卡檢查
                is_eligible = _check_first_time_eligibility(user.id, reward, checkin)

            elif reward.reward_type == 'daily_bonus':
                # 每日打卡獎勵
                is_eligible = _check_daily_bonus_eligibility(user.id, reward, checkin)

            elif reward.reward_type == 'consecutive_days':
                # 連續打卡檢查
                is_eligible = _check_consecutive_eligibility(user.id, reward, checkin)

            if is_eligible:
                # 創建領取記錄
                claim = RewardClaim(
                    user_id=user.id,
                    reward_id=reward.id,
                    points_received=reward.reward_points,
                    claim_type='auto',
                    related_checkin_id=checkin.id
                )

                # 增加使用者福德點數
                user.blessing_points += reward.reward_points

                db.session.add(claim)

                granted_rewards.append({
                    'reward_id': reward.id,
                    'reward_name': reward.name,
                    'points_received': reward.reward_points,
                    'reward_type': reward.reward_type
                })

        return granted_rewards

    except Exception as e:
        # 獎勵發放失敗不應影響打卡，記錄錯誤但繼續
        print(f'獎勵發放錯誤: {str(e)}')
        return []

def _check_first_time_eligibility(user_id, reward, current_checkin):
    """檢查首次打卡獎勵資格"""
    if not reward.temple_id:
        return False

    # 檢查是否為該廟宇的首次打卡（排除當前這次）
    previous_checkins = Checkin.query.filter(
        Checkin.user_id == user_id,
        Checkin.temple_id == reward.temple_id,
        Checkin.id != current_checkin.id
    ).count()

    if previous_checkins > 0:
        return False

    # 檢查是否已領取過
    existing_claim = RewardClaim.query.filter_by(
        user_id=user_id,
        reward_id=reward.id
    ).first()

    return existing_claim is None

def _check_daily_bonus_eligibility(user_id, reward, current_checkin):
    """檢查每日打卡獎勵資格"""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    # 檢查今天是否已領取過此獎勵
    today_claim = RewardClaim.query.filter(
        RewardClaim.user_id == user_id,
        RewardClaim.reward_id == reward.id,
        RewardClaim.claimed_at >= today_start,
        RewardClaim.claimed_at < today_end
    ).first()

    return today_claim is None

def _check_consecutive_eligibility(user_id, reward, current_checkin):
    """檢查連續打卡獎勵資格"""
    # 計算當前連續天數
    streak_data = _calculate_streak(user_id)
    current_streak = streak_data['current_streak']

    # 檢查是否達到條件
    if current_streak < reward.condition_value:
        return False

    # 如果不可重複領取，檢查是否已領取過
    if not reward.is_repeatable:
        existing_claim = RewardClaim.query.filter_by(
            user_id=user_id,
            reward_id=reward.id
        ).first()

        return existing_claim is None
    else:
        # 可重複領取，檢查是否在本輪連續打卡中已領取
        # 找到最近一次領取記錄
        last_claim = RewardClaim.query.filter_by(
            user_id=user_id,
            reward_id=reward.id
        ).order_by(RewardClaim.claimed_at.desc()).first()

        if not last_claim:
            return True

        # 計算距離上次領取的天數
        days_since_last_claim = (datetime.utcnow() - last_claim.claimed_at).days

        # 如果距離上次領取超過條件天數，可以再次領取
        return days_since_last_claim >= reward.condition_value

    return True
