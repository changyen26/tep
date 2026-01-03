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
    獲取用戶的 temple_id（向後兼容）
    支援新 TempleAdminUser 和舊 User (with TempleAdmin)
    """
    # 新模型：TempleAdminUser 直接有 temple_id
    if hasattr(current_user, 'temple_id'):
        return current_user.temple_id

    # 舊模型：User + TempleAdmin 關聯
    try:
        from app.models.temple_admin import TempleAdmin
        temple_admin = TempleAdmin.query.filter_by(
            user_id=current_user.id,
            is_active=True
        ).first()
        return temple_admin.temple_id if temple_admin else None
    except Exception:
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
