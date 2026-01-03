"""
系統管理員 API 路由
"""
from flask import Blueprint, request
from app import db
from app.models.system_admin import SystemAdmin
from app.models.system_log import SystemLog
from app.models.user import User
from app.models.temple import Temple
from app.models.temple_application import TempleApplication
from app.models.product import Product
from app.models.redemption import Redemption
from app.models.system_settings import SystemSettings
from app.models.user_report import UserReport
from app.models.checkin import Checkin
from app.utils.response import success_response, error_response
from app.utils.auth import generate_admin_token, admin_token_required, admin_permission_required
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ===== 1. 管理員認證 =====

@bp.route('/login', methods=['POST'])
def admin_login():
    """
    管理員登入
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return error_response('缺少用戶名或密碼', 400)

    # 查詢管理員
    admin = SystemAdmin.query.filter_by(username=username).first()
    if not admin:
        return error_response('用戶名或密碼錯誤', 401)

    if not admin.check_password(password):
        return error_response('用戶名或密碼錯誤', 401)

    if not admin.is_active:
        return error_response('管理員帳號已停用', 403)

    # 更新登入資訊
    ip_address = request.remote_addr
    admin.update_login_info(ip_address)

    # 記錄登入日誌
    SystemLog.log_action(
        admin_id=admin.id,
        action_type='admin_login',
        action_category='auth',
        description=f'管理員 {admin.name} 登入系統',
        ip_address=ip_address,
        user_agent=request.headers.get('User-Agent'),
        request_method='POST',
        request_path='/api/admin/login',
        response_status=200
    )

    db.session.commit()

    # 生成 Token
    token = generate_admin_token(admin.id)

    return success_response({
        'token': token,
        'admin': admin.to_dict()
    }, '登入成功')

# ===== 2. 用戶管理 =====

@bp.route('/users', methods=['GET'])
@admin_permission_required('manage_users')
def get_users(current_admin):
    """
    獲取用戶列表（帶篩選、排序、分頁）
    """
    # 分頁參數
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    # 篩選參數
    keyword = request.args.get('keyword', '').strip()
    role = request.args.get('role', '').strip()
    sort_by = request.args.get('sort_by', 'created_at')  # created_at, blessing_points
    order = request.args.get('order', 'desc')  # asc, desc

    # 日期範圍
    date_from = request.args.get('date_from', '').strip()
    date_to = request.args.get('date_to', '').strip()

    # 構建查詢
    query = User.query

    # 關鍵字搜尋（姓名、郵箱）
    if keyword:
        query = query.filter(
            or_(
                User.name.like(f'%{keyword}%'),
                User.email.like(f'%{keyword}%')
            )
        )

    # 角色篩選
    if role:
        query = query.filter(User.role == role)

    # 日期範圍篩選
    if date_from:
        query = query.filter(User.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(User.created_at <= datetime.fromisoformat(date_to))

    # 排序
    if order == 'asc':
        query = query.order_by(getattr(User, sort_by).asc())
    else:
        query = query.order_by(getattr(User, sort_by).desc())

    # 分頁
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'users': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })

@bp.route('/users/<int:user_id>', methods=['GET'])
@admin_permission_required('manage_users')
def get_user_detail(current_admin, user_id):
    """
    獲取用戶詳細資訊（含統計數據）
    """
    user = User.query.get(user_id)
    if not user:
        return error_response('用戶不存在', 404)

    # 統計數據
    stats = {
        'total_checkins': Checkin.query.filter_by(user_id=user_id).count(),
        'total_redemptions': Redemption.query.filter_by(user_id=user_id).count(),
        'total_points_used': db.session.query(func.sum(Redemption.merit_points_used)).filter(
            Redemption.user_id == user_id,
            Redemption.status.in_(['completed', 'shipped', 'processing'])
        ).scalar() or 0
    }

    # 最近活動
    recent_checkins = Checkin.query.filter_by(user_id=user_id).order_by(
        Checkin.timestamp.desc()
    ).limit(5).all()

    recent_redemptions = Redemption.query.filter_by(user_id=user_id).order_by(
        Redemption.redeemed_at.desc()
    ).limit(5).all()

    return success_response({
        'user': user.to_dict(),
        'statistics': stats,
        'recent_checkins': [c.to_dict() for c in recent_checkins],
        'recent_redemptions': [r.to_dict() for r in recent_redemptions]
    })

@bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_permission_required('manage_users')
def update_user_role(current_admin, user_id):
    """
    更新用戶角色
    """
    user = User.query.get(user_id)
    if not user:
        return error_response('用戶不存在', 404)

    data = request.get_json()
    role = data.get('role', '').strip()

    if not role:
        return error_response('缺少參數: role', 400)

    if role not in ['user', 'admin']:
        return error_response('無效的角色', 400)

    old_role = user.role
    user.role = role

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='user_role_update',
        action_category='user_mgmt',
        target_type='user',
        target_id=user_id,
        description=f'管理員 {current_admin.name} 將用戶 {user.name} 角色由 {old_role} 更改為 {role}',
        ip_address=request.remote_addr,
        changes={'role': {'old': old_role, 'new': role}}
    )

    db.session.commit()

    return success_response(user.to_dict(), '用戶角色更新成功')

@bp.route('/users/<int:user_id>/points', methods=['PUT'])
@admin_permission_required('manage_users')
def adjust_user_points(current_admin, user_id):
    """
    調整用戶功德點數
    """
    user = User.query.get(user_id)
    if not user:
        return error_response('用戶不存在', 404)

    data = request.get_json()
    adjustment = data.get('adjustment')  # 正數為增加，負數為減少
    reason = data.get('reason', '').strip()

    if adjustment is None:
        return error_response('缺少參數: adjustment', 400)

    if not reason:
        return error_response('必須提供調整原因', 400)

    old_points = user.blessing_points
    user.blessing_points += adjustment
    new_points = user.blessing_points

    # 防止負數
    if user.blessing_points < 0:
        user.blessing_points = 0
        new_points = 0

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='user_points_adjustment',
        action_category='user_mgmt',
        target_type='user',
        target_id=user_id,
        description=f'管理員 {current_admin.name} 調整用戶 {user.name} 的功德點數 {adjustment:+d}，原因: {reason}',
        ip_address=request.remote_addr,
        changes={
            'blessing_points': {
                'old': old_points,
                'new': new_points,
                'adjustment': adjustment
            }
        }
    )

    db.session.commit()

    return success_response({
        'user': user.to_dict(),
        'old_points': old_points,
        'adjustment': adjustment,
        'new_points': new_points
    }, '功德點數調整成功')

@bp.route('/users/<int:user_id>/toggle', methods=['PUT'])
@admin_permission_required('manage_users')
def toggle_user_status(current_admin, user_id):
    """
    啟用/停用使用者
    """
    user = User.query.get(user_id)
    if not user:
        return error_response('用戶不存在', 404)

    # 切換使用者啟用狀態
    user.is_active = not user.is_active
    db.session.commit()

    status_text = '啟用' if user.is_active else '停用'
    return success_response(
        user.to_dict(),
        f'使用者已{status_text}'
    )

@bp.route('/users/bulk-action', methods=['POST'])
@admin_permission_required('manage_users')
def bulk_user_action(current_admin):
    """
    批量操作用戶（更改角色）
    """
    data = request.get_json()
    user_ids = data.get('user_ids', [])
    action = data.get('action', '').strip()  # set_user, set_admin

    if not user_ids:
        return error_response('未選擇用戶', 400)

    if action not in ['set_user', 'set_admin']:
        return error_response('無效的操作類型', 400)

    role = 'user' if action == 'set_user' else 'admin'

    # 更新用戶角色
    updated_count = User.query.filter(User.id.in_(user_ids)).update(
        {User.role: role},
        synchronize_session=False
    )

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='user_bulk_action',
        action_category='user_mgmt',
        target_type='user',
        description=f'管理員 {current_admin.name} 批量將 {updated_count} 個用戶設為{role}',
        ip_address=request.remote_addr,
        request_data={'user_ids': user_ids, 'action': action, 'role': role}
    )

    db.session.commit()

    return success_response({
        'updated_count': updated_count,
        'action': action,
        'role': role
    }, f'成功更新了 {updated_count} 個用戶')

# ===== 3. 廟宇申請審核 =====

@bp.route('/temple-applications', methods=['GET'])
@admin_permission_required('review_temples')
def get_temple_applications(current_admin):
    """
    獲取廟宇申請列表
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '').strip()

    query = TempleApplication.query

    if status:
        query = query.filter_by(status=status)

    query = query.order_by(TempleApplication.submitted_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'applications': [app.to_dict() for app in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })

@bp.route('/temple-applications/<int:application_id>/review', methods=['POST'])
@admin_permission_required('review_temples')
def review_temple_application(current_admin, application_id):
    """
    審核廟宇申請
    """
    application = TempleApplication.query.get(application_id)
    if not application:
        return error_response('申請不存在', 404)

    data = request.get_json()
    action = data.get('action', '').strip()  # approve, reject, in_review
    note = data.get('note', '').strip()

    if action not in ['approve', 'reject', 'in_review']:
        return error_response('無效的操作類型', 400)

    if action == 'approve':
        # 創建廟宇
        temple = Temple(
            name=application.temple_name,
            description=application.temple_description,
            address=application.address,
            phone=application.phone,
            email=application.email,
            website=application.website,
            deity_main=application.deity_main,
            established_year=application.established_year,
            images=application.temple_images,
            owner_id=application.applicant_id,
            is_active=True
        )
        db.session.add(temple)
        db.session.flush()  # 獲取 temple.id

        application.approve(current_admin.id, temple.id, note)

        action_desc = '批准'
    elif action == 'reject':
        if not note:
            return error_response('拒絕申請必須提供原因', 400)
        application.reject(current_admin.id, note)
        action_desc = '拒絕'
    else:  # in_review
        application.set_in_review(current_admin.id)
        action_desc = '設為審核中'

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='temple_application_review',
        action_category='temple_mgmt',
        target_type='temple_application',
        target_id=application_id,
        description=f'管理員 {current_admin.name} {action_desc}了廟宇申請: {application.temple_name}',
        ip_address=request.remote_addr,
        changes={'status': {'old': application.status, 'new': action}, 'note': note}
    )

    db.session.commit()

    return success_response(application.to_dict(), f'廟宇申請{action_desc}成功')

# ===== 4. 產品審核 =====

@bp.route('/products/pending', methods=['GET'])
@admin_permission_required('review_products')
def get_pending_products(current_admin):
    """
    獲取未啟用產品列表
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Product.query.filter_by(is_active=False).order_by(Product.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'products': [p.to_dict() for p in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })

@bp.route('/products/<int:product_id>/review', methods=['POST'])
@admin_permission_required('review_products')
def review_product(current_admin, product_id):
    """
    審核產品（啟用或拒絕）
    """
    product = Product.query.get(product_id)
    if not product:
        return error_response('產品不存在', 404)

    data = request.get_json()
    action = data.get('action', '').strip()  # approve, reject
    note = data.get('note', '').strip()

    if action not in ['approve', 'reject']:
        return error_response('無效的操作類型', 400)

    old_status = product.is_active

    if action == 'approve':
        product.is_active = True
        action_desc = '批准'
    else:  # reject
        if not note:
            return error_response('拒絕產品必須提供原因', 400)
        product.is_active = False
        action_desc = '拒絕'

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='product_review',
        action_category='product_mgmt',
        target_type='product',
        target_id=product_id,
        description=f'管理員 {current_admin.name} {action_desc}了產品: {product.name}',
        ip_address=request.remote_addr,
        changes={'is_active': {'old': old_status, 'new': product.is_active}, 'note': note}
    )

    db.session.commit()

    return success_response(product.to_dict(), f'產品{action_desc}成功')

@bp.route('/products/<int:product_id>/toggle-status', methods=['PUT'])
@admin_permission_required('manage_products')
def toggle_product_status(current_admin, product_id):
    """
    切換產品狀態（上架/下架）
    """
    product = Product.query.get(product_id)
    if not product:
        return error_response('產品不存在', 404)

    data = request.get_json()
    is_active = data.get('is_active')

    if is_active is None:
        return error_response('缺少參數: is_active', 400)

    old_status = product.is_active
    product.is_active = is_active

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='product_status_toggle',
        action_category='product_mgmt',
        target_type='product',
        target_id=product_id,
        description=f'管理員 {current_admin.name} 將產品 {product.name} 狀態由 {old_status} 更改為 {is_active}',
        ip_address=request.remote_addr,
        changes={'is_active': {'old': old_status, 'new': is_active}}
    )

    db.session.commit()

    return success_response(product.to_dict(), '產品狀態更新成功')

# ===== 5. 兌換訂單管理增強 =====

@bp.route('/redemptions', methods=['GET'])
@admin_permission_required('manage_orders')
def get_all_redemptions(current_admin):
    """
    獲取所有兌換訂單（帶高級篩選）
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '').strip()
    keyword = request.args.get('keyword', '').strip()
    date_from = request.args.get('date_from', '').strip()
    date_to = request.args.get('date_to', '').strip()

    query = Redemption.query

    if status:
        query = query.filter_by(status=status)

    if keyword:
        query = query.join(User).filter(
            or_(
                User.name.like(f'%{keyword}%'),
                Redemption.recipient_name.like(f'%{keyword}%')
            )
        )

    if date_from:
        query = query.filter(Redemption.redeemed_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Redemption.redeemed_at <= datetime.fromisoformat(date_to))

    query = query.order_by(Redemption.redeemed_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'redemptions': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })

@bp.route('/redemptions/<int:redemption_id>', methods=['GET'])
@admin_permission_required('manage_orders')
def get_redemption_detail(current_admin, redemption_id):
    """
    獲取兌換訂單詳情
    """
    redemption = Redemption.query.get(redemption_id)
    if not redemption:
        return error_response('兌換訂單不存在', 404)

    return success_response({
        'redemption': redemption.to_dict()
    })

@bp.route('/redemptions/<int:redemption_id>/status', methods=['PUT'])
@admin_permission_required('manage_orders')
def update_redemption_status(current_admin, redemption_id):
    """
    更新兌換訂單狀態
    """
    redemption = Redemption.query.get(redemption_id)
    if not redemption:
        return error_response('兌換訂單不存在', 404)

    data = request.get_json()
    new_status = data.get('status')
    remarks = data.get('remarks', '')

    if not new_status:
        return error_response('缺少參數: status', 400)

    # 驗證狀態值
    valid_statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled']
    if new_status not in valid_statuses:
        return error_response(f'無效的狀態值，必須是: {", ".join(valid_statuses)}', 400)

    old_status = redemption.status
    redemption.status = new_status

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='redemption_status_update',
        action_category='order_mgmt',
        target_type='redemption',
        target_id=redemption_id,
        description=f'管理員 {current_admin.name} 將兌換訂單 #{redemption_id} 狀態從 {old_status} 更新為 {new_status}' + (f'，備註：{remarks}' if remarks else ''),
        ip_address=request.remote_addr,
        changes={'status': {'old': old_status, 'new': new_status}, 'remarks': remarks}
    )

    db.session.commit()

    return success_response({
        'redemption': redemption.to_dict()
    }, '兌換訂單狀態更新成功')

# ===== 5.5. 打卡記錄管理 =====

@bp.route('/checkins', methods=['GET'])
@admin_permission_required('manage_users')
def get_checkin_list(current_admin):
    """
    獲取打卡記錄列表（系統管理員專用）
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # 基礎查詢
    query = Checkin.query

    # 日期篩選
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(Checkin.timestamp >= start)
        except ValueError:
            pass

    if end_date:
        try:
            end = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            query = query.filter(Checkin.timestamp < end)
        except ValueError:
            pass

    # 排序：最新的在前
    query = query.order_by(Checkin.timestamp.desc())

    # 分頁
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'checkins': [checkin.to_dict() for checkin in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })

@bp.route('/checkins/<int:checkin_id>', methods=['GET'])
@admin_permission_required('manage_users')
def get_checkin_detail(current_admin, checkin_id):
    """
    獲取打卡記錄詳情
    """
    checkin = Checkin.query.get(checkin_id)
    if not checkin:
        return error_response('打卡記錄不存在', 404)

    return success_response({
        'checkin': checkin.to_dict()
    })

# ===== 5.6. 平安符管理 =====

@bp.route('/amulets', methods=['GET'])
@admin_permission_required('manage_users')
def get_amulet_list(current_admin):
    """
    獲取平安符列表（系統管理員專用）
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '').strip()

    # 基礎查詢
    from app.models.amulet import Amulet
    query = Amulet.query

    # 搜索：根據用戶名或 ID
    if search:
        query = query.join(User).filter(
            or_(
                User.name.like(f'%{search}%'),
                User.email.like(f'%{search}%')
            )
        )

    # 排序：最新的在前
    query = query.order_by(Amulet.created_at.desc())

    # 分頁
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'amulets': [amulet.to_dict() for amulet in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })

@bp.route('/amulets/<int:amulet_id>', methods=['GET'])
@admin_permission_required('manage_users')
def get_amulet_detail(current_admin, amulet_id):
    """
    獲取平安符詳情
    """
    from app.models.amulet import Amulet
    amulet = Amulet.query.get(amulet_id)
    if not amulet:
        return error_response('平安符不存在', 404)

    return success_response({
        'amulet': amulet.to_dict()
    })

@bp.route('/amulets/<int:amulet_id>', methods=['DELETE'])
@admin_permission_required('manage_users')
def delete_amulet(current_admin, amulet_id):
    """
    刪除平安符
    """
    from app.models.amulet import Amulet
    amulet = Amulet.query.get(amulet_id)
    if not amulet:
        return error_response('平安符不存在', 404)

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='amulet_delete',
        action_category='user_mgmt',
        target_type='amulet',
        target_id=amulet_id,
        description=f'管理員 {current_admin.name} 刪除了用戶 {amulet.owner.name} 的平安符 #{amulet_id}',
        ip_address=request.remote_addr
    )

    db.session.delete(amulet)
    db.session.commit()

    return success_response(None, '平安符刪除成功')

@bp.route('/amulets/<int:amulet_id>/energy', methods=['PUT'])
@admin_permission_required('manage_users')
def adjust_amulet_energy(current_admin, amulet_id):
    """
    調整平安符能量
    """
    from app.models.amulet import Amulet
    amulet = Amulet.query.get(amulet_id)
    if not amulet:
        return error_response('平安符不存在', 404)

    data = request.get_json()
    adjustment = data.get('adjustment', 0)  # 正數增加，負數減少

    if not isinstance(adjustment, int):
        return error_response('調整值必須是整數', 400)

    old_energy = amulet.energy
    if adjustment > 0:
        amulet.add_energy(adjustment)
    else:
        amulet.reduce_energy(abs(adjustment))

    new_energy = amulet.energy

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='amulet_energy_adjust',
        action_category='user_mgmt',
        target_type='amulet',
        target_id=amulet_id,
        description=f'管理員 {current_admin.name} 調整了平安符 #{amulet_id} 的能量：{old_energy} -> {new_energy} (調整 {adjustment})',
        ip_address=request.remote_addr
    )

    db.session.commit()

    return success_response({
        'amulet': amulet.to_dict(),
        'old_energy': old_energy,
        'new_energy': new_energy,
        'adjustment': adjustment
    }, '能量調整成功')

@bp.route('/amulets/<int:amulet_id>/status', methods=['PUT'])
@admin_permission_required('manage_users')
def update_amulet_status(current_admin, amulet_id):
    """
    更新平安符狀態
    """
    from app.models.amulet import Amulet
    amulet = Amulet.query.get(amulet_id)
    if not amulet:
        return error_response('平安符不存在', 404)

    data = request.get_json()
    new_status = data.get('status')

    # 驗證狀態
    valid_statuses = ['active', 'inactive', 'expired']
    if new_status not in valid_statuses:
        return error_response(f'無效的狀態，必須是：{", ".join(valid_statuses)}', 400)

    old_status = amulet.status
    amulet.status = new_status

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='amulet_status_update',
        action_category='user_mgmt',
        target_type='amulet',
        target_id=amulet_id,
        description=f'管理員 {current_admin.name} 將平安符 #{amulet_id} 的狀態從 {old_status} 改為 {new_status}',
        ip_address=request.remote_addr
    )

    db.session.commit()

    return success_response({
        'amulet': amulet.to_dict(),
        'old_status': old_status,
        'new_status': new_status
    }, '狀態更新成功')

@bp.route('/amulets', methods=['POST'])
@admin_permission_required('manage_users')
def create_amulet(current_admin):
    """
    為使用者創建平安符
    """
    data = request.get_json()
    user_id = data.get('user_id')
    initial_energy = data.get('energy', 0)
    status = data.get('status', 'active')

    # 驗證使用者
    user = User.query.get(user_id)
    if not user:
        return error_response('使用者不存在', 404)

    # 檢查該使用者是否已有平安符
    from app.models.amulet import Amulet
    existing_amulet = Amulet.query.filter_by(user_id=user_id).first()
    if existing_amulet:
        return error_response('該使用者已擁有平安符', 400)

    # 驗證狀態
    valid_statuses = ['active', 'inactive', 'expired']
    if status not in valid_statuses:
        return error_response(f'無效的狀態，必須是：{", ".join(valid_statuses)}', 400)

    # 創建平安符
    amulet = Amulet(
        user_id=user_id,
        energy=initial_energy,
        status=status
    )
    db.session.add(amulet)

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='amulet_create',
        action_category='user_mgmt',
        target_type='amulet',
        target_id=None,
        description=f'管理員 {current_admin.name} 為使用者 {user.name} (ID: {user_id}) 創建了平安符，初始能量：{initial_energy}',
        ip_address=request.remote_addr
    )

    db.session.commit()

    return success_response({
        'amulet': amulet.to_dict()
    }, '平安符創建成功')

# ===== 6. 進階統計分析 =====

@bp.route('/analytics/overview', methods=['GET'])
@admin_permission_required('view_analytics')
def get_analytics_overview(current_admin):
    """
    獲取系統總覽統計
    """
    # 用戶統計
    total_users = User.query.count()
    active_users = total_users  # User model doesn't have is_active field
    new_users_today = User.query.filter(
        User.created_at >= datetime.utcnow().date()
    ).count()

    # 廟宇統計
    total_temples = Temple.query.count()
    active_temples = Temple.query.filter_by(is_active=True).count()
    pending_applications = TempleApplication.query.filter_by(status='pending').count()

    # 打卡統計
    total_checkins = Checkin.query.count()
    checkins_today = Checkin.query.filter(
        Checkin.timestamp >= datetime.utcnow().date()
    ).count()

    # 兌換訂單統計
    total_redemptions = Redemption.query.count()
    total_points_redeemed = db.session.query(func.sum(Redemption.merit_points_used)).filter(
        Redemption.status.in_(['completed', 'shipped', 'processing'])
    ).scalar() or 0

    redemptions_today = Redemption.query.filter(
        Redemption.redeemed_at >= datetime.utcnow().date()
    ).count()

    points_redeemed_today = db.session.query(func.sum(Redemption.merit_points_used)).filter(
        Redemption.redeemed_at >= datetime.utcnow().date(),
        Redemption.status.in_(['completed', 'shipped', 'processing'])
    ).scalar() or 0

    # 待處理事項
    pending_product_reviews = Product.query.filter_by(is_active=False).count()
    pending_reports = UserReport.query.filter_by(status='pending').count()

    return success_response({
        'users': {
            'total': total_users,
            'active': active_users,
            'new_today': new_users_today
        },
        'temples': {
            'total': total_temples,
            'active': active_temples,
            'pending_applications': pending_applications
        },
        'checkins': {
            'total': total_checkins,
            'today': checkins_today
        },
        'redemptions': {
            'total': total_redemptions,
            'total_points_redeemed': total_points_redeemed,
            'today': redemptions_today,
            'points_redeemed_today': points_redeemed_today
        },
        'pending_tasks': {
            'product_reviews': pending_product_reviews,
            'temple_applications': pending_applications,
            'user_reports': pending_reports
        }
    })

@bp.route('/analytics/users', methods=['GET'])
@admin_permission_required('view_analytics')
def get_user_analytics(current_admin):
    """
    獲取用戶增長統計
    """
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)

    # 每日新增用戶
    daily_users = db.session.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(
        func.date(User.created_at)
    ).all()

    # 用戶活躍度（最近30天有打卡或兌換）
    active_user_ids = db.session.query(Checkin.user_id.distinct()).filter(
        Checkin.timestamp >= start_date
    ).union(
        db.session.query(Redemption.user_id.distinct()).filter(
            Redemption.redeemed_at >= start_date
        )
    ).all()

    return success_response({
        'daily_new_users': [{'date': str(d.date), 'count': d.count} for d in daily_users],
        'active_users_count': len(active_user_ids),
        'period_days': days
    })

@bp.route('/analytics/redemptions', methods=['GET'])
@admin_permission_required('view_analytics')
def get_redemption_analytics(current_admin):
    """
    獲取兌換統計
    """
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)

    # 每日兌換統計
    daily_redemptions = db.session.query(
        func.date(Redemption.redeemed_at).label('date'),
        func.sum(Redemption.merit_points_used).label('points_used'),
        func.count(Redemption.id).label('redemption_count')
    ).filter(
        Redemption.redeemed_at >= start_date,
        Redemption.status.in_(['completed', 'shipped', 'processing'])
    ).group_by(
        func.date(Redemption.redeemed_at)
    ).all()

    # 產品兌換排行
    top_products = db.session.query(
        Product.name,
        func.sum(Redemption.merit_points_used).label('points_used'),
        func.count(Redemption.id).label('redemption_count')
    ).join(Redemption).filter(
        Redemption.redeemed_at >= start_date,
        Redemption.status.in_(['completed', 'shipped', 'processing'])
    ).group_by(Product.id, Product.name).order_by(
        func.count(Redemption.id).desc()
    ).limit(10).all()

    return success_response({
        'daily_redemptions': [{
            'date': str(d.date),
            'points_used': d.points_used or 0,
            'redemption_count': d.redemption_count
        } for d in daily_redemptions],
        'top_products': [{
            'name': p.name,
            'points_used': p.points_used or 0,
            'redemption_count': p.redemption_count
        } for p in top_products],
        'period_days': days
    })

@bp.route('/analytics/temples', methods=['GET'])
@admin_permission_required('view_analytics')
def get_temple_analytics(current_admin):
    """
    獲取廟宇統計
    """
    # 打卡最多的廟宇
    top_temples = db.session.query(
        Temple.name,
        func.count(Checkin.id).label('checkin_count')
    ).join(Checkin, Checkin.temple_id == Temple.id).group_by(
        Temple.id, Temple.name
    ).order_by(
        func.count(Checkin.id).desc()
    ).limit(10).all()

    # 各廟宇產品數量
    temple_products = db.session.query(
        Temple.name,
        func.count(Product.id).label('product_count')
    ).join(Product, Product.temple_id == Temple.id).group_by(
        Temple.id, Temple.name
    ).order_by(
        func.count(Product.id).desc()
    ).all()

    return success_response({
        'top_temples_by_checkins': [{
            'temple_name': t.name,
            'checkin_count': t.checkin_count
        } for t in top_temples],
        'temple_products': [{
            'temple_name': t.name,
            'product_count': t.product_count
        } for t in temple_products]
    })

@bp.route('/analytics/checkins', methods=['GET'])
@admin_permission_required('view_analytics')
def get_checkin_analytics(current_admin):
    """
    獲取打卡統計
    """
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)

    # 每日打卡數
    daily_checkins = db.session.query(
        func.date(Checkin.timestamp).label('date'),
        func.count(Checkin.id).label('count')
    ).filter(
        Checkin.timestamp >= start_date
    ).group_by(
        func.date(Checkin.timestamp)
    ).all()

    # 打卡最活躍用戶
    top_users = db.session.query(
        User.name,
        func.count(Checkin.id).label('checkin_count')
    ).join(Checkin).filter(
        Checkin.timestamp >= start_date
    ).group_by(
        User.id, User.name
    ).order_by(
        func.count(Checkin.id).desc()
    ).limit(10).all()

    return success_response({
        'daily_checkins': [{
            'date': str(d.date),
            'count': d.count
        } for d in daily_checkins],
        'top_users': [{
            'user_name': u.name,
            'checkin_count': u.checkin_count
        } for u in top_users],
        'period_days': days
    })

# ===== 7. 系統設定 =====

@bp.route('/settings', methods=['GET'])
@admin_permission_required('manage_settings')
def get_settings(current_admin):
    """
    獲取系統設定列表
    """
    category = request.args.get('category', '').strip()

    query = SystemSettings.query
    if category:
        query = query.filter_by(category=category)

    settings = query.order_by(SystemSettings.category, SystemSettings.key).all()

    # 按分類分組
    grouped = {}
    for setting in settings:
        if setting.category not in grouped:
            grouped[setting.category] = []
        grouped[setting.category].append(setting.to_dict())

    return success_response({
        'settings': grouped,
        'all_settings': [s.to_dict() for s in settings]
    })

@bp.route('/settings/<int:setting_id>', methods=['PUT'])
@admin_permission_required('manage_settings')
def update_setting(current_admin, setting_id):
    """
    更新系統設定
    """
    setting = SystemSettings.query.get(setting_id)
    if not setting:
        return error_response('設定不存在', 404)

    data = request.get_json()
    new_value = data.get('value')

    if new_value is None:
        return error_response('缺少參數: value', 400)

    old_value = setting.get_value()
    setting.set_value(new_value)
    setting.updated_by = current_admin.id

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='setting_update',
        action_category='system',
        target_type='setting',
        target_id=setting_id,
        description=f'管理員 {current_admin.name} 更新系統設定: {setting.key}',
        ip_address=request.remote_addr,
        changes={'value': {'old': old_value, 'new': setting.get_value()}}
    )

    db.session.commit()

    return success_response(setting.to_dict(), '設定更新成功')

@bp.route('/settings', methods=['POST'])
@admin_permission_required('manage_settings')
def create_setting(current_admin):
    """
    創建新的系統設定
    """
    data = request.get_json()
    key = data.get('key', '').strip()
    value = data.get('value')
    category = data.get('category', 'general').strip()
    data_type = data.get('data_type', 'string').strip()
    description = data.get('description', '').strip()
    is_public = data.get('is_public', False)

    if not key:
        return error_response('缺少參數: key', 400)

    # 檢查是否已存在
    existing = SystemSettings.query.filter_by(key=key).first()
    if existing:
        return error_response('該設定鍵已存在', 400)

    setting = SystemSettings(
        key=key,
        category=category,
        data_type=data_type,
        description=description,
        is_public=is_public,
        updated_by=current_admin.id
    )
    setting.set_value(value)

    db.session.add(setting)

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='setting_create',
        action_category='system',
        target_type='setting',
        description=f'管理員 {current_admin.name} 創建系統設定: {key}',
        ip_address=request.remote_addr
    )

    db.session.commit()

    return success_response(setting.to_dict(), '設定創建成功', 201)

# ===== 8. 用戶檢舉處理 =====

@bp.route('/reports', methods=['GET'])
@admin_permission_required('handle_reports')
def get_reports(current_admin):
    """
    獲取用戶檢舉列表
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '').strip()
    report_type = request.args.get('type', '').strip()

    query = UserReport.query

    if status:
        query = query.filter_by(status=status)

    if report_type:
        query = query.filter_by(report_type=report_type)

    query = query.order_by(UserReport.reported_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'reports': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })

@bp.route('/reports/<int:report_id>/handle', methods=['POST'])
@admin_permission_required('handle_reports')
def handle_report(current_admin, report_id):
    """
    處理用戶檢舉
    """
    report = UserReport.query.get(report_id)
    if not report:
        return error_response('檢舉不存在', 404)

    data = request.get_json()
    action = data.get('action', '').strip()  # processing, resolve, reject
    note = data.get('note', '').strip()
    action_taken = data.get('action_taken', '').strip()

    if action not in ['processing', 'resolve', 'reject']:
        return error_response('無效的操作類型', 400)

    if action == 'processing':
        report.start_processing(current_admin.id)
        action_desc = '開始處理'
    elif action == 'resolve':
        if not note:
            return error_response('解決檢舉必須提供備註', 400)
        report.resolve(current_admin.id, note, action_taken)
        action_desc = '解決'
    else:  # reject
        if not note:
            return error_response('拒絕檢舉必須提供原因', 400)
        report.reject(current_admin.id, note)
        action_desc = '拒絕'

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='report_handle',
        action_category='user_mgmt',
        target_type='report',
        target_id=report_id,
        description=f'管理員 {current_admin.name} {action_desc}了檢舉 #{report_id}',
        ip_address=request.remote_addr,
        changes={'status': {'old': report.status, 'new': action}, 'note': note}
    )

    db.session.commit()

    return success_response(report.to_dict(), f'檢舉{action_desc}成功')

# ===== 9. 管理員權限管理 =====

@bp.route('/admins', methods=['GET'])
@admin_permission_required('manage_admins')
def get_admins(current_admin):
    """
    獲取管理員列表
    """
    admins = SystemAdmin.query.order_by(SystemAdmin.created_at.desc()).all()
    return success_response({
        'admins': [admin.to_dict() for admin in admins]
    })

@bp.route('/admins', methods=['POST'])
@admin_permission_required('manage_admins')
def create_admin(current_admin):
    """
    創建新管理員
    """
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    role = data.get('role', 'admin').strip()
    permissions = data.get('permissions', {})

    if not username or not password or not name or not email:
        return error_response('缺少必要參數', 400)

    # 檢查用戶名是否已存在
    existing = SystemAdmin.query.filter_by(username=username).first()
    if existing:
        return error_response('用戶名已存在', 400)

    # 檢查郵箱是否已存在
    existing = SystemAdmin.query.filter_by(email=email).first()
    if existing:
        return error_response('郵箱已存在', 400)

    admin = SystemAdmin(
        username=username,
        name=name,
        email=email,
        phone=phone,
        role=role,
        permissions=permissions
    )
    admin.set_password(password)

    db.session.add(admin)

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='admin_create',
        action_category='system',
        target_type='admin',
        description=f'管理員 {current_admin.name} 創建了新管理員: {name}',
        ip_address=request.remote_addr
    )

    db.session.commit()

    return success_response(admin.to_dict(), '管理員創建成功', 201)

@bp.route('/admins/<int:admin_id>', methods=['PUT'])
@admin_permission_required('manage_admins')
def update_admin(current_admin, admin_id):
    """
    更新管理員資訊
    """
    admin = SystemAdmin.query.get(admin_id)
    if not admin:
        return error_response('管理員不存在', 404)

    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    role = data.get('role', '').strip()
    permissions = data.get('permissions')
    is_active = data.get('is_active')

    changes = {}

    if name and name != admin.name:
        changes['name'] = {'old': admin.name, 'new': name}
        admin.name = name

    if email and email != admin.email:
        # 檢查郵箱是否已被其他管理員使用
        existing = SystemAdmin.query.filter(
            SystemAdmin.email == email,
            SystemAdmin.id != admin_id
        ).first()
        if existing:
            return error_response('郵箱已被使用', 400)
        changes['email'] = {'old': admin.email, 'new': email}
        admin.email = email

    if phone is not None:
        changes['phone'] = {'old': admin.phone, 'new': phone}
        admin.phone = phone

    if role and role != admin.role:
        changes['role'] = {'old': admin.role, 'new': role}
        admin.role = role

    if permissions is not None:
        changes['permissions'] = {'old': admin.permissions, 'new': permissions}
        admin.permissions = permissions

    if is_active is not None and is_active != admin.is_active:
        changes['is_active'] = {'old': admin.is_active, 'new': is_active}
        admin.is_active = is_active

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='admin_update',
        action_category='system',
        target_type='admin',
        target_id=admin_id,
        description=f'管理員 {current_admin.name} 更新了管理員: {admin.name}',
        ip_address=request.remote_addr,
        changes=changes
    )

    db.session.commit()

    return success_response(admin.to_dict(), '管理員資訊更新成功')

@bp.route('/admins/<int:admin_id>/password', methods=['PUT'])
@admin_permission_required('manage_admins')
def reset_admin_password(current_admin, admin_id):
    """
    重置管理員密碼
    """
    admin = SystemAdmin.query.get(admin_id)
    if not admin:
        return error_response('管理員不存在', 404)

    data = request.get_json()
    new_password = data.get('new_password', '').strip()

    if not new_password or len(new_password) < 6:
        return error_response('密碼長度至少為6個字符', 400)

    admin.set_password(new_password)

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='admin_password_reset',
        action_category='system',
        target_type='admin',
        target_id=admin_id,
        description=f'管理員 {current_admin.name} 重置了管理員 {admin.name} 的密碼',
        ip_address=request.remote_addr
    )

    db.session.commit()

    return success_response(None, '密碼重置成功')

# ===== 10. 系統日誌 =====

@bp.route('/logs', methods=['GET'])
@admin_permission_required('view_logs')
def get_system_logs(current_admin):
    """
    獲取系統日誌
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    action_category = request.args.get('category', '').strip()
    action_type = request.args.get('type', '').strip()
    admin_id = request.args.get('admin_id', type=int)

    query = SystemLog.query

    if action_category:
        query = query.filter_by(action_category=action_category)

    if action_type:
        query = query.filter_by(action_type=action_type)

    if admin_id:
        query = query.filter_by(admin_id=admin_id)

    query = query.order_by(SystemLog.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'logs': [log.to_dict() for log in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })

# ===== 11. 系統公告（額外功能）=====

@bp.route('/system-announcement', methods=['POST'])
@admin_permission_required('manage_settings')
def create_system_announcement(current_admin):
    """
    創建系統公告（可用於推送通知給所有用戶）
    """
    data = request.get_json()
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()

    if not title or not content:
        return error_response('缺少標題或內容', 400)

    # 使用系統設定存儲當前公告
    SystemSettings.set_setting(
        key='system_announcement',
        value={'title': title, 'content': content, 'created_at': datetime.utcnow().isoformat()},
        admin_id=current_admin.id,
        category='general',
        data_type='json',
        description='系統公告'
    )

    # 記錄日誌
    SystemLog.log_action(
        admin_id=current_admin.id,
        action_type='system_announcement_create',
        action_category='system',
        description=f'管理員 {current_admin.name} 發布了系統公告: {title}',
        ip_address=request.remote_addr
    )

    db.session.commit()

    return success_response({
        'title': title,
        'content': content
    }, '系統公告發布成功')
