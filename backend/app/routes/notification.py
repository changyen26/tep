"""
通知 API 路由
"""
from flask import Blueprint, request
from app import db
from app.models.notification import Notification
from app.models.notification_settings import NotificationSettings
from app.utils.response import success_response, error_response
from app.utils.auth import token_required
from sqlalchemy import func

bp = Blueprint('notification', __name__, url_prefix='/api/notifications')

@bp.route('', methods=['GET'])
@token_required
def get_notifications(current_user):
    """
    獲取通知列表
    """
    # 分頁參數
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    # 篩選參數
    is_read = request.args.get('is_read', type=str)  # 'true' or 'false'
    notification_type = request.args.get('type', '').strip()

    # 構建查詢
    query = Notification.query.filter_by(user_id=current_user.id)

    # 已讀/未讀篩選
    if is_read in ['true', 'false']:
        query = query.filter_by(is_read=(is_read == 'true'))

    # 類型篩選
    if notification_type:
        query = query.filter_by(type=notification_type)

    # 按時間倒序排列
    query = query.order_by(Notification.created_at.desc())

    # 分頁
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        'notifications': [n.to_dict() for n in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    })

@bp.route('/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_as_read(current_user, notification_id):
    """
    標記通知為已讀
    """
    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=current_user.id
    ).first()

    if not notification:
        return error_response('通知不存在', 404)

    if notification.is_read:
        return success_response(notification.to_dict(), '該通知已經是已讀狀態')

    notification.mark_as_read()
    db.session.commit()

    return success_response(notification.to_dict(), '標記為已讀成功')

@bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_as_read(current_user):
    """
    標記全部通知為已讀
    """
    # 更新所有未讀通知
    updated_count = Notification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).update({
        'is_read': True,
        'read_at': db.func.now()
    }, synchronize_session=False)

    db.session.commit()

    return success_response({
        'updated_count': updated_count
    }, f'成功標記 {updated_count} 條通知為已讀')

@bp.route('/<int:notification_id>', methods=['DELETE'])
@token_required
def delete_notification(current_user, notification_id):
    """
    刪除通知
    """
    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=current_user.id
    ).first()

    if not notification:
        return error_response('通知不存在', 404)

    db.session.delete(notification)
    db.session.commit()

    return success_response(None, '通知刪除成功')

@bp.route('/unread-count', methods=['GET'])
@token_required
def get_unread_count(current_user):
    """
    獲取未讀通知數量
    """
    unread_count = Notification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).count()

    # 按類型統計未讀數量
    type_counts = db.session.query(
        Notification.type,
        func.count(Notification.id).label('count')
    ).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).group_by(Notification.type).all()

    type_breakdown = {t.type: t.count for t in type_counts}

    return success_response({
        'unread_count': unread_count,
        'type_breakdown': type_breakdown
    })

@bp.route('/settings', methods=['GET'])
@token_required
def get_notification_settings(current_user):
    """
    獲取通知設定
    """
    settings = NotificationSettings.get_or_create(current_user.id)
    db.session.commit()

    return success_response(settings.to_dict())

@bp.route('/settings', methods=['PUT'])
@token_required
def update_notification_settings(current_user):
    """
    更新通知設定
    """
    data = request.get_json()

    settings = NotificationSettings.get_or_create(current_user.id)

    # 更新各類型通知開關
    if 'reward_received' in data:
        settings.reward_received = data['reward_received']

    if 'redemption_status' in data:
        settings.redemption_status = data['redemption_status']

    if 'temple_announcement' in data:
        settings.temple_announcement = data['temple_announcement']

    if 'system_announcement' in data:
        settings.system_announcement = data['system_announcement']

    if 'checkin_milestone' in data:
        settings.checkin_milestone = data['checkin_milestone']

    if 'push_enabled' in data:
        settings.push_enabled = data['push_enabled']

    if 'email_enabled' in data:
        settings.email_enabled = data['email_enabled']

    db.session.commit()

    return success_response(settings.to_dict(), '通知設定更新成功')

# ===== 批量刪除通知 (額外功能) =====

@bp.route('/batch-delete', methods=['POST'])
@token_required
def batch_delete_notifications(current_user):
    """
    批量刪除通知
    """
    data = request.get_json()
    notification_ids = data.get('notification_ids', [])

    if not notification_ids:
        return error_response('未選擇通知', 400)

    # 刪除屬於當前用戶的指定通知
    deleted_count = Notification.query.filter(
        Notification.id.in_(notification_ids),
        Notification.user_id == current_user.id
    ).delete(synchronize_session=False)

    db.session.commit()

    return success_response({
        'deleted_count': deleted_count
    }, f'成功刪除 {deleted_count} 條通知')

# ===== 清除已讀通知 (額外功能) =====

@bp.route('/clear-read', methods=['DELETE'])
@token_required
def clear_read_notifications(current_user):
    """
    清除所有已讀通知
    """
    deleted_count = Notification.query.filter_by(
        user_id=current_user.id,
        is_read=True
    ).delete(synchronize_session=False)

    db.session.commit()

    return success_response({
        'deleted_count': deleted_count
    }, f'成功清除 {deleted_count} 條已讀通知')
