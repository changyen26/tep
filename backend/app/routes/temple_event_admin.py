"""
廟方活動管理 API（僅廟方管理員使用）
"""
from flask import Blueprint, request
from app import db
from app.models.temple_event import TempleEvent
from app.models.event_registration import EventRegistration
from app.models.temple_admin import TempleAdmin
from app.utils.auth import token_required
from app.utils.response import success_response, error_response
from datetime import datetime
from sqlalchemy import or_

bp = Blueprint('temple_event_admin', __name__, url_prefix='/api/temple-admin/events')


def check_temple_permission(current_user, temple_id):
    """檢查使用者是否為該廟宇的管理員"""
    admin = TempleAdmin.query.filter_by(
        user_id=current_user.id,
        temple_id=temple_id,
        is_active=True
    ).first()
    return admin is not None


@bp.route('/', methods=['GET'])
@token_required
def list_events(current_user):
    """
    獲取活動列表（限自己廟宇）
    GET /api/temple-admin/events/?status=all&q=&page=1&pageSize=20
    需從 token 或 request 中取得 temple_id
    """
    try:
        # 從 query params 獲取 temple_id（或從 session/token）
        temple_id = request.args.get('temple_id', type=int)

        if not temple_id:
            return error_response('缺少 temple_id 參數', 400)

        # 檢查權限
        if not check_temple_permission(current_user, temple_id):
            return error_response('無權限存取此廟宇的活動', 403)

        # 取得篩選參數
        status = request.args.get('status', 'all')
        keyword = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 20, type=int)

        # 基礎查詢
        query = TempleEvent.query.filter_by(temple_id=temple_id)

        # 狀態篩選
        if status and status != 'all':
            query = query.filter_by(status=status)

        # 關鍵字搜尋（標題、地點）
        if keyword:
            query = query.filter(
                or_(
                    TempleEvent.title.like(f'%{keyword}%'),
                    TempleEvent.location.like(f'%{keyword}%')
                )
            )

        # 排序：最新的在前
        query = query.order_by(TempleEvent.created_at.desc())

        # 分頁
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)

        # 轉換為字典，包含報名人數
        events = [event.to_dict(include_registered_count=True) for event in pagination.items]

        return success_response({
            'events': events,
            'total': pagination.total,
            'page': page,
            'pageSize': page_size,
            'totalPages': pagination.pages
        })

    except Exception as e:
        print(f'Error in list_events: {str(e)}')
        return error_response('載入活動列表失敗', 500)


@bp.route('/<int:event_id>/', methods=['GET'])
@token_required
def get_event(current_user, event_id):
    """
    獲取單一活動詳情
    GET /api/temple-admin/events/<id>/
    """
    try:
        event = TempleEvent.query.get(event_id)
        if not event:
            return error_response('活動不存在', 404)

        # 檢查權限
        if not check_temple_permission(current_user, event.temple_id):
            return error_response('無權限存取此活動', 403)

        return success_response(event.to_dict(include_registered_count=True))

    except Exception as e:
        print(f'Error in get_event: {str(e)}')
        return error_response('載入活動失敗', 500)


@bp.route('/', methods=['POST'])
@token_required
def create_event(current_user):
    """
    新增活動（草稿狀態）
    POST /api/temple-admin/events/
    Body: {
        "templeId": 1,
        "title": "活動名稱",
        "description": "活動說明",
        "location": "地點",
        "startAt": "2026-01-15T14:00",
        "endAt": "2026-01-15T17:00",
        "signupEndAt": "2026-01-10T23:59",
        "capacity": 30,
        "fee": 300,
        "coverImageUrl": "https://..."
    }
    """
    try:
        data = request.get_json()

        # 驗證必要欄位
        required_fields = ['templeId', 'title', 'description', 'location', 'startAt', 'endAt', 'signupEndAt', 'capacity']
        for field in required_fields:
            if field not in data:
                return error_response(f'缺少必要欄位: {field}', 400)

        temple_id = data['templeId']

        # 檢查權限
        if not check_temple_permission(current_user, temple_id):
            return error_response('無權限建立此廟宇的活動', 403)

        # 轉換日期時間
        try:
            start_at = datetime.fromisoformat(data['startAt'].replace('Z', '+00:00'))
            end_at = datetime.fromisoformat(data['endAt'].replace('Z', '+00:00'))
            signup_end_at = datetime.fromisoformat(data['signupEndAt'].replace('Z', '+00:00'))
        except ValueError:
            return error_response('日期時間格式錯誤', 400)

        # 驗證規則
        if start_at >= end_at:
            return error_response('活動結束時間必須晚於開始時間', 400)

        if signup_end_at > start_at:
            return error_response('報名截止時間不可晚於活動開始時間', 400)

        capacity = int(data['capacity'])
        if capacity < 1:
            return error_response('名額必須至少為 1', 400)

        fee = float(data.get('fee', 0))
        if fee < 0:
            return error_response('費用不可為負數', 400)

        # 建立活動
        event = TempleEvent(
            temple_id=temple_id,
            title=data['title'],
            description=data['description'],
            location=data['location'],
            start_at=start_at,
            end_at=end_at,
            signup_end_at=signup_end_at,
            capacity=capacity,
            fee=fee,
            cover_image_url=data.get('coverImageUrl'),
            status='draft',
            created_by=current_user.id
        )

        db.session.add(event)
        db.session.commit()

        return success_response(event.to_dict(), '活動建立成功', 201)

    except Exception as e:
        db.session.rollback()
        print(f'Error in create_event: {str(e)}')
        return error_response('建立活動失敗', 500)


@bp.route('/<int:event_id>/', methods=['PUT'])
@token_required
def update_event(current_user, event_id):
    """
    更新活動（不允許直接改 status）
    PUT /api/temple-admin/events/<id>/
    """
    try:
        event = TempleEvent.query.get(event_id)
        if not event:
            return error_response('活動不存在', 404)

        # 檢查權限
        if not check_temple_permission(current_user, event.temple_id):
            return error_response('無權限更新此活動', 403)

        data = request.get_json()

        # 更新欄位（不包含 status）
        if 'title' in data:
            event.title = data['title']
        if 'description' in data:
            event.description = data['description']
        if 'location' in data:
            event.location = data['location']

        # 更新時間欄位
        if 'startAt' in data:
            event.start_at = datetime.fromisoformat(data['startAt'].replace('Z', '+00:00'))
        if 'endAt' in data:
            event.end_at = datetime.fromisoformat(data['endAt'].replace('Z', '+00:00'))
        if 'signupEndAt' in data:
            event.signup_end_at = datetime.fromisoformat(data['signupEndAt'].replace('Z', '+00:00'))

        # 驗證時間邏輯
        if event.start_at >= event.end_at:
            return error_response('活動結束時間必須晚於開始時間', 400)

        if event.signup_end_at > event.start_at:
            return error_response('報名截止時間不可晚於活動開始時間', 400)

        if 'capacity' in data:
            capacity = int(data['capacity'])
            if capacity < 1:
                return error_response('名額必須至少為 1', 400)
            event.capacity = capacity

        if 'fee' in data:
            fee = float(data['fee'])
            if fee < 0:
                return error_response('費用不可為負數', 400)
            event.fee = fee

        if 'coverImageUrl' in data:
            event.cover_image_url = data['coverImageUrl']

        event.updated_at = datetime.utcnow()
        db.session.commit()

        return success_response(event.to_dict(), '活動更新成功')

    except Exception as e:
        db.session.rollback()
        print(f'Error in update_event: {str(e)}')
        return error_response('更新活動失敗', 500)


@bp.route('/<int:event_id>/publish/', methods=['POST'])
@token_required
def publish_event(current_user, event_id):
    """
    發布活動（draft -> published）
    POST /api/temple-admin/events/<id>/publish/
    """
    try:
        event = TempleEvent.query.get(event_id)
        if not event:
            return error_response('活動不存在', 404)

        # 檢查權限
        if not check_temple_permission(current_user, event.temple_id):
            return error_response('無權限操作此活動', 403)

        # 驗證狀態轉換
        if event.status != 'draft':
            return error_response('只有草稿狀態的活動可以發布', 400)

        event.status = 'published'
        event.updated_at = datetime.utcnow()
        db.session.commit()

        return success_response(event.to_dict(), '活動已發布')

    except Exception as e:
        db.session.rollback()
        print(f'Error in publish_event: {str(e)}')
        return error_response('發布活動失敗', 500)


@bp.route('/<int:event_id>/close/', methods=['POST'])
@token_required
def close_event(current_user, event_id):
    """
    提前截止活動（published -> closed）
    POST /api/temple-admin/events/<id>/close/
    """
    try:
        event = TempleEvent.query.get(event_id)
        if not event:
            return error_response('活動不存在', 404)

        # 檢查權限
        if not check_temple_permission(current_user, event.temple_id):
            return error_response('無權限操作此活動', 403)

        # 驗證狀態轉換
        if event.status != 'published':
            return error_response('只有已發布的活動可以提前截止', 400)

        event.status = 'closed'
        event.updated_at = datetime.utcnow()
        db.session.commit()

        return success_response(event.to_dict(), '活動已截止報名')

    except Exception as e:
        db.session.rollback()
        print(f'Error in close_event: {str(e)}')
        return error_response('截止活動失敗', 500)


@bp.route('/<int:event_id>/cancel/', methods=['POST'])
@token_required
def cancel_event(current_user, event_id):
    """
    取消活動（published/closed -> canceled）
    POST /api/temple-admin/events/<id>/cancel/
    """
    try:
        event = TempleEvent.query.get(event_id)
        if not event:
            return error_response('活動不存在', 404)

        # 檢查權限
        if not check_temple_permission(current_user, event.temple_id):
            return error_response('無權限操作此活動', 403)

        # 驗證狀態轉換
        if event.status not in ['published', 'closed']:
            return error_response('只有已發布或已截止的活動可以取消', 400)

        event.status = 'canceled'
        event.updated_at = datetime.utcnow()
        db.session.commit()

        return success_response(event.to_dict(), '活動已取消')

    except Exception as e:
        db.session.rollback()
        print(f'Error in cancel_event: {str(e)}')
        return error_response('取消活動失敗', 500)


@bp.route('/<int:event_id>/registrations/', methods=['GET'])
@token_required
def list_registrations(current_user, event_id):
    """
    獲取活動報名名單
    GET /api/temple-admin/events/<id>/registrations/?status=all&q=&page=1&pageSize=20
    """
    try:
        event = TempleEvent.query.get(event_id)
        if not event:
            return error_response('活動不存在', 404)

        # 檢查權限
        if not check_temple_permission(current_user, event.temple_id):
            return error_response('無權限存取此活動的報名名單', 403)

        # 取得篩選參數
        status = request.args.get('status', 'all')
        keyword = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 20, type=int)

        # 基礎查詢
        query = EventRegistration.query.filter_by(event_id=event_id)

        # 狀態篩選
        if status and status != 'all':
            query = query.filter_by(status=status)

        # 關鍵字搜尋（姓名、電話、email）
        if keyword:
            query = query.filter(
                or_(
                    EventRegistration.name.like(f'%{keyword}%'),
                    EventRegistration.phone.like(f'%{keyword}%'),
                    EventRegistration.email.like(f'%{keyword}%')
                )
            )

        # 排序：最新報名在前
        query = query.order_by(EventRegistration.registered_at.desc())

        # 分頁
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)

        registrations = [reg.to_dict() for reg in pagination.items]

        return success_response({
            'registrations': registrations,
            'total': pagination.total,
            'page': page,
            'pageSize': page_size,
            'totalPages': pagination.pages
        })

    except Exception as e:
        print(f'Error in list_registrations: {str(e)}')
        return error_response('載入報名名單失敗', 500)
