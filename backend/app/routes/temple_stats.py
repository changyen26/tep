"""
廟方數據儀表板 API
"""
from flask import Blueprint, request
from app import db
from app.models.temple import Temple
from app.models.temple_admin import TempleAdmin
from app.models.checkin import Checkin
from app.models.user import User
from app.models.product import Product
from app.models.redemption import Redemption
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from sqlalchemy import func, distinct
from datetime import datetime, timedelta

bp = Blueprint('temple_stats', __name__, url_prefix='/api/temple-stats')

@bp.route('/<int:temple_id>/dashboard', methods=['GET'])
@token_required
def get_temple_dashboard(current_user, temple_id):
    """
    廟方儀表板總覽（需管理員權限）
    GET /api/temple-stats/<temple_id>/dashboard
    Header: Authorization: Bearer <token>
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限查看此廟宇的統計資料', 403)

        # 1. 總打卡次數
        total_checkins = Checkin.query.filter_by(temple_id=temple_id).count()

        # 2. 總訪客數（去重）
        total_visitors = db.session.query(
            func.count(distinct(Checkin.user_id))
        ).filter(Checkin.temple_id == temple_id).scalar() or 0

        # 3. 本週統計
        week_ago = datetime.utcnow() - timedelta(days=7)
        weekly_checkins = Checkin.query.filter(
            Checkin.temple_id == temple_id,
            Checkin.timestamp >= week_ago
        ).count()

        weekly_visitors = db.session.query(
            func.count(distinct(Checkin.user_id))
        ).filter(
            Checkin.temple_id == temple_id,
            Checkin.timestamp >= week_ago
        ).scalar() or 0

        # 4. 本月統計
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        monthly_checkins = Checkin.query.filter(
            Checkin.temple_id == temple_id,
            Checkin.timestamp >= month_start
        ).count()

        monthly_visitors = db.session.query(
            func.count(distinct(Checkin.user_id))
        ).filter(
            Checkin.temple_id == temple_id,
            Checkin.timestamp >= month_start
        ).scalar() or 0

        # 5. 今日統計
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        today_checkins = Checkin.query.filter(
            Checkin.temple_id == temple_id,
            Checkin.timestamp >= today_start
        ).count()

        today_visitors = db.session.query(
            func.count(distinct(Checkin.user_id))
        ).filter(
            Checkin.temple_id == temple_id,
            Checkin.timestamp >= today_start
        ).scalar() or 0

        return success_response({
            'temple': temple.to_simple_dict(),
            'total': {
                'checkins': total_checkins,
                'visitors': total_visitors
            },
            'today': {
                'checkins': today_checkins,
                'visitors': today_visitors
            },
            'this_week': {
                'checkins': weekly_checkins,
                'visitors': weekly_visitors
            },
            'this_month': {
                'checkins': monthly_checkins,
                'visitors': monthly_visitors
            }
        }, '儀表板資料獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/visitors', methods=['GET'])
@token_required
def get_temple_visitors_stats(current_user, temple_id):
    """
    訪客統計（需管理員權限）
    GET /api/temple-stats/<temple_id>/visitors
    Header: Authorization: Bearer <token>
    Query Parameters:
        - period: 統計期間 (week/month/year, default: month)
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限查看此廟宇的統計資料', 403)

        period = request.args.get('period', default='month')

        # 計算時間範圍
        now = datetime.utcnow()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:  # month
            start_date = now - timedelta(days=30)

        # 按日期統計訪客
        daily_stats = db.session.query(
            func.date(Checkin.timestamp).label('date'),
            func.count(Checkin.id).label('checkin_count'),
            func.count(distinct(Checkin.user_id)).label('visitor_count')
        ).filter(
            Checkin.temple_id == temple_id,
            Checkin.timestamp >= start_date
        ).group_by(
            func.date(Checkin.timestamp)
        ).order_by(
            func.date(Checkin.timestamp)
        ).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'period': period,
            'daily_stats': [
                {
                    'date': stat.date.isoformat(),
                    'checkin_count': stat.checkin_count,
                    'visitor_count': stat.visitor_count
                }
                for stat in daily_stats
            ],
            'summary': {
                'total_days': len(daily_stats),
                'total_checkins': sum(stat.checkin_count for stat in daily_stats),
                'total_visitors': db.session.query(
                    func.count(distinct(Checkin.user_id))
                ).filter(
                    Checkin.temple_id == temple_id,
                    Checkin.timestamp >= start_date
                ).scalar() or 0
            }
        }, '訪客統計獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/checkins', methods=['GET'])
@token_required
def get_temple_checkins_stats(current_user, temple_id):
    """
    打卡統計（需管理員權限）
    GET /api/temple-stats/<temple_id>/checkins
    Header: Authorization: Bearer <token>
    Query Parameters:
        - period: 統計期間 (day/week/month, default: week)
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限查看此廟宇的統計資料', 403)

        period = request.args.get('period', default='week')

        # 計算時間範圍
        now = datetime.utcnow()
        if period == 'day':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        else:  # week
            start_date = now - timedelta(days=7)

        # 按小時統計（當日）或按日統計（週/月）
        if period == 'day':
            hourly_stats = db.session.query(
                func.hour(Checkin.timestamp).label('hour'),
                func.count(Checkin.id).label('count')
            ).filter(
                Checkin.temple_id == temple_id,
                Checkin.timestamp >= start_date
            ).group_by(
                func.hour(Checkin.timestamp)
            ).order_by(
                func.hour(Checkin.timestamp)
            ).all()

            return success_response({
                'temple': temple.to_simple_dict(),
                'period': period,
                'hourly_stats': [
                    {
                        'hour': stat.hour,
                        'count': stat.count
                    }
                    for stat in hourly_stats
                ],
                'total_today': sum(stat.count for stat in hourly_stats)
            }, '打卡統計獲取成功', 200)
        else:
            daily_stats = db.session.query(
                func.date(Checkin.timestamp).label('date'),
                func.count(Checkin.id).label('count')
            ).filter(
                Checkin.temple_id == temple_id,
                Checkin.timestamp >= start_date
            ).group_by(
                func.date(Checkin.timestamp)
            ).order_by(
                func.date(Checkin.timestamp)
            ).all()

            return success_response({
                'temple': temple.to_simple_dict(),
                'period': period,
                'daily_stats': [
                    {
                        'date': stat.date.isoformat(),
                        'count': stat.count
                    }
                    for stat in daily_stats
                ],
                'total': sum(stat.count for stat in daily_stats)
            }, '打卡統計獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/top-users', methods=['GET'])
@token_required
def get_temple_top_users(current_user, temple_id):
    """
    常客排行榜（需管理員權限）
    GET /api/temple-stats/<temple_id>/top-users
    Header: Authorization: Bearer <token>
    Query Parameters:
        - limit: 返回數量 (default: 10, max: 50)
        - period: 統計期間 (all/month/year, default: all)
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限查看此廟宇的統計資料', 403)

        limit = min(request.args.get('limit', default=10, type=int), 50)
        period = request.args.get('period', default='all')

        # 構建查詢
        query = db.session.query(
            User.id,
            User.name,
            func.count(Checkin.id).label('checkin_count'),
            func.max(Checkin.timestamp).label('last_checkin')
        ).join(
            Checkin, User.id == Checkin.user_id
        ).filter(
            Checkin.temple_id == temple_id
        )

        # 時間範圍篩選
        if period == 'month':
            month_ago = datetime.utcnow() - timedelta(days=30)
            query = query.filter(Checkin.timestamp >= month_ago)
        elif period == 'year':
            year_ago = datetime.utcnow() - timedelta(days=365)
            query = query.filter(Checkin.timestamp >= year_ago)

        # 分組、排序、限制
        top_users = query.group_by(
            User.id, User.name
        ).order_by(
            func.count(Checkin.id).desc()
        ).limit(limit).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'period': period,
            'top_users': [
                {
                    'rank': idx + 1,
                    'user_id': user.id,
                    'user_name': user.name,
                    'checkin_count': user.checkin_count,
                    'last_checkin': user.last_checkin.isoformat()
                }
                for idx, user in enumerate(top_users)
            ],
            'count': len(top_users)
        }, '常客排行榜獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/recent-orders', methods=['GET'])
@token_required
def get_temple_recent_orders(current_user, temple_id):
    """
    最新訂單列表（需管理員權限）
    GET /api/temple-stats/<temple_id>/recent-orders
    Header: Authorization: Bearer <token>
    Query Parameters:
        - limit: 返回數量 (default: 5, max: 20)
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限查看此廟宇的統計資料', 403)

        limit = min(request.args.get('limit', default=5, type=int), 20)

        # 查詢最新訂單（篩選該廟宇的商品）
        recent_orders = Redemption.query.filter_by(
            temple_id=temple_id
        ).order_by(
            Redemption.redeemed_at.desc()
        ).limit(limit).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'orders': [order.to_simple_dict() for order in recent_orders],
            'count': len(recent_orders)
        }, '最新訂單獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取最新訂單失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/top-products', methods=['GET'])
@token_required
def get_temple_top_products(current_user, temple_id):
    """
    熱銷商品 TOP 3（需管理員權限）
    GET /api/temple-stats/<temple_id>/top-products
    Header: Authorization: Bearer <token>
    Query Parameters:
        - limit: 返回數量 (default: 3, max: 10)
        - period: 統計期間 (all/month/year, default: all)
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限查看此廟宇的統計資料', 403)

        limit = min(request.args.get('limit', default=3, type=int), 10)
        period = request.args.get('period', default='all')

        # 構建查詢
        query = db.session.query(
            Product.id,
            Product.name,
            Product.image_url,
            Product.merit_points,
            Product.stock_quantity,
            func.sum(Redemption.quantity).label('total_sold'),
            func.count(Redemption.id).label('order_count')
        ).join(
            Redemption, Product.id == Redemption.product_id
        ).filter(
            Product.temple_id == temple_id,
            Product.is_active == True
        )

        # 時間範圍篩選
        if period == 'month':
            month_ago = datetime.utcnow() - timedelta(days=30)
            query = query.filter(Redemption.redeemed_at >= month_ago)
        elif period == 'year':
            year_ago = datetime.utcnow() - timedelta(days=365)
            query = query.filter(Redemption.redeemed_at >= year_ago)

        # 分組、排序、限制
        top_products = query.group_by(
            Product.id, Product.name, Product.image_url,
            Product.merit_points, Product.stock_quantity
        ).order_by(
            func.sum(Redemption.quantity).desc()
        ).limit(limit).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'period': period,
            'top_products': [
                {
                    'rank': idx + 1,
                    'product_id': product.id,
                    'product_name': product.name,
                    'image_url': product.image_url,
                    'merit_points': product.merit_points,
                    'stock_quantity': product.stock_quantity,
                    'total_sold': product.total_sold,
                    'order_count': product.order_count
                }
                for idx, product in enumerate(top_products)
            ],
            'count': len(top_products)
        }, '熱銷商品獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取熱銷商品失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/low-stock-alerts', methods=['GET'])
@token_required
def get_temple_low_stock_alerts(current_user, temple_id):
    """
    庫存警告列表（需管理員權限）
    GET /api/temple-stats/<temple_id>/low-stock-alerts
    Header: Authorization: Bearer <token>
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限查看此廟宇的統計資料', 403)

        # 查詢庫存低於警告閾值的商品
        low_stock_products = Product.query.filter(
            Product.temple_id == temple_id,
            Product.is_active == True,
            Product.stock_quantity <= Product.low_stock_threshold
        ).order_by(
            Product.stock_quantity.asc()
        ).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'alerts': [
                {
                    'product_id': product.id,
                    'product_name': product.name,
                    'image_url': product.image_url,
                    'stock_quantity': product.stock_quantity,
                    'low_stock_threshold': product.low_stock_threshold,
                    'status': 'out_of_stock' if product.stock_quantity == 0 else 'low_stock'
                }
                for product in low_stock_products
            ],
            'count': len(low_stock_products),
            'out_of_stock_count': sum(1 for p in low_stock_products if p.stock_quantity == 0),
            'low_stock_count': sum(1 for p in low_stock_products if p.stock_quantity > 0)
        }, '庫存警告獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取庫存警告失敗: {str(e)}', 500)
