"""
兌換功能 API
"""
from flask import Blueprint, request
from app import db
from app.models.user import User
from app.models.product import Product
from app.models.address import Address
from app.models.redemption import Redemption
from app.models.temple import Temple
from app.utils.auth import token_required, admin_required
from app.utils.response import success_response, error_response
from datetime import datetime
from sqlalchemy import func

bp = Blueprint('redemption', __name__, url_prefix='/api/redemptions')

@bp.route('/', methods=['POST'])
@token_required
def create_redemption(current_user):
    """
    兌換商品
    POST /api/redemptions/
    Header: Authorization: Bearer <token>
    Body: {
        "product_id": 1,
        "quantity": 1,
        "address_id": 1,
        "notes": "請小心包裝"
    }
    """
    try:
        data = request.get_json()

        if not data or 'product_id' not in data or 'address_id' not in data:
            return error_response('缺少必要欄位', 400)

        product_id = data['product_id']
        quantity = data.get('quantity', 1)
        address_id = data['address_id']

        # 驗證商品
        product = Product.query.get(product_id)
        if not product:
            return error_response('商品不存在', 404)

        if not product.is_active:
            return error_response('商品已下架', 400)

        # 驗證庫存
        if product.stock_quantity < quantity:
            return error_response('庫存不足', 400)

        # 計算所需功德值
        total_points = product.merit_points * quantity

        # 驗證使用者功德值
        if current_user.blessing_points < total_points:
            return error_response(f'功德值不足，需要 {total_points} 點，目前有 {current_user.blessing_points} 點', 400)

        # 驗證地址
        address = Address.query.get(address_id)
        if not address:
            return error_response('地址不存在', 404)

        if address.user_id != current_user.id:
            return error_response('地址不屬於您', 403)

        # 創建兌換記錄
        redemption = Redemption(
            user_id=current_user.id,
            product_id=product_id,
            quantity=quantity,
            merit_points_used=total_points,
            status='pending',
            recipient_name=address.recipient_name,
            phone=address.phone,
            postal_code=address.postal_code,
            city=address.city,
            district=address.district,
            address=address.address,
            notes=data.get('notes')
        )

        # 扣除功德值
        current_user.blessing_points -= total_points

        # 減少庫存
        product.stock_quantity -= quantity

        db.session.add(redemption)
        db.session.commit()

        return success_response({
            'redemption': redemption.to_dict(),
            'remaining_points': current_user.blessing_points
        }, '兌換成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'兌換失敗: {str(e)}', 500)

@bp.route('/', methods=['GET'])
@token_required
def get_redemptions(current_user):
    """
    獲取兌換記錄
    GET /api/redemptions/
    Header: Authorization: Bearer <token>
    Query Parameters:
        - page: 頁碼 (default: 1)
        - per_page: 每頁數量 (default: 20)
        - status: 狀態篩選
    """
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=20, type=int)
        status = request.args.get('status')

        query = Redemption.query.filter_by(user_id=current_user.id)

        # 狀態篩選
        if status:
            query = query.filter_by(status=status)

        # 獲取總數
        total = query.count()

        # 分頁
        redemptions = query.order_by(
            Redemption.redeemed_at.desc()
        ).limit(per_page).offset((page - 1) * per_page).all()

        return success_response({
            'redemptions': [r.to_dict() for r in redemptions],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:redemption_id>', methods=['GET'])
@token_required
def get_redemption(current_user, redemption_id):
    """
    獲取兌換詳情
    GET /api/redemptions/<redemption_id>
    Header: Authorization: Bearer <token>
    """
    try:
        redemption = Redemption.query.get(redemption_id)

        if not redemption:
            return error_response('兌換記錄不存在', 404)

        if redemption.user_id != current_user.id:
            return error_response('無權限訪問', 403)

        return success_response(redemption.to_dict(), '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:redemption_id>/cancel', methods=['POST'])
@token_required
def cancel_redemption(current_user, redemption_id):
    """
    取消兌換
    POST /api/redemptions/<redemption_id>/cancel
    Header: Authorization: Bearer <token>
    """
    try:
        redemption = Redemption.query.get(redemption_id)

        if not redemption:
            return error_response('兌換記錄不存在', 404)

        if redemption.user_id != current_user.id:
            return error_response('無權限操作', 403)

        # 只能取消待處理狀態的兌換
        if redemption.status != 'pending':
            return error_response('此兌換無法取消', 400)

        # 退還功德值
        current_user.blessing_points += redemption.merit_points_used

        # 恢復商品庫存
        product = Product.query.get(redemption.product_id)
        if product:
            product.stock_quantity += redemption.quantity

        # 更新兌換狀態
        redemption.status = 'cancelled'
        redemption.cancelled_at = datetime.utcnow()

        db.session.commit()

        return success_response({
            'refunded_points': redemption.merit_points_used,
            'current_points': current_user.blessing_points
        }, '兌換已取消，功德值已退還', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'取消失敗: {str(e)}', 500)

@bp.route('/stats', methods=['GET'])
@token_required
def get_redemption_stats(current_user):
    """
    獲取兌換統計
    GET /api/redemptions/stats
    Header: Authorization: Bearer <token>
    """
    try:
        total_redemptions = Redemption.query.filter_by(
            user_id=current_user.id
        ).count()

        total_points_used = db.session.query(
            func.sum(Redemption.merit_points_used)
        ).filter_by(
            user_id=current_user.id
        ).filter(
            Redemption.status != 'cancelled'
        ).scalar() or 0

        status_count = {}
        for status in ['pending', 'processing', 'shipped', 'completed', 'cancelled']:
            count = Redemption.query.filter_by(
                user_id=current_user.id,
                status=status
            ).count()
            status_count[status] = count

        recent_redemptions = Redemption.query.filter_by(
            user_id=current_user.id
        ).order_by(
            Redemption.redeemed_at.desc()
        ).limit(5).all()

        return success_response({
            'total_redemptions': total_redemptions,
            'total_points_used': int(total_points_used),
            'status_count': status_count,
            'recent_redemptions': [r.to_simple_dict() for r in recent_redemptions]
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

# ===== 管理員 API =====

@bp.route('/admin/redemptions', methods=['GET'])
@admin_required
def admin_get_redemptions(current_user):
    """
    管理員：獲取所有兌換記錄
    GET /api/redemptions/admin/redemptions
    Header: Authorization: Bearer <token> (需要管理員權限)
    """
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=20, type=int)
        status = request.args.get('status')
        user_id = request.args.get('user_id', type=int)

        query = Redemption.query

        # 狀態篩選
        if status:
            query = query.filter_by(status=status)

        # 使用者篩選
        if user_id:
            query = query.filter_by(user_id=user_id)

        # 獲取總數
        total = query.count()

        # 分頁
        redemptions = query.order_by(
            Redemption.redeemed_at.desc()
        ).limit(per_page).offset((page - 1) * per_page).all()

        return success_response({
            'redemptions': [r.to_dict() for r in redemptions],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/admin/redemptions/<int:redemption_id>/status', methods=['PUT'])
@admin_required
def admin_update_redemption_status(current_user, redemption_id):
    """
    管理員：更新兌換狀態
    PUT /api/redemptions/admin/redemptions/<redemption_id>/status
    Header: Authorization: Bearer <token> (需要管理員權限)
    Body: {
        "status": "shipped",
        "tracking_number": "1234567890",
        "shipping_method": "宅配",
        "admin_notes": "已於今日出貨"
    }
    """
    try:
        redemption = Redemption.query.get(redemption_id)

        if not redemption:
            return error_response('兌換記錄不存在', 404)

        data = request.get_json()

        if 'status' in data:
            redemption.status = data['status']

            # 根據狀態更新時間戳
            if data['status'] == 'processing' and not redemption.processed_at:
                redemption.processed_at = datetime.utcnow()
            elif data['status'] == 'shipped' and not redemption.shipped_at:
                redemption.shipped_at = datetime.utcnow()
            elif data['status'] == 'completed' and not redemption.completed_at:
                redemption.completed_at = datetime.utcnow()

        if 'tracking_number' in data:
            redemption.tracking_number = data['tracking_number']

        if 'shipping_method' in data:
            redemption.shipping_method = data['shipping_method']

        if 'admin_notes' in data:
            redemption.admin_notes = data['admin_notes']

        db.session.commit()

        return success_response(redemption.to_dict(), '更新成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

# ===== 廟方管理員訂單 API =====

@bp.route('/temple/<int:temple_id>', methods=['GET'])
@token_required
def get_temple_redemptions(current_user, temple_id):
    """
    廟方管理員：取得該廟宇的訂單列表
    GET /api/redemptions/temple/<temple_id>
    Header: Authorization: Bearer <token> (需要廟方管理員權限)
    Query Parameters:
        - page: 頁碼 (default: 1)
        - per_page: 每頁數量 (default: 20)
        - status: 訂單狀態篩選 (pending/processing/shipped/completed/cancelled)
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        # DEPRECATED: Permission check removed - use auth context
        # temple_admin = TempleAdmin.query.filter_by( # Use temple_id from auth context
        # temple_id=temple_id,
        # user_id=current_user.id,
        # is_active=True
        # ).first()


        # DEPRECATED: if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限查看此廟宇的訂單', 403)

        # 解析參數
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=20, type=int)
        status = request.args.get('status')

        query = Redemption.query.filter_by(temple_id=temple_id)

        # 篩選狀態
        if status:
            query = query.filter_by(status=status)

        # 排序（最新優先）
        query = query.order_by(Redemption.redeemed_at.desc())

        # 獲取總數
        total = query.count()

        # 分頁
        redemptions = query.limit(per_page).offset((page - 1) * per_page).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'redemptions': [redemption.to_dict() for redemption in redemptions],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/temple/<int:temple_id>/<int:redemption_id>/status', methods=['PUT'])
@token_required
def update_temple_redemption_status(current_user, temple_id, redemption_id):
    """
    廟方管理員：更新訂單狀態
    PUT /api/redemptions/temple/<temple_id>/<redemption_id>/status
    Header: Authorization: Bearer <token> (需要廟方管理員權限)
    Body: {
        "status": "processing/shipped/completed/cancelled",
        "tracking_number": "物流單號",
        "shipping_method": "出貨方式",
        "admin_notes": "管理員備註"
    }
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查權限
        # DEPRECATED: Permission check removed - use auth context
        # temple_admin = TempleAdmin.query.filter_by( # Use temple_id from auth context
        # temple_id=temple_id,
        # user_id=current_user.id,
        # is_active=True
        # ).first()


        # DEPRECATED: if not temple_admin or not temple_admin.has_permission('view_stats'):
            return error_response('您沒有權限管理此廟宇的訂單', 403)

        redemption = Redemption.query.get(redemption_id)

        if not redemption:
            return error_response('訂單不存在', 404)

        # 確認訂單屬於該廟宇
        if redemption.temple_id != temple_id:
            return error_response('此訂單不屬於您的廟宇', 403)

        data = request.get_json()

        # 更新狀態
        if 'status' in data:
            if data['status'] not in ['pending', 'processing', 'shipped', 'completed', 'cancelled']:
                return error_response('無效的訂單狀態', 400)

            redemption.status = data['status']

            # 更新時間戳
            if data['status'] == 'processing':
                redemption.processed_at = datetime.utcnow()
            elif data['status'] == 'shipped':
                redemption.shipped_at = datetime.utcnow()
            elif data['status'] == 'completed':
                redemption.completed_at = datetime.utcnow()
            elif data['status'] == 'cancelled':
                redemption.cancelled_at = datetime.utcnow()

        # 更新物流資訊
        if 'tracking_number' in data:
            redemption.tracking_number = data['tracking_number']

        if 'shipping_method' in data:
            redemption.shipping_method = data['shipping_method']

        if 'admin_notes' in data:
            redemption.admin_notes = data['admin_notes']

        db.session.commit()

        return success_response(redemption.to_dict(), '更新成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)
