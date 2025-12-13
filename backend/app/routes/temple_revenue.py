"""
廟方收入報表 API
"""
from flask import Blueprint, request
from app import db
from app.models.temple import Temple
from app.models.temple_admin import TempleAdmin
from app.models.product import Product
from app.models.redemption import Redemption
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from sqlalchemy import func
from datetime import datetime, timedelta

bp = Blueprint('temple_revenue', __name__, url_prefix='/api/temple-revenue')

@bp.route('/<int:temple_id>/revenue', methods=['GET'])
@token_required
def get_temple_revenue(current_user, temple_id):
    """
    廟方收入統計（需管理員權限）
    GET /api/temple-revenue/<temple_id>/revenue
    Header: Authorization: Bearer <token>
    Query Parameters:
        - start_date: 開始日期 (YYYY-MM-DD, optional)
        - end_date: 結束日期 (YYYY-MM-DD, optional)
        - group_by: 分組方式 (day/week/month, default: day)
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

        # 解析時間範圍
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        group_by = request.args.get('group_by', default='day')

        # 預設時間範圍為最近30天
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        else:
            end_date = datetime.utcnow()

        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        else:
            start_date = end_date - timedelta(days=30)

        # 基礎查詢：該廟宇的所有訂單
        base_query = Redemption.query.filter(
            Redemption.temple_id == temple_id,
            Redemption.redeemed_at >= start_date,
            Redemption.redeemed_at <= end_date,
            Redemption.status.in_(['processing', 'shipped', 'completed'])  # 排除 pending 和 cancelled
        )

        # 總收入統計（功德值）
        total_revenue = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            Redemption.temple_id == temple_id,
            Redemption.redeemed_at >= start_date,
            Redemption.redeemed_at <= end_date,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
        ).scalar() or 0

        # 訂單總數
        total_orders = base_query.count()

        # 按時間分組統計收入趨勢
        if group_by == 'day':
            # 按日統計
            trend_data = db.session.query(
                func.date(Redemption.redeemed_at).label('period'),
                func.sum(Redemption.merit_points_used).label('revenue'),
                func.count(Redemption.id).label('order_count')
            ).filter(
                Redemption.temple_id == temple_id,
                Redemption.redeemed_at >= start_date,
                Redemption.redeemed_at <= end_date,
                Redemption.status.in_(['processing', 'shipped', 'completed'])
            ).group_by(
                func.date(Redemption.redeemed_at)
            ).order_by(
                func.date(Redemption.redeemed_at)
            ).all()

            trend = [
                {
                    'period': item.period.isoformat(),
                    'revenue': item.revenue or 0,
                    'order_count': item.order_count
                }
                for item in trend_data
            ]

        elif group_by == 'week':
            # 按週統計（使用 yearweek）
            trend_data = db.session.query(
                func.yearweek(Redemption.redeemed_at).label('period'),
                func.sum(Redemption.merit_points_used).label('revenue'),
                func.count(Redemption.id).label('order_count')
            ).filter(
                Redemption.temple_id == temple_id,
                Redemption.redeemed_at >= start_date,
                Redemption.redeemed_at <= end_date,
                Redemption.status.in_(['processing', 'shipped', 'completed'])
            ).group_by(
                func.yearweek(Redemption.redeemed_at)
            ).order_by(
                func.yearweek(Redemption.redeemed_at)
            ).all()

            trend = [
                {
                    'period': f'Week {item.period}',
                    'revenue': item.revenue or 0,
                    'order_count': item.order_count
                }
                for item in trend_data
            ]

        else:  # month
            # 按月統計
            trend_data = db.session.query(
                func.date_format(Redemption.redeemed_at, '%Y-%m').label('period'),
                func.sum(Redemption.merit_points_used).label('revenue'),
                func.count(Redemption.id).label('order_count')
            ).filter(
                Redemption.temple_id == temple_id,
                Redemption.redeemed_at >= start_date,
                Redemption.redeemed_at <= end_date,
                Redemption.status.in_(['processing', 'shipped', 'completed'])
            ).group_by(
                func.date_format(Redemption.redeemed_at, '%Y-%m')
            ).order_by(
                func.date_format(Redemption.redeemed_at, '%Y-%m')
            ).all()

            trend = [
                {
                    'period': item.period,
                    'revenue': item.revenue or 0,
                    'order_count': item.order_count
                }
                for item in trend_data
            ]

        # 商品銷售排行（收入貢獻）
        product_sales = db.session.query(
            Product.id,
            Product.name,
            Product.image_url,
            Product.merit_points,
            func.sum(Redemption.quantity).label('total_quantity'),
            func.sum(Redemption.merit_points_used).label('total_revenue')
        ).join(
            Redemption, Product.id == Redemption.product_id
        ).filter(
            Product.temple_id == temple_id,
            Redemption.redeemed_at >= start_date,
            Redemption.redeemed_at <= end_date,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
        ).group_by(
            Product.id, Product.name, Product.image_url, Product.merit_points
        ).order_by(
            func.sum(Redemption.merit_points_used).desc()
        ).limit(10).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'group_by': group_by
            },
            'summary': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'average_order_value': round(total_revenue / total_orders, 2) if total_orders > 0 else 0
            },
            'trend': trend,
            'product_sales': [
                {
                    'product_id': item.id,
                    'product_name': item.name,
                    'image_url': item.image_url,
                    'unit_price': item.merit_points,
                    'total_quantity': item.total_quantity,
                    'total_revenue': item.total_revenue,
                    'revenue_percentage': round((item.total_revenue / total_revenue * 100), 2) if total_revenue > 0 else 0
                }
                for item in product_sales
            ]
        }, '收入報表獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取收入報表失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/revenue/summary', methods=['GET'])
@token_required
def get_temple_revenue_summary(current_user, temple_id):
    """
    廟方收入總覽（需管理員權限）
    GET /api/temple-revenue/<temple_id>/revenue/summary
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

        now = datetime.utcnow()

        # 今日收入
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_revenue = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            Redemption.temple_id == temple_id,
            Redemption.redeemed_at >= today_start,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
        ).scalar() or 0

        # 本週收入
        week_ago = now - timedelta(days=7)
        weekly_revenue = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            Redemption.temple_id == temple_id,
            Redemption.redeemed_at >= week_ago,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
        ).scalar() or 0

        # 本月收入
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_revenue = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            Redemption.temple_id == temple_id,
            Redemption.redeemed_at >= month_start,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
        ).scalar() or 0

        # 總收入
        total_revenue = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter(
            Redemption.temple_id == temple_id,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
        ).scalar() or 0

        return success_response({
            'temple': temple.to_simple_dict(),
            'today': today_revenue,
            'this_week': weekly_revenue,
            'this_month': monthly_revenue,
            'total': total_revenue
        }, '收入總覽獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取收入總覽失敗: {str(e)}', 500)
