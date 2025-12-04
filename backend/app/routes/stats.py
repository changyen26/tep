"""
統計分析 API
"""
from flask import Blueprint, request
from app import db
from app.models.user import User
from app.models.product import Product
from app.models.redemption import Redemption
from app.models.checkin import Checkin
from app.models.energy import Energy
from app.utils.auth import token_required, admin_required
from app.utils.response import success_response, error_response
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta

bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard_stats(current_user):
    """
    管理員儀表板總覽
    GET /api/stats/dashboard
    Header: Authorization: Bearer <token> (需要管理員權限)
    """
    try:
        # 總用戶數
        total_users = User.query.count()

        # 今日新增用戶
        today = datetime.utcnow().date()
        today_start = datetime.combine(today, datetime.min.time())
        new_users_today = User.query.filter(
            User.created_at >= today_start
        ).count()

        # 總商品數
        total_products = Product.query.count()

        # 上架商品數
        active_products = Product.query.filter_by(is_active=True).count()

        # 總兌換訂單數
        total_redemptions = Redemption.query.count()

        # 待處理訂單數
        pending_redemptions = Redemption.query.filter_by(status='pending').count()

        # 總功德值消耗
        total_points_used = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            Redemption.status != 'cancelled'
        ).scalar() or 0

        # 今日兌換訂單數
        today_redemptions = Redemption.query.filter(
            Redemption.redeemed_at >= today_start
        ).count()

        # 今日功德值消耗
        today_points_used = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            and_(
                Redemption.redeemed_at >= today_start,
                Redemption.status != 'cancelled'
            )
        ).scalar() or 0

        # 庫存預警商品（庫存 < 10）
        low_stock_products = Product.query.filter(
            and_(
                Product.is_active == True,
                Product.stock_quantity < 10,
                Product.stock_quantity > 0
            )
        ).count()

        # 缺貨商品
        out_of_stock_products = Product.query.filter(
            and_(
                Product.is_active == True,
                Product.stock_quantity == 0
            )
        ).count()

        return success_response({
            'users': {
                'total': total_users,
                'new_today': new_users_today
            },
            'products': {
                'total': total_products,
                'active': active_products,
                'low_stock': low_stock_products,
                'out_of_stock': out_of_stock_products
            },
            'redemptions': {
                'total': total_redemptions,
                'pending': pending_redemptions,
                'today': today_redemptions
            },
            'points': {
                'total_used': int(total_points_used),
                'today_used': int(today_points_used)
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/products/top-selling', methods=['GET'])
@admin_required
def get_top_selling_products(current_user):
    """
    熱門商品排行
    GET /api/stats/products/top-selling
    Header: Authorization: Bearer <token> (需要管理員權限)
    Query Parameters:
        - limit: 數量限制 (default: 10)
        - days: 天數範圍 (default: 30)
    """
    try:
        limit = request.args.get('limit', default=10, type=int)
        days = request.args.get('days', default=30, type=int)

        # 計算日期範圍
        date_from = datetime.utcnow() - timedelta(days=days)

        # 查詢熱門商品（按兌換次數排序）
        top_products = db.session.query(
            Product.id,
            Product.name,
            Product.category,
            Product.merit_points,
            Product.stock_quantity,
            Product.image_url,
            func.count(Redemption.id).label('redemption_count'),
            func.sum(Redemption.quantity).label('total_quantity'),
            func.sum(Redemption.merit_points_used).label('total_points')
        ).join(
            Redemption, Product.id == Redemption.product_id
        ).filter(
            and_(
                Redemption.redeemed_at >= date_from,
                Redemption.status != 'cancelled'
            )
        ).group_by(
            Product.id
        ).order_by(
            desc('redemption_count')
        ).limit(limit).all()

        result = [{
            'id': p.id,
            'name': p.name,
            'category': p.category,
            'merit_points': p.merit_points,
            'stock_quantity': p.stock_quantity,
            'image_url': p.image_url,
            'redemption_count': p.redemption_count,
            'total_quantity': p.total_quantity,
            'total_points': int(p.total_points)
        } for p in top_products]

        return success_response({
            'products': result,
            'period_days': days
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/products/low-stock', methods=['GET'])
@admin_required
def get_low_stock_products(current_user):
    """
    庫存預警商品列表
    GET /api/stats/products/low-stock
    Header: Authorization: Bearer <token> (需要管理員權限)
    Query Parameters:
        - threshold: 庫存警戒值 (default: 10)
    """
    try:
        threshold = request.args.get('threshold', default=10, type=int)

        products = Product.query.filter(
            and_(
                Product.is_active == True,
                Product.stock_quantity <= threshold,
                Product.stock_quantity > 0
            )
        ).order_by(
            Product.stock_quantity.asc()
        ).all()

        return success_response({
            'products': [p.to_dict() for p in products],
            'threshold': threshold,
            'count': len(products)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/users/active', methods=['GET'])
@admin_required
def get_active_users_stats(current_user):
    """
    活躍用戶統計
    GET /api/stats/users/active
    Header: Authorization: Bearer <token> (需要管理員權限)
    Query Parameters:
        - days: 天數範圍 (default: 7)
    """
    try:
        days = request.args.get('days', default=7, type=int)
        date_from = datetime.utcnow() - timedelta(days=days)

        # 有兌換行為的用戶
        active_by_redemption = db.session.query(
            func.count(func.distinct(Redemption.user_id))
        ).filter(
            Redemption.redeemed_at >= date_from
        ).scalar() or 0

        # 有簽到行為的用戶
        active_by_checkin = db.session.query(
            func.count(func.distinct(Checkin.user_id))
        ).filter(
            Checkin.timestamp >= date_from
        ).scalar() or 0

        # 總用戶數
        total_users = User.query.count()

        # 新註冊用戶
        new_users = User.query.filter(
            User.created_at >= date_from
        ).count()

        return success_response({
            'period_days': days,
            'total_users': total_users,
            'new_users': new_users,
            'active_by_redemption': active_by_redemption,
            'active_by_checkin': active_by_checkin
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/users/top-spenders', methods=['GET'])
@admin_required
def get_top_spenders(current_user):
    """
    消費排行榜
    GET /api/stats/users/top-spenders
    Header: Authorization: Bearer <token> (需要管理員權限)
    Query Parameters:
        - limit: 數量限制 (default: 10)
        - days: 天數範圍 (0 表示全部，default: 0)
    """
    try:
        limit = request.args.get('limit', default=10, type=int)
        days = request.args.get('days', default=0, type=int)

        query = db.session.query(
            User.id,
            User.name,
            User.email,
            func.count(Redemption.id).label('redemption_count'),
            func.sum(Redemption.merit_points_used).label('total_points_spent')
        ).join(
            Redemption, User.id == Redemption.user_id
        ).filter(
            Redemption.status != 'cancelled'
        )

        if days > 0:
            date_from = datetime.utcnow() - timedelta(days=days)
            query = query.filter(Redemption.redeemed_at >= date_from)

        top_users = query.group_by(
            User.id
        ).order_by(
            desc('total_points_spent')
        ).limit(limit).all()

        result = [{
            'user_id': u.id,
            'name': u.name,
            'email': u.email,
            'redemption_count': u.redemption_count,
            'total_points_spent': int(u.total_points_spent)
        } for u in top_users]

        return success_response({
            'users': result,
            'period_days': days if days > 0 else 'all'
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/redemptions/trend', methods=['GET'])
@admin_required
def get_redemption_trend(current_user):
    """
    兌換趨勢統計
    GET /api/stats/redemptions/trend
    Header: Authorization: Bearer <token> (需要管理員權限)
    Query Parameters:
        - days: 天數範圍 (default: 30)
    """
    try:
        days = request.args.get('days', default=30, type=int)
        date_from = datetime.utcnow() - timedelta(days=days)

        # 按日期統計兌換數量
        daily_stats = db.session.query(
            func.date(Redemption.redeemed_at).label('date'),
            func.count(Redemption.id).label('count'),
            func.sum(Redemption.merit_points_used).label('points')
        ).filter(
            and_(
                Redemption.redeemed_at >= date_from,
                Redemption.status != 'cancelled'
            )
        ).group_by(
            func.date(Redemption.redeemed_at)
        ).order_by(
            'date'
        ).all()

        result = [{
            'date': str(s.date),
            'count': s.count,
            'points': int(s.points)
        } for s in daily_stats]

        return success_response({
            'trend': result,
            'period_days': days
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/redemptions/status-distribution', methods=['GET'])
@admin_required
def get_redemption_status_distribution(current_user):
    """
    訂單狀態分布
    GET /api/stats/redemptions/status-distribution
    Header: Authorization: Bearer <token> (需要管理員權限)
    """
    try:
        status_stats = db.session.query(
            Redemption.status,
            func.count(Redemption.id).label('count'),
            func.sum(Redemption.merit_points_used).label('total_points')
        ).group_by(
            Redemption.status
        ).all()

        result = [{
            'status': s.status,
            'count': s.count,
            'total_points': int(s.total_points)
        } for s in status_stats]

        return success_response(result, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/points/flow', methods=['GET'])
@admin_required
def get_points_flow(current_user):
    """
    功德值流向統計
    GET /api/stats/points/flow
    Header: Authorization: Bearer <token> (需要管理員權限)
    Query Parameters:
        - days: 天數範圍 (default: 30)
    """
    try:
        days = request.args.get('days', default=30, type=int)
        date_from = datetime.utcnow() - timedelta(days=days)

        # 功德值支出（兌換）
        points_spent = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            and_(
                Redemption.redeemed_at >= date_from,
                Redemption.status != 'cancelled'
            )
        ).scalar() or 0

        # 功德值收入（簽到、充能等）
        points_earned = db.session.query(
            func.sum(Energy.energy_added)
        ).filter(
            and_(
                Energy.timestamp >= date_from,
                Energy.energy_added > 0
            )
        ).scalar() or 0

        # 按日期統計
        daily_flow = db.session.query(
            func.date(Energy.timestamp).label('date'),
            func.sum(Energy.energy_added).label('earned')
        ).filter(
            and_(
                Energy.timestamp >= date_from,
                Energy.energy_added > 0
            )
        ).group_by(
            func.date(Energy.timestamp)
        ).order_by(
            'date'
        ).all()

        flow_data = [{
            'date': str(f.date),
            'earned': int(f.earned)
        } for f in daily_flow]

        return success_response({
            'summary': {
                'total_earned': int(points_earned),
                'total_spent': int(points_spent),
                'net_flow': int(points_earned - points_spent)
            },
            'daily_flow': flow_data,
            'period_days': days
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

# ===== 用戶個人統計 =====

@bp.route('/my/summary', methods=['GET'])
@token_required
def get_my_summary(current_user):
    """
    我的統計總覽
    GET /api/stats/my/summary
    Header: Authorization: Bearer <token>
    """
    try:
        # 總兌換次數
        total_redemptions = Redemption.query.filter_by(
            user_id=current_user.id
        ).count()

        # 總功德值消耗
        total_points_used = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            and_(
                Redemption.user_id == current_user.id,
                Redemption.status != 'cancelled'
            )
        ).scalar() or 0

        # 總簽到天數
        total_checkins = Checkin.query.filter_by(
            user_id=current_user.id
        ).count()

        # 連續簽到天數（簡化版，實際應該更複雜）
        consecutive_days = 0
        today = datetime.utcnow().date()
        current_date = today
        while True:
            date_start = datetime.combine(current_date, datetime.min.time())
            date_end = datetime.combine(current_date, datetime.max.time())
            checkin = Checkin.query.filter(
                and_(
                    Checkin.user_id == current_user.id,
                    Checkin.timestamp >= date_start,
                    Checkin.timestamp <= date_end
                )
            ).first()
            if checkin:
                consecutive_days += 1
                current_date -= timedelta(days=1)
            else:
                break

        return success_response({
            'blessing_points': current_user.blessing_points,
            'total_redemptions': total_redemptions,
            'total_points_used': int(total_points_used),
            'total_checkins': total_checkins,
            'consecutive_checkin_days': consecutive_days
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)
