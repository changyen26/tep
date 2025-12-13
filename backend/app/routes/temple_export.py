"""
廟方資料匯出 API (CSV)
"""
from flask import Blueprint, request, Response
from app import db
from app.models.temple import Temple
from app.models.temple_admin import TempleAdmin
from app.models.checkin import Checkin
from app.models.product import Product
from app.models.redemption import Redemption
from app.models.user import User
from app.utils.auth import token_required
from app.utils.response import error_response
from datetime import datetime, timedelta
import csv
import io

bp = Blueprint('temple_export', __name__, url_prefix='/api/temple-export')

@bp.route('/<int:temple_id>/checkins', methods=['GET'])
@token_required
def export_temple_checkins(current_user, temple_id):
    """
    匯出打卡記錄為 CSV（需管理員權限）
    GET /api/temple-export/<temple_id>/checkins
    Header: Authorization: Bearer <token>
    Query Parameters:
        - start_date: 開始日期 (YYYY-MM-DD, optional)
        - end_date: 結束日期 (YYYY-MM-DD, optional)
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

        query = Checkin.query.filter_by(temple_id=temple_id)

        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(Checkin.timestamp >= start_date)

        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            end_date = end_date.replace(hour=23, minute=59, second=59)
            query = query.filter(Checkin.timestamp <= end_date)

        # 查詢打卡記錄並關聯用戶
        checkins = query.join(User).order_by(Checkin.timestamp.desc()).all()

        # 建立 CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # 寫入 BOM 以支援 Excel 正確顯示中文
        output.write('\ufeff')

        # 寫入表頭
        writer.writerow(['打卡時間', '用戶名稱', '用戶電話', '獲得福報', '累積福報', '備註'])

        # 寫入資料
        for checkin in checkins:
            writer.writerow([
                checkin.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                checkin.user.name,
                checkin.user.phone,
                checkin.merit_points_earned,
                checkin.user.merit_points,
                ''  # 備註欄位（預留）
            ])

        # 設定回應
        filename = f'{temple.name}_打卡記錄_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv'
        output.seek(0)

        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Content-Type': 'text/csv; charset=utf-8'
            }
        )

    except Exception as e:
        return error_response(f'匯出打卡記錄失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/orders', methods=['GET'])
@token_required
def export_temple_orders(current_user, temple_id):
    """
    匯出訂單為 CSV（需管理員權限）
    GET /api/temple-export/<temple_id>/orders
    Header: Authorization: Bearer <token>
    Query Parameters:
        - start_date: 開始日期 (YYYY-MM-DD, optional)
        - end_date: 結束日期 (YYYY-MM-DD, optional)
        - status: 訂單狀態篩選 (pending/processing/shipped/completed/cancelled, optional)
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

        # 解析參數
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        status = request.args.get('status')

        query = Redemption.query.filter_by(temple_id=temple_id)

        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(Redemption.redeemed_at >= start_date)

        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            end_date = end_date.replace(hour=23, minute=59, second=59)
            query = query.filter(Redemption.redeemed_at <= end_date)

        if status:
            query = query.filter_by(status=status)

        # 查詢訂單並關聯商品和用戶
        orders = query.join(Product).join(User).order_by(Redemption.redeemed_at.desc()).all()

        # 建立 CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # 寫入 BOM
        output.write('\ufeff')

        # 寫入表頭
        writer.writerow([
            '訂單編號', '訂單時間', '商品名稱', '數量', '使用福報',
            '訂單狀態', '收件人', '聯絡電話', '收件地址',
            '物流方式', '物流單號', '備註'
        ])

        # 寫入資料
        for order in orders:
            # 狀態轉換
            status_map = {
                'pending': '待處理',
                'processing': '處理中',
                'shipped': '已出貨',
                'completed': '已完成',
                'cancelled': '已取消'
            }

            writer.writerow([
                order.id,
                order.redeemed_at.strftime('%Y-%m-%d %H:%M:%S'),
                order.product.name,
                order.quantity,
                order.merit_points_used,
                status_map.get(order.status, order.status),
                order.recipient_name,
                order.phone,
                f"{order.postal_code or ''}{order.city}{order.district}{order.address}",
                order.shipping_method or '',
                order.tracking_number or '',
                order.notes or ''
            ])

        # 設定回應
        filename = f'{temple.name}_訂單記錄_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv'
        output.seek(0)

        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Content-Type': 'text/csv; charset=utf-8'
            }
        )

    except Exception as e:
        return error_response(f'匯出訂單記錄失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/revenue', methods=['GET'])
@token_required
def export_temple_revenue(current_user, temple_id):
    """
    匯出收入報表為 CSV（需管理員權限）
    GET /api/temple-export/<temple_id>/revenue
    Header: Authorization: Bearer <token>
    Query Parameters:
        - start_date: 開始日期 (YYYY-MM-DD, optional)
        - end_date: 結束日期 (YYYY-MM-DD, optional)
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

        # 預設時間範圍為最近30天
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            end_date = end_date.replace(hour=23, minute=59, second=59)
        else:
            end_date = datetime.utcnow()

        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        else:
            start_date = end_date - timedelta(days=30)

        # 查詢該時間範圍內的所有訂單（已完成或處理中）
        orders = Redemption.query.filter(
            Redemption.temple_id == temple_id,
            Redemption.redeemed_at >= start_date,
            Redemption.redeemed_at <= end_date,
            Redemption.status.in_(['processing', 'shipped', 'completed'])
        ).join(Product).order_by(Redemption.redeemed_at.desc()).all()

        # 建立 CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # 寫入 BOM
        output.write('\ufeff')

        # 寫入表頭
        writer.writerow([
            '訂單日期', '商品名稱', '單價(福報)', '數量',
            '小計(福報)', '訂單狀態'
        ])

        # 寫入資料
        total_revenue = 0
        for order in orders:
            status_map = {
                'pending': '待處理',
                'processing': '處理中',
                'shipped': '已出貨',
                'completed': '已完成',
                'cancelled': '已取消'
            }

            writer.writerow([
                order.redeemed_at.strftime('%Y-%m-%d %H:%M:%S'),
                order.product.name,
                order.product.merit_points,
                order.quantity,
                order.merit_points_used,
                status_map.get(order.status, order.status)
            ])
            total_revenue += order.merit_points_used

        # 寫入總計
        writer.writerow([])
        writer.writerow(['', '', '', '總計:', total_revenue, ''])

        # 設定回應
        filename = f'{temple.name}_收入報表_{start_date.strftime("%Y%m%d")}_{end_date.strftime("%Y%m%d")}.csv'
        output.seek(0)

        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}',
                'Content-Type': 'text/csv; charset=utf-8'
            }
        )

    except Exception as e:
        return error_response(f'匯出收入報表失敗: {str(e)}', 500)
