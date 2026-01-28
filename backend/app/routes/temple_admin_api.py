"""
廟方管理 API - 三表帳號系統版本（向後兼容）
路徑格式：/api/temple-admin/temples/:templeId/*
權限控制：
- temple_admin 只能存取自己的 templeId
- super_admin 可以存取任意 templeId（但統計 API 除外，應使用系統管理後台）
"""
from flask import Blueprint, request
from app import db
from app.models.temple import Temple
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from sqlalchemy import func
from datetime import datetime, timedelta

bp = Blueprint('temple_admin_api', __name__, url_prefix='/api/temple-admin/temples')

def get_user_temple_id(current_user):
    """
    獲取用戶的 temple_id
    TempleAdminUser 直接有 temple_id（一帳號一廟）
    """
    if hasattr(current_user, 'temple_id'):
        return current_user.temple_id
    return None

def check_temple_access(current_user, account_type, temple_id):
    """
    檢查用戶是否有權限存取指定廟宇
    回傳：(has_access: bool, error_response)
    """
    if account_type == 'temple_admin':
        # temple_admin 只能存取自己的廟宇
        user_temple_id = get_user_temple_id(current_user)
        if user_temple_id != temple_id:
            return False, error_response('您沒有權限存取此廟宇', 403)
    elif account_type in ['super_admin', 'admin']:
        # super_admin 可以存取任意廟宇（基本資訊）
        pass
    else:
        # 其他帳號類型一律拒絕
        return False, error_response('需要廟方管理員或系統管理員權限', 403)

    return True, None

# ===== 廟宇基本資訊 =====

@bp.route('/<int:temple_id>', methods=['GET', 'OPTIONS'])
@token_required
def get_temple(current_user, account_type, temple_id):
    """
    取得廟宇資訊
    GET /api/temple-admin/temples/:templeId

    權限：temple_admin（僅自己的廟宇）、super_admin（任意廟宇）
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 查詢廟宇
        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        # 轉換為字典
        try:
            temple_data = temple.to_dict()
        except Exception as e:
            # 如果 to_dict() 失敗，手動構建基本資料
            temple_data = {
                'id': temple.id,
                'name': temple.name,
                'description': getattr(temple, 'description', ''),
                'address': getattr(temple, 'address', ''),
                'phone': getattr(temple, 'phone', ''),
                'opening_hours': getattr(temple, 'opening_hours', ''),
            }

        return success_response(temple_data)

    except AttributeError as e:
        import os
        import traceback
        if os.getenv('FLASK_ENV') == 'development' or os.getenv('FLASK_DEBUG') == '1':
            print(f"\n{'='*80}")
            print(f"❌ AttributeError in get_temple (temple_id={temple_id})")
            print(f"{'='*80}")
            traceback.print_exc()
            print(f"{'='*80}\n")
        return error_response(f'資料模型錯誤: {str(e)}', 500)

    except Exception as e:
        db.session.rollback()
        import os
        import traceback
        if os.getenv('FLASK_ENV') == 'development' or os.getenv('FLASK_DEBUG') == '1':
            print(f"\n{'='*80}")
            print(f"❌ Exception in get_temple (temple_id={temple_id})")
            print(f"{'='*80}")
            traceback.print_exc()
            print(f"{'='*80}\n")
        return error_response(f'查詢失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>', methods=['PUT', 'OPTIONS'])
@token_required
def update_temple(current_user, account_type, temple_id):
    """
    更新廟宇資訊
    PUT /api/temple-admin/temples/:templeId
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 查詢廟宇
        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        # 取得更新資料
        data = request.get_json()
        if not data:
            return error_response('缺少更新資料', 400)

        # 允許更新的欄位
        allowed_fields = ['name', 'description', 'address', 'phone', 'opening_hours']

        for field in allowed_fields:
            if field in data:
                setattr(temple, field, data[field])

        db.session.commit()

        try:
            temple_data = temple.to_dict()
        except Exception:
            temple_data = {
                'id': temple.id,
                'name': temple.name,
                'description': getattr(temple, 'description', ''),
                'address': getattr(temple, 'address', ''),
            }

        return success_response(temple_data, '廟宇資訊已更新')

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

# ===== 統計資料 =====

@bp.route('/<int:temple_id>/stats', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_stats(current_user, account_type, temple_id):
    """
    取得廟宇統計資料
    GET /api/temple-admin/temples/:templeId/stats

    僅限 temple_admin（綁定該廟宇）
    super_admin 不允許使用此 API，應使用系統管理後台
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 僅限 temple_admin
        if account_type not in ['temple_admin']:
            return error_response('此功能僅限廟方管理員使用', 403)

        # temple_admin 只能查看自己的廟宇
        user_temple_id = get_user_temple_id(current_user)
        if user_temple_id != temple_id:
            return error_response('您沒有權限查看此廟宇統計資料', 403)

        # 查詢廟宇
        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        # 計算統計資料（加入異常處理）
        try:
            from app.models.checkin import Checkin
            from app.models.redemption import Redemption

            today = datetime.now().date()
            today_start = datetime.combine(today, datetime.min.time())
            today_end = datetime.combine(today, datetime.max.time())
            month_start = datetime(today.year, today.month, 1)

            # 今日統計
            today_checkins = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.checkin_time >= today_start,
                Checkin.checkin_time <= today_end
            ).count()

            today_orders = Redemption.query.filter(
                Redemption.temple_id == temple_id,
                Redemption.created_at >= today_start,
                Redemption.created_at <= today_end
            ).count()

            today_revenue_result = db.session.query(func.sum(Redemption.total_points)).filter(
                Redemption.temple_id == temple_id,
                Redemption.created_at >= today_start,
                Redemption.created_at <= today_end,
                Redemption.status.in_(['completed', 'shipped'])
            ).scalar()
            today_revenue = int(today_revenue_result) if today_revenue_result else 0

            # 本月統計
            month_checkins = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.checkin_time >= month_start
            ).count()

            month_orders = Redemption.query.filter(
                Redemption.temple_id == temple_id,
                Redemption.created_at >= month_start
            ).count()

            month_revenue_result = db.session.query(func.sum(Redemption.total_points)).filter(
                Redemption.temple_id == temple_id,
                Redemption.created_at >= month_start,
                Redemption.status.in_(['completed', 'shipped'])
            ).scalar()
            month_revenue = int(month_revenue_result) if month_revenue_result else 0

            stats = {
                'today': {
                    'checkins': today_checkins,
                    'orders': today_orders,
                    'revenue': today_revenue
                },
                'month': {
                    'checkins': month_checkins,
                    'orders': month_orders,
                    'revenue': month_revenue
                }
            }

        except Exception as e:
            # 如果統計查詢失敗，返回預設值（避免前端崩潰）
            print(f"Stats query error: {e}")
            stats = {
                'today': {'checkins': 0, 'orders': 0, 'revenue': 0},
                'month': {'checkins': 0, 'orders': 0, 'revenue': 0}
            }

        return success_response(stats)

    except Exception as e:
        db.session.rollback()
        import os
        import traceback
        if os.getenv('FLASK_ENV') == 'development' or os.getenv('FLASK_DEBUG') == '1':
            print(f"\n{'='*80}")
            print(f"❌ Exception in get_temple_stats (temple_id={temple_id})")
            print(f"{'='*80}")
            traceback.print_exc()
            print(f"{'='*80}\n")
        return error_response(f'查詢統計資料失敗: {str(e)}', 500)

# ===== 打卡記錄 =====

@bp.route('/<int:temple_id>/checkins', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_checkins(current_user, account_type, temple_id):
    """
    取得廟宇打卡記錄
    GET /api/temple-admin/temples/:templeId/checkins?period=week&page=1&per_page=20
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 查詢廟宇
        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        # 取得查詢參數（修正：使用 request.args.get()）
        period = request.args.get('period', 'week')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))

        # 計算時間範圍
        now = datetime.now()
        if period == 'today':
            start_time = datetime.combine(now.date(), datetime.min.time())
        elif period == 'week':
            start_time = now - timedelta(days=7)
        elif period == 'month':
            start_time = now - timedelta(days=30)
        else:
            start_time = now - timedelta(days=7)

        # 查詢打卡記錄
        try:
            from app.models.checkin import Checkin
            query = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.checkin_time >= start_time
            ).order_by(Checkin.checkin_time.desc())

            pagination = query.paginate(page=page, per_page=per_page, error_out=False)

            checkins = []
            for c in pagination.items:
                try:
                    checkins.append(c.to_dict())
                except Exception:
                    # 如果 to_dict() 失敗，手動構建
                    checkins.append({
                        'id': c.id,
                        'user_id': c.user_id,
                        'temple_id': c.temple_id,
                        'checkin_time': c.checkin_time.isoformat() if c.checkin_time else None,
                    })

            return success_response({
                'checkins': checkins,
                'total': pagination.total,
                'page': page,
                'per_page': per_page,
                'pages': pagination.pages
            })

        except Exception as e:
            # 如果查詢失敗，返回空陣列
            return success_response({
                'checkins': [],
                'total': 0,
                'page': page,
                'per_page': per_page,
                'pages': 0
            })

    except Exception as e:
        db.session.rollback()
        return error_response(f'查詢打卡記錄失敗: {str(e)}', 500)

# ===== 功德商品 =====

@bp.route('/<int:temple_id>/products', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_products(current_user, account_type, temple_id):
    """
    取得廟宇功德商品列表
    GET /api/temple-admin/temples/:templeId/products?page=1&per_page=20
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 查詢廟宇
        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        # 取得查詢參數
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))

        # 查詢商品
        try:
            from app.models.product import Product
            query = Product.query.filter(
                Product.temple_id == temple_id
            ).order_by(Product.created_at.desc())

            pagination = query.paginate(page=page, per_page=per_page, error_out=False)

            products = []
            for p in pagination.items:
                try:
                    products.append(p.to_dict())
                except Exception:
                    products.append({
                        'id': p.id,
                        'name': p.name,
                        'points': p.points,
                        'stock': p.stock,
                    })

            return success_response({
                'products': products,
                'total': pagination.total,
                'page': page,
                'per_page': per_page,
                'pages': pagination.pages
            })

        except Exception:
            return success_response({
                'products': [],
                'total': 0,
                'page': page,
                'per_page': per_page,
                'pages': 0
            })

    except Exception as e:
        db.session.rollback()
        return error_response(f'查詢商品失敗: {str(e)}', 500)

# ===== 訂單管理 =====

@bp.route('/<int:temple_id>/orders', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_orders(current_user, account_type, temple_id):
    """
    取得廟宇訂單列表
    GET /api/temple-admin/temples/:templeId/orders?page=1&per_page=20&status=pending
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 查詢廟宇
        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        # 取得查詢參數
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status', None)
        keyword = request.args.get('keyword', None)
        start_date = request.args.get('start_date', None)
        end_date = request.args.get('end_date', None)

        # 查詢訂單
        try:
            from app.models.redemption import Redemption
            query = Redemption.query.filter(
                Redemption.temple_id == temple_id
            )

            # 篩選條件
            if status:
                query = query.filter(Redemption.status == status)

            if keyword:
                query = query.filter(
                    db.or_(
                        Redemption.recipient_name.like(f'%{keyword}%'),
                        Redemption.id == int(keyword) if keyword.isdigit() else False
                    )
                )

            if start_date:
                from datetime import datetime
                query = query.filter(Redemption.created_at >= datetime.fromisoformat(start_date))

            if end_date:
                from datetime import datetime
                query = query.filter(Redemption.created_at <= datetime.fromisoformat(end_date))

            query = query.order_by(Redemption.created_at.desc())
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)

            orders = []
            for order in pagination.items:
                try:
                    orders.append(order.to_dict())
                except Exception:
                    # 如果 to_dict() 失敗，手動構建基本資料
                    orders.append({
                        'id': order.id,
                        'product_id': order.product_id,
                        'product_name': getattr(order.product, 'name', None) if hasattr(order, 'product') else None,
                        'user_id': order.user_id,
                        'user_name': getattr(order.user, 'name', None) if hasattr(order, 'user') else None,
                        'quantity': getattr(order, 'quantity', 1),
                        'merit_points_used': getattr(order, 'total_points', 0),
                        'total_points': getattr(order, 'total_points', 0),
                        'status': order.status,
                        'recipient_name': getattr(order, 'recipient_name', None),
                        'recipient_phone': getattr(order, 'recipient_phone', None),
                        'recipient_address': getattr(order, 'recipient_address', None),
                        'redeemed_at': order.created_at.isoformat() if order.created_at else None,
                        'created_at': order.created_at.isoformat() if order.created_at else None,
                    })

            return success_response({
                'orders': orders,
                'total': pagination.total,
                'page': page,
                'per_page': per_page,
                'pages': pagination.pages
            })

        except Exception as e:
            # 如果查詢失敗，返回空陣列
            print(f"Orders query error: {e}")
            return success_response({
                'orders': [],
                'total': 0,
                'page': page,
                'per_page': per_page,
                'pages': 0
            })

    except Exception as e:
        db.session.rollback()
        import os
        import traceback
        if os.getenv('FLASK_ENV') == 'development' or os.getenv('FLASK_DEBUG') == '1':
            print(f"\n{'='*80}")
            print(f"❌ Exception in get_temple_orders (temple_id={temple_id})")
            print(f"{'='*80}")
            traceback.print_exc()
            print(f"{'='*80}\n")
        return error_response(f'查詢訂單失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/orders/<int:order_id>', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_order_detail(current_user, account_type, temple_id, order_id):
    """
    取得訂單詳情
    GET /api/temple-admin/temples/:templeId/orders/:orderId
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 查詢訂單
        from app.models.redemption import Redemption
        order = Redemption.query.filter_by(id=order_id, temple_id=temple_id).first()

        if not order:
            return error_response('訂單不存在', 404)

        try:
            order_data = order.to_dict()
        except Exception:
            order_data = {
                'id': order.id,
                'product_id': order.product_id,
                'product_name': getattr(order.product, 'name', None) if hasattr(order, 'product') else None,
                'user_id': order.user_id,
                'quantity': getattr(order, 'quantity', 1),
                'merit_points_used': getattr(order, 'total_points', 0),
                'status': order.status,
                'recipient_name': getattr(order, 'recipient_name', None),
                'recipient_phone': getattr(order, 'recipient_phone', None),
                'recipient_address': getattr(order, 'recipient_address', None),
                'temple_note': getattr(order, 'temple_note', None),
                'tracking_number': getattr(order, 'tracking_number', None),
                'redeemed_at': order.created_at.isoformat() if order.created_at else None,
            }

        return success_response(order_data)

    except Exception as e:
        db.session.rollback()
        return error_response(f'查詢訂單詳情失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/orders/<int:order_id>/status', methods=['PUT', 'OPTIONS'])
@token_required
def update_temple_order_status(current_user, account_type, temple_id, order_id):
    """
    更新訂單狀態
    PUT /api/temple-admin/temples/:templeId/orders/:orderId/status
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 查詢訂單
        from app.models.redemption import Redemption
        order = Redemption.query.filter_by(id=order_id, temple_id=temple_id).first()

        if not order:
            return error_response('訂單不存在', 404)

        # 取得更新資料
        data = request.get_json()
        if not data:
            return error_response('缺少更新資料', 400)

        # 更新狀態
        if 'status' in data:
            order.status = data['status']

        if 'note' in data:
            order.temple_note = data['note']

        if 'tracking_number' in data:
            order.tracking_number = data['tracking_number']

        db.session.commit()

        try:
            order_data = order.to_dict()
        except Exception:
            order_data = {
                'id': order.id,
                'status': order.status,
            }

        return success_response(order_data, '訂單狀態已更新')

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新訂單狀態失敗: {str(e)}', 500)

# ===== 收入報表 =====

@bp.route('/<int:temple_id>/revenue', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_revenue(current_user, account_type, temple_id):
    """
    取得廟宇收入報表
    GET /api/temple-admin/temples/:templeId/revenue

    權限：temple_admin（僅自己的廟宇）
    注意：super_admin 不應使用此 API（應使用系統管理後台的統計功能）

    Query Parameters:
        - start_date: 開始日期 (YYYY-MM-DD, optional)
        - end_date: 結束日期 (YYYY-MM-DD, optional)
        - group_by: 分組方式 (day/week/month, default: day)
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查：只允許 temple_admin 存取
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id).first()
        if not temple:
            return error_response('廟宇不存在', 404)

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
        from app.models.redemption import Redemption
        from app.models.product import Product

        base_query = Redemption.query.filter(
            Redemption.temple_id == temple_id,
            Redemption.redeemed_at >= start_date,
            Redemption.redeemed_at <= end_date,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
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
                    'period': item.period.isoformat() if item.period else '',
                    'revenue': item.revenue or 0,
                    'order_count': item.order_count
                }
                for item in trend_data
            ]

        elif group_by == 'week':
            # 按週統計
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

        # 構建回應資料
        try:
            temple_info = temple.to_simple_dict() if hasattr(temple, 'to_simple_dict') else {
                'id': temple.id,
                'name': temple.name
            }
        except Exception:
            temple_info = {'id': temple.id, 'name': temple.name}

        return success_response({
            'temple': temple_info,
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
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'查詢收入報表失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/revenue/summary', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_revenue_summary(current_user, account_type, temple_id):
    """
    取得廟宇收入摘要
    GET /api/temple-admin/temples/:templeId/revenue/summary

    權限：temple_admin（僅自己的廟宇）
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查：只允許 temple_admin 存取
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id).first()
        if not temple:
            return error_response('廟宇不存在', 404)

        from app.models.redemption import Redemption
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

        # 構建回應資料
        try:
            temple_info = temple.to_simple_dict() if hasattr(temple, 'to_simple_dict') else {
                'id': temple.id,
                'name': temple.name
            }
        except Exception:
            temple_info = {'id': temple.id, 'name': temple.name}

        return success_response({
            'temple': temple_info,
            'today': today_revenue,
            'this_week': weekly_revenue,
            'this_month': monthly_revenue,
            'total': total_revenue
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'查詢收入摘要失敗: {str(e)}', 500)

# ===== 信眾管理 =====

@bp.route('/<int:temple_id>/devotees', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_devotees(current_user, account_type, temple_id):
    """
    取得廟宇信眾列表（互動紀錄彙總）
    GET /api/temple-admin/temples/:templeId/devotees

    權限：僅 temple_admin（自己的廟宇）

    Query Parameters:
        - keyword: 搜尋 email/name (optional)
        - sort: last_seen | checkins | spend (default: last_seen)
        - from, to: 日期區間 (optional)
        - page, per_page: 分頁 (default: 1, 20)
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查：只允許 temple_admin
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id).first()
        if not temple:
            return error_response('廟宇不存在', 404)

        # 解析查詢參數
        keyword = request.args.get('keyword', '').strip()
        sort_by = request.args.get('sort', 'last_seen')
        date_from = request.args.get('from')
        date_to = request.args.get('to')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))

        # 從 checkins 表彙總信眾（使用 PublicUser）
        from app.models.checkin import Checkin
        from app.models.public_user import PublicUser
        from app.models.redemption import Redemption

        # 查詢所有在此廟宇有互動的 public_user_id
        devotee_ids_query = db.session.query(Checkin.user_id).filter(
            Checkin.temple_id == temple_id
        ).distinct()

        # 應用日期篩選
        if date_from:
            from_dt = datetime.strptime(date_from, '%Y-%m-%d')
            devotee_ids_query = devotee_ids_query.filter(Checkin.created_at >= from_dt)
        if date_to:
            to_dt = datetime.strptime(date_to, '%Y-%m-%d')
            devotee_ids_query = devotee_ids_query.filter(Checkin.created_at <= to_dt)

        devotee_ids = [row[0] for row in devotee_ids_query.all()]

        if not devotee_ids:
            return success_response({
                'items': [],
                'page': page,
                'per_page': per_page,
                'total': 0
            })

        # 查詢 PublicUser
        users_query = PublicUser.query.filter(PublicUser.id.in_(devotee_ids))

        # 應用 keyword 篩選
        if keyword:
            users_query = users_query.filter(
                db.or_(
                    PublicUser.email.like(f'%{keyword}%'),
                    PublicUser.name.like(f'%{keyword}%')
                )
            )

        # 計算每個信眾的統計資料
        devotees_data = []
        for user in users_query.all():
            # 打卡數
            checkins_count = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user.id
            ).count()

            # 訂單數和消費總額
            orders = Redemption.query.filter(
                Redemption.temple_id == temple_id,
                Redemption.user_id == user.id,
                Redemption.status.in_(['processing', 'shipped', 'completed'])
            ).all()
            orders_count = len(orders)
            spend_total = sum(order.merit_points_used or 0 for order in orders)

            # 最後互動時間
            last_checkin = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user.id
            ).order_by(Checkin.created_at.desc()).first()
            last_seen_at = last_checkin.created_at if last_checkin else user.created_at

            devotees_data.append({
                'public_user_id': user.id,
                'name': user.name,
                'email': user.email,
                'last_seen_at': last_seen_at.isoformat(),
                'checkins_count': checkins_count,
                'events_count': 0,  # TODO: 待實現
                'lamps_count': 0,  # TODO: 待實現
                'orders_count': orders_count,
                'spend_total': spend_total,
                '_sort_value': {
                    'last_seen': last_seen_at,
                    'checkins': checkins_count,
                    'spend': spend_total
                }[sort_by]
            })

        # 排序
        reverse = True  # 預設降序
        devotees_data.sort(key=lambda x: x['_sort_value'], reverse=reverse)

        # 移除排序輔助欄位
        for d in devotees_data:
            del d['_sort_value']

        # 分頁
        total = len(devotees_data)
        start = (page - 1) * per_page
        end = start + per_page
        items = devotees_data[start:end]

        return success_response({
            'items': items,
            'page': page,
            'per_page': per_page,
            'total': total
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'查詢信眾列表失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/devotees/<int:public_user_id>', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_devotee_detail(current_user, account_type, temple_id, public_user_id):
    """
    取得廟宇信眾詳細資訊（含互動時間線）
    GET /api/temple-admin/temples/:templeId/devotees/:publicUserId

    權限：僅 temple_admin（自己的廟宇）
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查：只允許 temple_admin
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id).first()
        if not temple:
            return error_response('廟宇不存在', 404)

        # 查詢信眾
        from app.models.public_user import PublicUser
        from app.models.checkin import Checkin
        from app.models.redemption import Redemption

        user = PublicUser.query.get(public_user_id)
        if not user:
            return error_response('信眾不存在', 404)

        # 檢查該信眾是否與此廟宇有互動
        has_interaction = Checkin.query.filter(
            Checkin.temple_id == temple_id,
            Checkin.user_id == public_user_id
        ).first() is not None

        if not has_interaction:
            return error_response('此信眾與該廟宇無互動紀錄', 404)

        # Profile
        profile = {
            'public_user_id': user.id,
            'name': user.name,
            'email': user.email,
            'created_at': user.created_at.isoformat(),
            'last_login_at': user.last_login_at.isoformat() if user.last_login_at else None,
            'last_seen_at': None  # 稍後計算
        }

        # Summary
        checkins = Checkin.query.filter(
            Checkin.temple_id == temple_id,
            Checkin.user_id == public_user_id
        ).all()
        checkins_count = len(checkins)

        orders = Redemption.query.filter(
            Redemption.temple_id == temple_id,
            Redemption.user_id == public_user_id,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
        ).all()
        orders_count = len(orders)
        spend_total = sum(order.merit_points_used or 0 for order in orders)

        summary = {
            'checkins_count': checkins_count,
            'events_count': 0,  # TODO: 待實現
            'lamps_count': 0,  # TODO: 待實現
            'orders_count': orders_count,
            'spend_total': spend_total
        }

        # Timeline（互動時間線）
        timeline = []

        # 加入打卡記錄
        for checkin in checkins:
            timeline.append({
                'type': 'checkin',
                'at': checkin.created_at.isoformat(),
                'meta': {
                    'merit_points': checkin.merit_points_earned or 0
                }
            })

        # 加入訂單記錄
        for order in Redemption.query.filter(
            Redemption.temple_id == temple_id,
            Redemption.user_id == public_user_id
        ).all():
            timeline.append({
                'type': 'order',
                'at': order.redeemed_at.isoformat() if order.redeemed_at else order.created_at.isoformat(),
                'meta': {
                    'order_id': order.id,
                    'amount': order.merit_points_used or 0,
                    'status': order.status,
                    'product_name': order.product.name if order.product else None
                }
            })

        # 按時間降序排序
        timeline.sort(key=lambda x: x['at'], reverse=True)

        # 計算 last_seen_at
        if timeline:
            profile['last_seen_at'] = timeline[0]['at']

        return success_response({
            'profile': profile,
            'summary': summary,
            'timeline': timeline
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'查詢信眾詳情失敗: {str(e)}', 500)


# ========================================
# 進香登記管理 API
# ========================================

@bp.route('/<int:temple_id>/pilgrimage-visits', methods=['GET', 'OPTIONS'])
@token_required
def get_pilgrimage_visits(current_user, account_type, temple_id):
    """
    取得廟宇進香登記列表
    GET /api/temple-admin/temples/:templeId/pilgrimage-visits

    Query Parameters:
        - status: pending | confirmed | rejected | completed | canceled (optional)
        - page: 頁碼 (default: 1)
        - per_page: 每頁筆數 (default: 20)
        - sort: visit_time | created_at (default: visit_time)
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 只允許 temple_admin 使用
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        # 取得參數
        status = request.args.get('status', None)
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        sort_by = request.args.get('sort', 'visit_time')

        # 限制 per_page
        if per_page > 100:
            per_page = 100

        # 查詢
        from app.models.pilgrimage_visit import PilgrimageVisit

        query = PilgrimageVisit.query.filter_by(temple_id=temple_id)

        # 篩選 status
        if status:
            query = query.filter_by(status=status)

        # 排序
        if sort_by == 'created_at':
            query = query.order_by(PilgrimageVisit.created_at.desc())
        else:  # visit_time (default)
            query = query.order_by(PilgrimageVisit.visit_start_at.desc())

        # 分頁
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        items = [visit.to_dict() for visit in pagination.items]

        return success_response({
            'items': items,
            'pagination': {
                'total': pagination.total,
                'page': pagination.page,
                'per_page': pagination.per_page,
                'pages': pagination.pages
            }
        })

    except ValueError:
        return error_response('無效的分頁參數', 400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'查詢進香登記失敗: {str(e)}', 500)


@bp.route('/<int:temple_id>/pilgrimage-visits', methods=['POST'])
@token_required
def create_pilgrimage_visit(current_user, account_type, temple_id):
    """
    新增進香登記
    POST /api/temple-admin/temples/:templeId/pilgrimage-visits

    Body:
        - contactName (required)
        - contactPhone (required)
        - visitStartAt (required, ISO datetime)
        - peopleCount (required, int)
        - groupName (optional)
        - purpose (optional)
        - needs (optional)
    """
    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 只允許 temple_admin 使用
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        data = request.get_json()
        if not data:
            return error_response('缺少請求內容', 400)

        # 驗證必填欄位
        required_fields = ['contactName', 'contactPhone', 'visitStartAt', 'peopleCount']
        for field in required_fields:
            if field not in data:
                return error_response(f'缺少必填欄位: {field}', 400)

        # 解析日期時間
        try:
            visit_start_at = datetime.fromisoformat(data['visitStartAt'].replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return error_response('visitStartAt 格式錯誤，需要 ISO 8601 格式', 400)

        # 建立新登記
        from app.models.pilgrimage_visit import PilgrimageVisit

        new_visit = PilgrimageVisit(
            temple_id=temple_id,
            contact_name=data['contactName'],
            contact_phone=data['contactPhone'],
            visit_start_at=visit_start_at,
            people_count=int(data['peopleCount']),
            group_name=data.get('groupName'),
            purpose=data.get('purpose'),
            needs=data.get('needs'),
            status='pending'
        )

        db.session.add(new_visit)
        db.session.commit()

        return success_response(new_visit.to_dict(), 201)

    except ValueError as e:
        return error_response(f'資料格式錯誤: {str(e)}', 400)
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return error_response(f'新增進香登記失敗: {str(e)}', 500)


@bp.route('/<int:temple_id>/pilgrimage-visits/<int:visit_id>', methods=['GET', 'OPTIONS'])
@token_required
def get_pilgrimage_visit_detail(current_user, account_type, temple_id, visit_id):
    """
    取得進香登記詳情
    GET /api/temple-admin/temples/:templeId/pilgrimage-visits/:visitId
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 只允許 temple_admin 使用
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        from app.models.pilgrimage_visit import PilgrimageVisit

        visit = PilgrimageVisit.query.filter_by(
            id=visit_id,
            temple_id=temple_id
        ).first()

        if not visit:
            return error_response('找不到此進香登記', 404)

        return success_response(visit.to_dict())

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'查詢進香登記失敗: {str(e)}', 500)


@bp.route('/<int:temple_id>/pilgrimage-visits/<int:visit_id>', methods=['PUT'])
@token_required
def update_pilgrimage_visit(current_user, account_type, temple_id, visit_id):
    """
    更新進香登記
    PUT /api/temple-admin/temples/:templeId/pilgrimage-visits/:visitId

    Body (all optional):
        - status: pending | confirmed | rejected | completed | canceled
        - assignedStaff: 指派負責人員
        - adminNote: 廟方內部備註
        - replyMessage: 回覆給信眾的訊息
        - contactName, contactPhone, visitStartAt, peopleCount, groupName, purpose, needs
    """
    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 只允許 temple_admin 使用
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        from app.models.pilgrimage_visit import PilgrimageVisit

        visit = PilgrimageVisit.query.filter_by(
            id=visit_id,
            temple_id=temple_id
        ).first()

        if not visit:
            return error_response('找不到此進香登記', 404)

        data = request.get_json()
        if not data:
            return error_response('缺少請求內容', 400)

        # 更新欄位
        if 'status' in data:
            allowed_statuses = ['pending', 'confirmed', 'rejected', 'completed', 'canceled']
            if data['status'] not in allowed_statuses:
                return error_response(f'無效的狀態值，允許的值: {", ".join(allowed_statuses)}', 400)
            visit.status = data['status']

        if 'assignedStaff' in data:
            visit.assigned_staff = data['assignedStaff']

        if 'adminNote' in data:
            visit.admin_note = data['adminNote']

        if 'replyMessage' in data:
            visit.reply_message = data['replyMessage']

        if 'contactName' in data:
            visit.contact_name = data['contactName']

        if 'contactPhone' in data:
            visit.contact_phone = data['contactPhone']

        if 'peopleCount' in data:
            visit.people_count = int(data['peopleCount'])

        if 'groupName' in data:
            visit.group_name = data['groupName']

        if 'purpose' in data:
            visit.purpose = data['purpose']

        if 'needs' in data:
            visit.needs = data['needs']

        if 'visitStartAt' in data:
            try:
                visit.visit_start_at = datetime.fromisoformat(data['visitStartAt'].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return error_response('visitStartAt 格式錯誤，需要 ISO 8601 格式', 400)

        visit.updated_at = datetime.utcnow()
        db.session.commit()

        return success_response(visit.to_dict())

    except ValueError as e:
        return error_response(f'資料格式錯誤: {str(e)}', 400)
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return error_response(f'更新進香登記失敗: {str(e)}', 500)


# ===== 會員分析 =====

@bp.route('/<int:temple_id>/analytics/members', methods=['GET', 'OPTIONS'])
@token_required
def get_member_analytics(current_user, account_type, temple_id):
    """
    取得會員分析資料
    GET /api/temple-admin/temples/:templeId/analytics/members

    權限：僅 temple_admin（自己的廟宇）

    Query Parameters:
        - period: 分析期間 (7d/30d/90d/365d, default: 30d)
        - compare: 是否包含上期對比 (optional)

    Response:
        - overview: 會員總覽 (total_members, active_members, new_members, dormant_members)
        - activity_trend: 活動趨勢 [{ date, checkins, orders, events }]
        - checkin_frequency: 打卡頻率分布 [{ range, count, percentage }]
        - spend_distribution: 消費金額分布 [{ range, count, percentage }]
        - top_devotees: Top 10 信眾 [{ name_masked, checkins_count, spend_total }]
        - funnel: 轉換漏斗 { all_members, active_30d, made_order, repeat_order }
        - retention: 留存指標 { mom_retention_rate, weekly_return_rate, churned_this_month }
        - member_tenure: 會員資歷分布 [{ tenure, count, percentage }]
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查：只允許 temple_admin
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id).first()
        if not temple:
            return error_response('廟宇不存在', 404)

        # 解析參數
        period = request.args.get('period', '30d')
        period_days = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '365d': 365
        }.get(period, 30)

        now = datetime.utcnow()
        period_start = now - timedelta(days=period_days)
        active_threshold = now - timedelta(days=30)
        dormant_threshold = now - timedelta(days=90)

        # 取得模型
        from app.models.checkin import Checkin
        from app.models.public_user import PublicUser
        from app.models.redemption import Redemption

        # ===== Overview 會員總覽 =====
        # 總會員：曾與本廟互動的不重複用戶
        all_user_ids = db.session.query(Checkin.user_id).filter(
            Checkin.temple_id == temple_id
        ).distinct().all()
        all_user_ids = [uid[0] for uid in all_user_ids]
        total_members = len(all_user_ids)

        # 活躍會員：30天內有互動
        active_user_ids = db.session.query(Checkin.user_id).filter(
            Checkin.temple_id == temple_id,
            Checkin.checkin_time >= active_threshold
        ).distinct().all()
        active_user_ids = [uid[0] for uid in active_user_ids]
        active_members = len(active_user_ids)
        active_rate = round((active_members / total_members * 100), 1) if total_members > 0 else 0

        # 新會員：30天內首次互動
        new_members_count = 0
        for user_id in all_user_ids:
            first_checkin = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user_id
            ).order_by(Checkin.checkin_time.asc()).first()
            if first_checkin and first_checkin.checkin_time >= active_threshold:
                new_members_count += 1

        # 休眠會員：90天以上無互動
        dormant_count = 0
        for user_id in all_user_ids:
            last_checkin = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user_id
            ).order_by(Checkin.checkin_time.desc()).first()
            if last_checkin and last_checkin.checkin_time < dormant_threshold:
                dormant_count += 1
        dormant_rate = round((dormant_count / total_members * 100), 1) if total_members > 0 else 0

        overview = {
            'total_members': total_members,
            'active_members': active_members,
            'active_rate': active_rate,
            'new_members': new_members_count,
            'dormant_members': dormant_count,
            'dormant_rate': dormant_rate
        }

        # ===== Activity Trend 活動趨勢 =====
        activity_trend = []
        for i in range(period_days):
            day = now - timedelta(days=period_days - 1 - i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)

            checkins_count = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.checkin_time >= day_start,
                Checkin.checkin_time <= day_end
            ).count()

            orders_count = Redemption.query.filter(
                Redemption.temple_id == temple_id,
                Redemption.created_at >= day_start,
                Redemption.created_at <= day_end
            ).count()

            activity_trend.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'checkins': checkins_count,
                'orders': orders_count,
                'events': 0  # TODO: 活動報名數
            })

        # ===== Interaction Types 互動類型分布 =====
        checkin_only = 0
        order_only = 0
        multi_interaction = 0

        for user_id in all_user_ids:
            has_checkin = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user_id
            ).first() is not None

            has_order = Redemption.query.filter(
                Redemption.temple_id == temple_id,
                Redemption.user_id == user_id
            ).first() is not None

            if has_checkin and has_order:
                multi_interaction += 1
            elif has_checkin:
                checkin_only += 1
            elif has_order:
                order_only += 1

        interaction_types = [
            {'type': '僅打卡', 'count': checkin_only},
            {'type': '僅下單', 'count': order_only},
            {'type': '多元互動', 'count': multi_interaction}
        ]

        # ===== Checkin Frequency 打卡頻率分布 =====
        frequency_ranges = [
            ('1次', 1, 1),
            ('2-5次', 2, 5),
            ('6-10次', 6, 10),
            ('11-20次', 11, 20),
            ('20+次', 21, 9999)
        ]
        checkin_frequency = []
        for label, min_count, max_count in frequency_ranges:
            count = 0
            for user_id in all_user_ids:
                user_checkins = Checkin.query.filter(
                    Checkin.temple_id == temple_id,
                    Checkin.user_id == user_id
                ).count()
                if min_count <= user_checkins <= max_count:
                    count += 1
            percentage = round((count / total_members * 100), 1) if total_members > 0 else 0
            checkin_frequency.append({
                'range': label,
                'count': count,
                'percentage': percentage
            })

        # ===== Spend Distribution 消費金額分布 =====
        spend_ranges = [
            ('未消費', 0, 0),
            ('1-100', 1, 100),
            ('101-500', 101, 500),
            ('501-1000', 501, 1000),
            ('1000+', 1001, 999999999)
        ]
        spend_distribution = []
        for label, min_spend, max_spend in spend_ranges:
            count = 0
            for user_id in all_user_ids:
                user_spend = db.session.query(func.sum(Redemption.total_points)).filter(
                    Redemption.temple_id == temple_id,
                    Redemption.user_id == user_id,
                    Redemption.status.in_(['completed', 'shipped', 'processing'])
                ).scalar() or 0
                if min_spend <= user_spend <= max_spend:
                    count += 1
            percentage = round((count / total_members * 100), 1) if total_members > 0 else 0
            spend_distribution.append({
                'range': label,
                'count': count,
                'percentage': percentage
            })

        # ===== Top Devotees Top 10 信眾 =====
        top_devotees = []
        devotee_stats = []
        for user_id in all_user_ids:
            user = PublicUser.query.get(user_id)
            if not user:
                continue

            checkins_count = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user_id
            ).count()

            spend_total = db.session.query(func.sum(Redemption.total_points)).filter(
                Redemption.temple_id == temple_id,
                Redemption.user_id == user_id,
                Redemption.status.in_(['completed', 'shipped', 'processing'])
            ).scalar() or 0

            # 姓名遮罩處理
            name = user.name or ''
            if len(name) >= 2:
                name_masked = name[0] + '*' * (len(name) - 1)
            else:
                name_masked = '***'

            devotee_stats.append({
                'public_user_id': user_id,
                'name_masked': name_masked,
                'checkins_count': checkins_count,
                'spend_total': int(spend_total)
            })

        # 按打卡數排序取前10
        devotee_stats.sort(key=lambda x: x['checkins_count'], reverse=True)
        top_devotees = devotee_stats[:10]

        # ===== Funnel 轉換漏斗 =====
        made_order_count = 0
        repeat_order_count = 0
        for user_id in active_user_ids:
            orders = Redemption.query.filter(
                Redemption.temple_id == temple_id,
                Redemption.user_id == user_id,
                Redemption.status.in_(['completed', 'shipped', 'processing'])
            ).count()
            if orders > 0:
                made_order_count += 1
            if orders > 1:
                repeat_order_count += 1

        funnel = {
            'all_members': total_members,
            'active_30d': active_members,
            'made_order': made_order_count,
            'repeat_order': repeat_order_count
        }

        # ===== Retention 留存指標 =====
        # 月留存率：上月活躍用戶本月回訪比例
        last_month_start = now - timedelta(days=60)
        last_month_end = now - timedelta(days=30)
        last_month_active = db.session.query(Checkin.user_id).filter(
            Checkin.temple_id == temple_id,
            Checkin.checkin_time >= last_month_start,
            Checkin.checkin_time < last_month_end
        ).distinct().all()
        last_month_active_ids = [uid[0] for uid in last_month_active]

        retained_count = 0
        for user_id in last_month_active_ids:
            has_this_month = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user_id,
                Checkin.checkin_time >= active_threshold
            ).first()
            if has_this_month:
                retained_count += 1

        mom_retention_rate = round((retained_count / len(last_month_active_ids) * 100), 1) if last_month_active_ids else 0

        # 週回訪率：一個月內 2+ 週有互動的比例
        weeks_with_activity = {}
        for user_id in active_user_ids:
            week_set = set()
            checkins = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user_id,
                Checkin.checkin_time >= active_threshold
            ).all()
            for c in checkins:
                week_num = c.checkin_time.isocalendar()[1]
                week_set.add(week_num)
            weeks_with_activity[user_id] = len(week_set)

        multi_week_users = sum(1 for w in weeks_with_activity.values() if w >= 2)
        weekly_return_rate = round((multi_week_users / active_members * 100), 1) if active_members > 0 else 0

        # 本月流失數
        churned_this_month = len(last_month_active_ids) - retained_count

        # 平均回訪間隔（簡化計算）
        avg_return_days = 12  # 預設值，完整實現需更複雜計算

        retention = {
            'mom_retention_rate': mom_retention_rate,
            'weekly_return_rate': weekly_return_rate,
            'churned_this_month': churned_this_month,
            'avg_return_days': avg_return_days
        }

        # ===== Member Tenure 會員資歷 =====
        tenure_counts = {
            'newcomer': 0,     # <30天
            'establishing': 0,  # 1-6個月
            'loyal': 0,         # 6-12個月
            'veteran': 0        # >1年
        }

        for user_id in all_user_ids:
            first_checkin = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == user_id
            ).order_by(Checkin.checkin_time.asc()).first()

            if first_checkin:
                days_since = (now - first_checkin.checkin_time).days
                if days_since < 30:
                    tenure_counts['newcomer'] += 1
                elif days_since < 180:
                    tenure_counts['establishing'] += 1
                elif days_since < 365:
                    tenure_counts['loyal'] += 1
                else:
                    tenure_counts['veteran'] += 1

        member_tenure = []
        for tenure, count in tenure_counts.items():
            percentage = round((count / total_members * 100), 1) if total_members > 0 else 0
            member_tenure.append({
                'tenure': tenure,
                'count': count,
                'percentage': percentage
            })

        # 構建回應
        return success_response({
            'overview': overview,
            'activity_trend': activity_trend,
            'interaction_types': interaction_types,
            'checkin_frequency': checkin_frequency,
            'spend_distribution': spend_distribution,
            'top_devotees': top_devotees,
            'funnel': funnel,
            'retention': retention,
            'member_tenure': member_tenure
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'查詢會員分析資料失敗: {str(e)}', 500)


# ===== 經營診斷 =====

@bp.route('/<int:temple_id>/business/dashboard', methods=['GET', 'OPTIONS'])
@token_required
def get_business_dashboard(current_user, account_type, temple_id):
    """
    取得經營診斷儀表板資料
    GET /api/temple-admin/temples/:templeId/business/dashboard

    權限：僅 temple_admin（自己的廟宇）

    Query Parameters:
        - month: 報告月份 (YYYY-MM, default: 當月)

    Response:
        - health_score: 健康度評分
        - alerts: 警示列表
        - recommendations: 建議行動
        - funnel: 轉換漏斗
        - cohort: 留存同類群
        - event_roi: 活動 ROI
        - meeting_points: 會議討論要點
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        if account_type != 'temple_admin':
            return error_response('此 API 僅供廟方管理員使用', 403)

        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        temple = Temple.query.filter_by(id=temple_id).first()
        if not temple:
            return error_response('廟宇不存在', 404)

        # 解析月份參數
        month_str = request.args.get('month')
        if month_str:
            try:
                year, month = map(int, month_str.split('-'))
                report_date = datetime(year, month, 1)
            except:
                report_date = datetime.utcnow().replace(day=1)
        else:
            report_date = datetime.utcnow().replace(day=1)

        # 取得模型
        from app.models.checkin import Checkin
        from app.models.public_user import PublicUser
        from app.models.redemption import Redemption

        now = datetime.utcnow()
        month_start = report_date
        month_end = (report_date.replace(day=28) + timedelta(days=4)).replace(day=1)
        prev_month_start = (month_start - timedelta(days=1)).replace(day=1)

        # ===== 計算各項指標 =====

        # 總會員數
        all_user_ids = db.session.query(Checkin.user_id).filter(
            Checkin.temple_id == temple_id
        ).distinct().all()
        total_members = len(all_user_ids)

        # 本月新會員
        new_members_count = 0
        for uid in all_user_ids:
            first = Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == uid[0]
            ).order_by(Checkin.checkin_time.asc()).first()
            if first and month_start <= first.checkin_time < month_end:
                new_members_count += 1

        # 活躍會員 (30天內)
        active_threshold = now - timedelta(days=30)
        active_user_ids = db.session.query(Checkin.user_id).filter(
            Checkin.temple_id == temple_id,
            Checkin.checkin_time >= active_threshold
        ).distinct().all()
        active_members = len(active_user_ids)
        active_rate = round((active_members / total_members * 100), 1) if total_members > 0 else 0

        # 留存率計算
        prev_active = db.session.query(Checkin.user_id).filter(
            Checkin.temple_id == temple_id,
            Checkin.checkin_time >= prev_month_start,
            Checkin.checkin_time < month_start
        ).distinct().all()
        prev_active_ids = set(uid[0] for uid in prev_active)

        retained = 0
        for uid in prev_active_ids:
            if Checkin.query.filter(
                Checkin.temple_id == temple_id,
                Checkin.user_id == uid,
                Checkin.checkin_time >= month_start,
                Checkin.checkin_time < month_end
            ).first():
                retained += 1

        retention_rate = round((retained / len(prev_active_ids) * 100), 1) if prev_active_ids else 0

        # 營收
        revenue = db.session.query(func.sum(Redemption.total_points)).filter(
            Redemption.temple_id == temple_id,
            Redemption.created_at >= month_start,
            Redemption.created_at < month_end,
            Redemption.status.in_(['completed', 'shipped', 'processing'])
        ).scalar() or 0

        # 計算健康度分數
        acquisition_score = min(100, int(new_members_count / 100 * 100))
        activation_score = min(100, int(active_rate * 2))
        retention_score = min(100, int(retention_rate * 2))
        revenue_score = min(100, int(revenue / 1000))
        overall_score = int((acquisition_score + activation_score + retention_score + revenue_score) / 4)

        # ===== 生成警示 =====
        alerts = []
        if retention_rate < 50:
            alerts.append({
                'severity': 'critical',
                'title': '留存率低於警戒線',
                'description': f'本月留存率僅 {retention_rate}%，低於建議的 50%',
                'action': '查看流失名單'
            })
        if active_rate < 40:
            alerts.append({
                'severity': 'warning',
                'title': '活躍度偏低',
                'description': f'活躍會員比例僅 {active_rate}%，建議規劃活動提升互動',
                'action': '規劃活動'
            })

        # ===== 生成建議 =====
        recommendations = []
        if retention_rate < 50:
            recommendations.append({
                'priority': 'high',
                'title': '啟動沉睡會員喚醒計畫',
                'description': '針對 60-90 天未回訪的信眾，發送關懷訊息搭配優惠',
                'expected_impact': '預估可喚醒 30% 沉睡會員'
            })
        if new_members_count < 50:
            recommendations.append({
                'priority': 'medium',
                'title': '加強獲客活動',
                'description': '新會員數低於預期，建議規劃引流活動或推薦獎勵',
                'expected_impact': '預估可提升每月新客 50%'
            })

        # ===== 轉換漏斗 =====
        visitors_count = Checkin.query.filter(
            Checkin.temple_id == temple_id
        ).with_entities(Checkin.user_id).distinct().count()

        made_order = 0
        for uid in [u[0] for u in active_user_ids]:
            if Redemption.query.filter(
                Redemption.temple_id == temple_id,
                Redemption.user_id == uid,
                Redemption.status.in_(['completed', 'shipped', 'processing'])
            ).first():
                made_order += 1

        funnel = {
            'visitors': {'count': visitors_count, 'rate': None},
            'members': {'count': total_members, 'rate': round(total_members / visitors_count * 100) if visitors_count else 0},
            'active': {'count': active_members, 'rate': round(active_members / total_members * 100) if total_members else 0},
            'converted': {'count': made_order, 'rate': round(made_order / active_members * 100) if active_members else 0}
        }

        # ===== 會議要點 =====
        meeting_points = {
            'wins': [],
            'concerns': [],
            'next_month_goals': []
        }

        if new_members_count > 100:
            meeting_points['wins'].append(f'新會員數達 {new_members_count} 人，表現優異')
        if retention_rate > 60:
            meeting_points['wins'].append(f'留存率 {retention_rate}%，高於業界平均')

        if retention_rate < 50:
            meeting_points['concerns'].append(f'留存率 {retention_rate}% 偏低，需立即處理')
        if active_rate < 40:
            meeting_points['concerns'].append(f'活躍度 {active_rate}% 偏低，需加強互動')

        meeting_points['next_month_goals'].append('提升留存率至 50% 以上')
        meeting_points['next_month_goals'].append('規劃 1-2 場信眾互動活動')

        return success_response({
            'health_score': {
                'overall': {
                    'score': overall_score,
                    'trend': 0,
                    'benchmark_comparison': '資料計算中'
                },
                'pillars': {
                    'acquisition': {
                        'score': acquisition_score,
                        'value': f'+{new_members_count} 人',
                        'change': 0,
                        'benchmark': '+100 人/月'
                    },
                    'activation': {
                        'score': activation_score,
                        'value': f'{active_rate}%',
                        'change': 0,
                        'benchmark': '45%'
                    },
                    'retention': {
                        'score': retention_score,
                        'value': f'{retention_rate}%',
                        'change': 0,
                        'benchmark': '50%'
                    },
                    'revenue': {
                        'score': revenue_score,
                        'value': f'${revenue:,}',
                        'change': 0,
                        'benchmark': '$80,000/月'
                    }
                }
            },
            'alerts': alerts,
            'recommendations': recommendations,
            'funnel': funnel,
            'cohort': [],  # 需要更多歷史資料
            'event_roi': [],  # 需要活動資料
            'meeting_points': meeting_points
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'查詢經營診斷資料失敗: {str(e)}', 500)


# ===== 活動管理 =====

@bp.route('/<int:temple_id>/events', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_events(current_user, account_type, temple_id):
    """
    GET /temple-admin/temples/:temple_id/events
    """
    if request.method == 'OPTIONS':
        return '', 204

    has_access, error = check_temple_access(current_user, account_type, temple_id)
    if not has_access:
        return error

    try:
        from app.models.temple_event import TempleEvent

        query = TempleEvent.query.filter_by(temple_id=temple_id)

        status = request.args.get('status')
        if status:
            query = query.filter_by(status=status)

        events = query.order_by(TempleEvent.start_at.desc()).all()

        return success_response({
            'events': [event.to_dict(include_registered_count=True) for event in events],
            'total': len(events)
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'獲取活動列表失敗: {str(e)}', 500)


@bp.route('/<int:temple_id>/events/<int:event_id>', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_event(current_user, account_type, temple_id, event_id):
    """
    GET /temple-admin/temples/:temple_id/events/:event_id
    """
    if request.method == 'OPTIONS':
        return '', 204

    has_access, error = check_temple_access(current_user, account_type, temple_id)
    if not has_access:
        return error

    try:
        from app.models.temple_event import TempleEvent

        event = TempleEvent.query.filter_by(
            id=event_id,
            temple_id=temple_id
        ).first()

        if not event:
            return error_response('找不到此活動', 404)

        return success_response(event.to_dict(include_registered_count=True))

    except Exception as e:
        return error_response(f'獲取活動詳情失敗: {str(e)}', 500)


# ===== 點燈管理 =====

@bp.route('/<int:temple_id>/lamps', methods=['GET', 'OPTIONS'])
@token_required
def get_temple_lamps(current_user, account_type, temple_id):
    """
    GET /temple-admin/temples/:temple_id/lamps
    """
    if request.method == 'OPTIONS':
        return '', 204

    has_access, error = check_temple_access(current_user, account_type, temple_id)
    if not has_access:
        return error

    try:
        from app.models import LampType, LampApplication

        lamp_types = LampType.query.filter_by(temple_id=temple_id).all()

        return success_response({
            'lampTypes': [lamp.to_dict() for lamp in lamp_types] if hasattr(lamp_types[0] if lamp_types else None, 'to_dict') else [],
            'total': len(lamp_types)
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f'獲取點燈列表失敗: {str(e)}', 500)


# ===== 全局錯誤處理 =====

@bp.errorhandler(Exception)
def handle_blueprint_exception(error):
    """
    Blueprint 層級的錯誤處理器
    確保所有未捕獲的錯誤都返回 JSON
    """
    db.session.rollback()

    # 開發環境：返回詳細錯誤
    import os
    if os.getenv('FLASK_ENV') == 'development' or os.getenv('FLASK_DEBUG') == '1':
        import traceback
        traceback.print_exc()
        return error_response(f'Internal Server Error: {str(error)}', 500)

    # 生產環境：返回通用錯誤
    return error_response('Internal Server Error', 500)
