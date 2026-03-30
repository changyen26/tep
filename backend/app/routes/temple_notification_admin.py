"""
廟方通知管理 API
"""
from flask import Blueprint, request
from app.utils.logger import get_logger
from app import db
from app.models.temple_notification import TempleNotification, NotificationStats, NotificationTemplate
from app.models.temple_admin import TempleAdmin
from app.models.temple_admin_user import TempleAdminUser
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from app.services.notification_service import count_audience, send_notification
from datetime import datetime

logger = get_logger('routes.temple_notification_admin')

bp = Blueprint('temple_notification_admin', __name__, url_prefix='/api/temple-admin/notifications')


def check_temple_permission(current_user, temple_id):
    # 新版三表系統：TempleAdminUser 直接帶 temple_id
    if isinstance(current_user, TempleAdminUser):
        return current_user.temple_id == int(temple_id) and current_user.is_active
    # 舊版：透過 TempleAdmin 關聯表查詢
    admin = TempleAdmin.query.filter_by(
        user_id=current_user.id,
        temple_id=temple_id,
        is_active=True
    ).first()
    return admin is not None


# ─── 通知列表 ────────────────────────────────────────────────────────────────

@bp.route('/', methods=['GET'])
@token_required
def list_notifications(current_user):
    """GET /api/temple-admin/notifications/?temple_id=&status=&page=&pageSize="""
    try:
        temple_id = request.args.get('temple_id', type=int)
        if not temple_id:
            return error_response('缺少 temple_id 參數', 400)
        if not check_temple_permission(current_user, temple_id):
            return error_response('無權限', 403)

        status = request.args.get('status', 'all')
        page = request.args.get('page', 1, type=int)
        page_size = min(request.args.get('pageSize', 20, type=int), 100)

        query = TempleNotification.query.filter_by(temple_id=temple_id)
        if status and status != 'all':
            query = query.filter_by(status=status)

        query = query.order_by(TempleNotification.created_at.desc())
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)

        return success_response({
            'items': [n.to_dict() for n in pagination.items],
            'total': pagination.total,
            'page': page,
            'pageSize': page_size,
            'totalPages': pagination.pages,
        })
    except Exception as e:
        logger.error('list error: %s', e)
        return error_response('載入通知列表失敗', 500)


# ─── 通知詳情 ────────────────────────────────────────────────────────────────

@bp.route('/<int:notification_id>', methods=['GET'])
@token_required
def get_notification(current_user, notification_id):
    """GET /api/temple-admin/notifications/<id>"""
    try:
        notif = TempleNotification.query.get(notification_id)
        if not notif:
            return error_response('通知不存在', 404)
        if not check_temple_permission(current_user, notif.temple_id):
            return error_response('無權限', 403)
        return success_response(notif.to_dict(include_stats=True))
    except Exception as e:
        logger.error('get error: %s', e)
        return error_response('載入通知失敗', 500)


# ─── 建立通知 ────────────────────────────────────────────────────────────────

@bp.route('/', methods=['POST'])
@token_required
def create_notification(current_user):
    """POST /api/temple-admin/notifications/"""
    try:
        data = request.get_json() or {}
        temple_id = data.get('templeId')
        if not temple_id:
            return error_response('缺少 templeId', 400)
        if not check_temple_permission(current_user, temple_id):
            return error_response('無權限', 403)

        title = (data.get('title') or '').strip()
        content = (data.get('content') or '').strip()
        if not title or not content:
            return error_response('標題與內容不可為空', 400)

        notif = TempleNotification(
            temple_id=temple_id,
            title=title,
            content=content,
            channels=data.get('channels', ['line']),
            target_audience=data.get('targetAudience', 'all'),
            target_event_id=data.get('targetEventId'),
            target_filters=data.get('targetFilters'),
            image_url=data.get('imageUrl'),
            status='draft',
            created_by=current_user.id,
        )
        db.session.add(notif)
        db.session.flush()  # 取得 id

        # 預估受眾數
        notif.target_count = count_audience(
            temple_id,
            notif.target_audience,
            notif.target_event_id,
            notif.target_filters,
        )
        db.session.commit()
        return success_response(notif.to_dict(), '通知已建立', 201)
    except Exception as e:
        db.session.rollback()
        logger.error('create error: %s', e)
        return error_response('建立通知失敗', 500)


# ─── 編輯草稿 ────────────────────────────────────────────────────────────────

@bp.route('/<int:notification_id>', methods=['PUT'])
@token_required
def update_notification(current_user, notification_id):
    """PUT /api/temple-admin/notifications/<id>"""
    try:
        notif = TempleNotification.query.get(notification_id)
        if not notif:
            return error_response('通知不存在', 404)
        if not check_temple_permission(current_user, notif.temple_id):
            return error_response('無權限', 403)
        if notif.status not in ('draft', 'scheduled'):
            return error_response('只能編輯草稿或排程中的通知', 400)

        data = request.get_json() or {}
        if 'title' in data:
            notif.title = data['title'].strip()
        if 'content' in data:
            notif.content = data['content'].strip()
        if 'channels' in data:
            notif.channels = data['channels']
        if 'targetAudience' in data:
            notif.target_audience = data['targetAudience']
            notif.target_event_id = data.get('targetEventId')
            notif.target_filters = data.get('targetFilters')
            notif.target_count = count_audience(
                notif.temple_id,
                notif.target_audience,
                notif.target_event_id,
                notif.target_filters,
            )
        if 'imageUrl' in data:
            notif.image_url = data['imageUrl']

        db.session.commit()
        return success_response(notif.to_dict())
    except Exception as e:
        db.session.rollback()
        logger.error('update error: %s', e)
        return error_response('更新通知失敗', 500)


# ─── 刪除草稿 ────────────────────────────────────────────────────────────────

@bp.route('/<int:notification_id>', methods=['DELETE'])
@token_required
def delete_notification(current_user, notification_id):
    """DELETE /api/temple-admin/notifications/<id>"""
    try:
        notif = TempleNotification.query.get(notification_id)
        if not notif:
            return error_response('通知不存在', 404)
        if not check_temple_permission(current_user, notif.temple_id):
            return error_response('無權限', 403)
        if notif.status not in ('draft',):
            return error_response('只能刪除草稿', 400)

        db.session.delete(notif)
        db.session.commit()
        return success_response(None, '已刪除')
    except Exception as e:
        db.session.rollback()
        logger.error('delete error: %s', e)
        return error_response('刪除失敗', 500)


# ─── 立即發送 ────────────────────────────────────────────────────────────────

@bp.route('/<int:notification_id>/send', methods=['POST'])
@token_required
def send_now(current_user, notification_id):
    """POST /api/temple-admin/notifications/<id>/send"""
    try:
        notif = TempleNotification.query.get(notification_id)
        if not notif:
            return error_response('通知不存在', 404)
        if not check_temple_permission(current_user, notif.temple_id):
            return error_response('無權限', 403)
        if notif.status not in ('draft', 'scheduled'):
            return error_response('此通知無法發送', 400)

        ok = send_notification(notification_id)
        if ok:
            db.session.refresh(notif)
            return success_response(notif.to_dict(include_stats=True), '發送成功')
        return error_response('發送失敗', 500)
    except Exception as e:
        logger.error('send error: %s', e)
        return error_response('發送失敗', 500)


# ─── 設定排程 ────────────────────────────────────────────────────────────────

@bp.route('/<int:notification_id>/schedule', methods=['POST'])
@token_required
def schedule_notification(current_user, notification_id):
    """POST /api/temple-admin/notifications/<id>/schedule  body: {scheduledAt: ISO}"""
    try:
        notif = TempleNotification.query.get(notification_id)
        if not notif:
            return error_response('通知不存在', 404)
        if not check_temple_permission(current_user, notif.temple_id):
            return error_response('無權限', 403)
        if notif.status not in ('draft',):
            return error_response('只能對草稿設定排程', 400)

        data = request.get_json() or {}
        scheduled_at_str = data.get('scheduledAt')
        if not scheduled_at_str:
            return error_response('缺少 scheduledAt', 400)

        scheduled_at = datetime.fromisoformat(scheduled_at_str.replace('Z', '+00:00'))
        if scheduled_at <= datetime.utcnow():
            return error_response('排程時間必須在未來', 400)

        notif.scheduled_at = scheduled_at
        notif.status = 'scheduled'
        db.session.commit()
        return success_response(notif.to_dict(), '排程已設定')
    except Exception as e:
        db.session.rollback()
        logger.error('schedule error: %s', e)
        return error_response('設定排程失敗', 500)


# ─── 取消排程 ────────────────────────────────────────────────────────────────

@bp.route('/<int:notification_id>/cancel-schedule', methods=['POST'])
@token_required
def cancel_schedule(current_user, notification_id):
    """POST /api/temple-admin/notifications/<id>/cancel-schedule"""
    try:
        notif = TempleNotification.query.get(notification_id)
        if not notif:
            return error_response('通知不存在', 404)
        if not check_temple_permission(current_user, notif.temple_id):
            return error_response('無權限', 403)
        if notif.status != 'scheduled':
            return error_response('此通知不在排程中', 400)

        notif.status = 'draft'
        notif.scheduled_at = None
        db.session.commit()
        return success_response(notif.to_dict(), '排程已取消')
    except Exception as e:
        db.session.rollback()
        logger.error('cancel schedule error: %s', e)
        return error_response('取消排程失敗', 500)


# ─── 預估受眾人數 ─────────────────────────────────────────────────────────────

@bp.route('/audience-count', methods=['GET'])
@token_required
def audience_count(current_user):
    """GET /api/temple-admin/notifications/audience-count?temple_id=&targetAudience=&targetEventId="""
    try:
        temple_id = request.args.get('temple_id', type=int)
        if not temple_id:
            return error_response('缺少 temple_id', 400)
        if not check_temple_permission(current_user, temple_id):
            return error_response('無權限', 403)

        target_audience = request.args.get('targetAudience', 'all')
        target_event_id = request.args.get('targetEventId', type=int)

        cnt = count_audience(temple_id, target_audience, target_event_id)
        return success_response({'count': cnt})
    except Exception as e:
        logger.error('audience-count error: %s', e)
        return error_response('計算受眾失敗', 500)


# ─── 模板列表 ────────────────────────────────────────────────────────────────

@bp.route('/templates', methods=['GET'])
@token_required
def list_templates(current_user):
    """GET /api/temple-admin/notifications/templates?temple_id="""
    try:
        temple_id = request.args.get('temple_id', type=int)
        if not temple_id:
            return error_response('缺少 temple_id', 400)
        if not check_temple_permission(current_user, temple_id):
            return error_response('無權限', 403)

        templates = NotificationTemplate.query.filter_by(temple_id=temple_id).order_by(
            NotificationTemplate.is_default.desc(),
            NotificationTemplate.usage_count.desc()
        ).all()
        return success_response([t.to_dict() for t in templates])
    except Exception as e:
        logger.error('list templates error: %s', e)
        return error_response('載入模板失敗', 500)


@bp.route('/templates', methods=['POST'])
@token_required
def create_template(current_user):
    """POST /api/temple-admin/notifications/templates"""
    try:
        data = request.get_json() or {}
        temple_id = data.get('templeId')
        if not temple_id:
            return error_response('缺少 templeId', 400)
        if not check_temple_permission(current_user, temple_id):
            return error_response('無權限', 403)

        tmpl = NotificationTemplate(
            temple_id=temple_id,
            name=(data.get('name') or '').strip(),
            category=data.get('category', 'custom'),
            title=(data.get('title') or '').strip(),
            content=(data.get('content') or '').strip(),
        )
        if not tmpl.name or not tmpl.title or not tmpl.content:
            return error_response('名稱、標題、內容不可為空', 400)

        db.session.add(tmpl)
        db.session.commit()
        return success_response(tmpl.to_dict(), '模板已建立', 201)
    except Exception as e:
        db.session.rollback()
        logger.error('create template error: %s', e)
        return error_response('建立模板失敗', 500)


@bp.route('/templates/<int:template_id>', methods=['PUT'])
@token_required
def update_template(current_user, template_id):
    """PUT /api/temple-admin/notifications/templates/<id>"""
    try:
        tmpl = NotificationTemplate.query.get(template_id)
        if not tmpl:
            return error_response('模板不存在', 404)
        if not check_temple_permission(current_user, tmpl.temple_id):
            return error_response('無權限', 403)
        if tmpl.is_default:
            return error_response('系統預設模板不可修改', 400)

        data = request.get_json() or {}
        if 'name' in data:
            tmpl.name = data['name'].strip()
        if 'category' in data:
            tmpl.category = data['category']
        if 'title' in data:
            tmpl.title = data['title'].strip()
        if 'content' in data:
            tmpl.content = data['content'].strip()

        db.session.commit()
        return success_response(tmpl.to_dict())
    except Exception as e:
        db.session.rollback()
        logger.error('update template error: %s', e)
        return error_response('更新模板失敗', 500)


@bp.route('/templates/<int:template_id>', methods=['DELETE'])
@token_required
def delete_template(current_user, template_id):
    """DELETE /api/temple-admin/notifications/templates/<id>"""
    try:
        tmpl = NotificationTemplate.query.get(template_id)
        if not tmpl:
            return error_response('模板不存在', 404)
        if not check_temple_permission(current_user, tmpl.temple_id):
            return error_response('無權限', 403)
        if tmpl.is_default:
            return error_response('系統預設模板不可刪除', 400)

        db.session.delete(tmpl)
        db.session.commit()
        return success_response(None, '已刪除')
    except Exception as e:
        db.session.rollback()
        logger.error('delete template error: %s', e)
        return error_response('刪除模板失敗', 500)
