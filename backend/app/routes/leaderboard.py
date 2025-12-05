"""
排行榜 API
"""
from flask import Blueprint, request
from app import db
from app.models.user import User
from app.models.checkin import Checkin
from app.models.temple import Temple
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from sqlalchemy import func, desc
from datetime import datetime, timedelta

bp = Blueprint('leaderboard', __name__, url_prefix='/api/leaderboard')

@bp.route('/blessing-points', methods=['GET'])
def get_blessing_points_leaderboard():
    """
    功德值排行榜
    GET /api/leaderboard/blessing-points
    Query Parameters:
        - limit: 返回數量 (預設: 10, 最大: 100)
        - period: 時間範圍 (all/week/month, 預設: all)
    """
    try:
        limit = min(request.args.get('limit', default=10, type=int), 100)
        period = request.args.get('period', default='all')

        # 構建查詢
        query = User.query.filter(User.is_active == True)

        # 根據時間範圍篩選（通過打卡記錄計算）
        if period == 'week':
            week_ago = datetime.utcnow() - timedelta(days=7)
            # 查詢本週功德值總和
            subquery = db.session.query(
                Checkin.user_id,
                func.sum(Checkin.blessing_points).label('period_points')
            ).filter(
                Checkin.timestamp >= week_ago
            ).group_by(Checkin.user_id).subquery()

            leaderboard = db.session.query(
                User.id,
                User.name,
                subquery.c.period_points
            ).join(
                subquery, User.id == subquery.c.user_id
            ).filter(
                User.is_active == True
            ).order_by(
                desc(subquery.c.period_points)
            ).limit(limit).all()

        elif period == 'month':
            month_ago = datetime.utcnow() - timedelta(days=30)
            # 查詢本月功德值總和
            subquery = db.session.query(
                Checkin.user_id,
                func.sum(Checkin.blessing_points).label('period_points')
            ).filter(
                Checkin.timestamp >= month_ago
            ).group_by(Checkin.user_id).subquery()

            leaderboard = db.session.query(
                User.id,
                User.name,
                subquery.c.period_points
            ).join(
                subquery, User.id == subquery.c.user_id
            ).filter(
                User.is_active == True
            ).order_by(
                desc(subquery.c.period_points)
            ).limit(limit).all()

        else:  # all
            # 使用 User 表的 blessing_points 欄位
            leaderboard = db.session.query(
                User.id,
                User.name,
                User.blessing_points
            ).filter(
                User.is_active == True
            ).order_by(
                desc(User.blessing_points)
            ).limit(limit).all()

        # 格式化結果
        result = []
        for rank, user_data in enumerate(leaderboard, start=1):
            result.append({
                'rank': rank,
                'user_id': user_data[0],
                'user_name': user_data[1],
                'blessing_points': int(user_data[2]) if user_data[2] else 0
            })

        return success_response({
            'period': period,
            'leaderboard': result,
            'count': len(result)
        }, '排行榜獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/checkins', methods=['GET'])
def get_checkins_leaderboard():
    """
    打卡次數排行榜
    GET /api/leaderboard/checkins
    Query Parameters:
        - limit: 返回數量 (預設: 10, 最大: 100)
        - period: 時間範圍 (all/week/month, 預設: all)
    """
    try:
        limit = min(request.args.get('limit', default=10, type=int), 100)
        period = request.args.get('period', default='all')

        # 根據時間範圍構建查詢
        query = db.session.query(
            User.id,
            User.name,
            func.count(Checkin.id).label('checkin_count')
        ).join(
            Checkin, User.id == Checkin.user_id
        ).filter(
            User.is_active == True
        )

        # 時間範圍篩選
        if period == 'week':
            week_ago = datetime.utcnow() - timedelta(days=7)
            query = query.filter(Checkin.timestamp >= week_ago)
        elif period == 'month':
            month_ago = datetime.utcnow() - timedelta(days=30)
            query = query.filter(Checkin.timestamp >= month_ago)

        # 分組、排序、限制
        leaderboard = query.group_by(
            User.id, User.name
        ).order_by(
            desc(func.count(Checkin.id))
        ).limit(limit).all()

        # 格式化結果
        result = []
        for rank, user_data in enumerate(leaderboard, start=1):
            result.append({
                'rank': rank,
                'user_id': user_data.id,
                'user_name': user_data.name,
                'checkin_count': user_data.checkin_count
            })

        return success_response({
            'period': period,
            'leaderboard': result,
            'count': len(result)
        }, '排行榜獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/temples', methods=['GET'])
def get_temples_leaderboard():
    """
    廟宇人氣排行榜
    GET /api/leaderboard/temples
    Query Parameters:
        - limit: 返回數量 (預設: 10, 最大: 100)
        - period: 時間範圍 (all/week/month, 預設: all)
    """
    try:
        limit = min(request.args.get('limit', default=10, type=int), 100)
        period = request.args.get('period', default='all')

        # 構建查詢
        query = db.session.query(
            Temple.id,
            Temple.name,
            Temple.main_deity,
            func.count(Checkin.id).label('visit_count'),
            func.count(func.distinct(Checkin.user_id)).label('unique_visitors')
        ).join(
            Checkin, Temple.id == Checkin.temple_id
        ).filter(
            Temple.is_active == True
        )

        # 時間範圍篩選
        if period == 'week':
            week_ago = datetime.utcnow() - timedelta(days=7)
            query = query.filter(Checkin.timestamp >= week_ago)
        elif period == 'month':
            month_ago = datetime.utcnow() - timedelta(days=30)
            query = query.filter(Checkin.timestamp >= month_ago)

        # 分組、排序、限制
        leaderboard = query.group_by(
            Temple.id, Temple.name, Temple.main_deity
        ).order_by(
            desc(func.count(Checkin.id))
        ).limit(limit).all()

        # 格式化結果
        result = []
        for rank, temple_data in enumerate(leaderboard, start=1):
            result.append({
                'rank': rank,
                'temple_id': temple_data.id,
                'temple_name': temple_data.name,
                'main_deity': temple_data.main_deity,
                'visit_count': temple_data.visit_count,
                'unique_visitors': temple_data.unique_visitors
            })

        return success_response({
            'period': period,
            'leaderboard': result,
            'count': len(result)
        }, '排行榜獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/my-rank', methods=['GET'])
@token_required
def get_my_rank(current_user):
    """
    查詢當前使用者的排名
    GET /api/leaderboard/my-rank?type=blessing_points
    Header: Authorization: Bearer <token>
    Query Parameters:
        - type: 排行榜類型 (blessing_points/checkins, 預設: blessing_points)
    """
    try:
        rank_type = request.args.get('type', default='blessing_points')

        if rank_type == 'blessing_points':
            # 計算功德值排名
            higher_rank_count = User.query.filter(
                User.blessing_points > current_user.blessing_points,
                User.is_active == True
            ).count()
            my_rank = higher_rank_count + 1
            my_value = current_user.blessing_points

        elif rank_type == 'checkins':
            # 計算打卡次數
            my_checkins = Checkin.query.filter_by(user_id=current_user.id).count()

            # 計算排名
            users_with_more_checkins = db.session.query(
                func.count(func.distinct(Checkin.user_id))
            ).group_by(
                Checkin.user_id
            ).having(
                func.count(Checkin.id) > my_checkins
            ).count()

            my_rank = users_with_more_checkins + 1
            my_value = my_checkins

        else:
            return error_response('無效的排行榜類型', 400)

        return success_response({
            'type': rank_type,
            'my_rank': my_rank,
            'my_value': my_value
        }, '排名獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)
