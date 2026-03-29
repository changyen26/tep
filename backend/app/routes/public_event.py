"""
公開活動 / 報名 API（不需登入）
供 LIFF 頁面與 LINE Bot 使用
"""
from flask import Blueprint, request
from app import db
from app.models.temple_event import TempleEvent
from app.models.event_registration import EventRegistration
from app.models.line_user import LineUser
from app.utils.response import success_response, error_response
from app.services.line_service import push_message
from app.utils.line_flex import registration_confirm_message
from datetime import datetime
from sqlalchemy import func

bp = Blueprint('public_event', __name__, url_prefix='/api/public')


# ===== 活動列表 =====

@bp.route('/temples/<int:temple_id>/events', methods=['GET'])
def list_public_events(temple_id):
    """
    取得公開活動列表（僅 published 且報名未截止）
    GET /api/public/temples/<temple_id>/events
    """
    try:
        now = datetime.utcnow()
        query = TempleEvent.query.filter_by(
            temple_id=temple_id,
            status='published'
        ).filter(
            TempleEvent.signup_end_at > now
        ).order_by(TempleEvent.start_at.asc())

        events = []
        for event in query.all():
            data = event.to_dict(include_registered_count=True)
            # 計算報名總人數（含 people_count）
            total_people = db.session.query(
                func.coalesce(func.sum(EventRegistration.people_count), 0)
            ).filter_by(event_id=event.id, status='registered').scalar()
            data['totalPeople'] = int(total_people)
            data['remainingCapacity'] = max(0, event.capacity - int(total_people)) if event.capacity > 0 else None
            events.append(data)

        return success_response({'events': events})

    except Exception as e:
        print(f'Error in list_public_events: {e}')
        return error_response('載入活動列表失敗', 500)


@bp.route('/events/<int:event_id>', methods=['GET'])
def get_public_event(event_id):
    """
    取得單一活動詳情（公開）
    GET /api/public/events/<event_id>
    """
    try:
        event = TempleEvent.query.get(event_id)
        if not event:
            return error_response('活動不存在', 404)

        if event.status not in ['published', 'closed']:
            return error_response('此活動尚未公開', 404)

        data = event.to_dict(include_registered_count=True)

        total_people = db.session.query(
            func.coalesce(func.sum(EventRegistration.people_count), 0)
        ).filter_by(event_id=event.id, status='registered').scalar()
        data['totalPeople'] = int(total_people)
        data['remainingCapacity'] = max(0, event.capacity - int(total_people)) if event.capacity > 0 else None

        # 判斷是否可報名
        now = datetime.utcnow()
        data['canRegister'] = (
            event.status == 'published' and
            event.signup_end_at > now and
            (event.capacity == 0 or int(total_people) < event.capacity)
        )

        return success_response(data)

    except Exception as e:
        print(f'Error in get_public_event: {e}')
        return error_response('載入活動失敗', 500)


# ===== 報名 =====

@bp.route('/events/<int:event_id>/register', methods=['POST'])
def register_event(event_id):
    """
    提交活動報名
    POST /api/public/events/<event_id>/register
    Body: { name, phone, email?, peopleCount?, notes?, lineUserId? }
    """
    try:
        event = TempleEvent.query.get(event_id)
        if not event:
            return error_response('活動不存在', 404)

        # 檢查活動狀態
        if event.status != 'published':
            return error_response('此活動未開放報名', 400)

        now = datetime.utcnow()
        if event.signup_end_at <= now:
            return error_response('報名已截止', 400)

        data = request.get_json()
        if not data:
            return error_response('缺少報名資料', 400)

        # 驗證必填欄位
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        if not name or not phone:
            return error_response('姓名和電話為必填', 400)

        people_count = data.get('peopleCount', 1)
        if not isinstance(people_count, int) or people_count < 1 or people_count > 20:
            return error_response('人數必須在 1-20 之間', 400)

        line_user_id = data.get('lineUserId', '').strip() or None

        # 檢查容量
        if event.capacity > 0:
            total_people = db.session.query(
                func.coalesce(func.sum(EventRegistration.people_count), 0)
            ).filter_by(event_id=event.id, status='registered').scalar()

            if int(total_people) + people_count > event.capacity:
                remaining = event.capacity - int(total_people)
                return error_response(f'名額不足，目前剩餘 {max(0, remaining)} 名', 400)

        # 檢查同一 LINE 用戶是否已報名
        if line_user_id:
            existing = EventRegistration.query.filter_by(
                event_id=event_id,
                line_user_id=line_user_id,
                status='registered'
            ).first()
            if existing:
                return error_response('您已報名此活動', 400)

        # 建立報名紀錄
        registration = EventRegistration(
            event_id=event_id,
            name=name,
            phone=phone,
            email=data.get('email', '').strip(),
            people_count=people_count,
            notes=data.get('notes', '').strip(),
            line_user_id=line_user_id,
            status='registered',
        )
        db.session.add(registration)

        # 更新 LINE 用戶的聯絡資訊
        if line_user_id:
            line_user = LineUser.query.filter_by(line_user_id=line_user_id).first()
            if line_user:
                if phone and not line_user.phone:
                    line_user.phone = phone
                if data.get('email') and not line_user.email:
                    line_user.email = data.get('email', '').strip()

        db.session.commit()

        reg_data = registration.to_dict()

        # 推播報名確認訊息
        if line_user_id:
            try:
                flex = registration_confirm_message(reg_data, event.to_dict())
                push_message(line_user_id, flex)
            except Exception as push_err:
                print(f'[LINE] push confirm error: {push_err}')

        return success_response(reg_data, '報名成功', 201)

    except Exception as e:
        db.session.rollback()
        print(f'Error in register_event: {e}')
        return error_response('報名失敗', 500)


# ===== 查詢個人報名 =====

@bp.route('/registrations', methods=['GET'])
def my_registrations():
    """
    查詢個人報名紀錄（by LINE user ID）
    GET /api/public/registrations?line_uid=Uxxxxx
    """
    try:
        line_uid = request.args.get('line_uid', '').strip()
        if not line_uid:
            return error_response('缺少 line_uid 參數', 400)

        registrations = EventRegistration.query.filter_by(
            line_user_id=line_uid
        ).order_by(EventRegistration.registered_at.desc()).all()

        result = []
        for reg in registrations:
            reg_data = reg.to_dict()
            # 附帶活動資訊
            event = TempleEvent.query.get(reg.event_id)
            if event:
                reg_data['event'] = event.to_dict()
            result.append(reg_data)

        return success_response({'registrations': result})

    except Exception as e:
        print(f'Error in my_registrations: {e}')
        return error_response('查詢報名紀錄失敗', 500)


# ===== 取消報名 =====

@bp.route('/registrations/<int:registration_id>/cancel', methods=['PUT'])
def cancel_registration(registration_id):
    """
    取消報名
    PUT /api/public/registrations/<id>/cancel
    Body: { lineUserId? }（驗證身份）
    """
    try:
        registration = EventRegistration.query.get(registration_id)
        if not registration:
            return error_response('報名紀錄不存在', 404)

        # 驗證身份（透過 LINE user ID）
        data = request.get_json() or {}
        line_uid = data.get('lineUserId', '').strip()
        if registration.line_user_id and line_uid != registration.line_user_id:
            return error_response('無權取消此報名', 403)

        if registration.status == 'canceled':
            return error_response('此報名已取消', 400)

        registration.status = 'canceled'
        registration.canceled_at = datetime.utcnow()
        db.session.commit()

        return success_response(registration.to_dict(), '已取消報名')

    except Exception as e:
        db.session.rollback()
        print(f'Error in cancel_registration: {e}')
        return error_response('取消報名失敗', 500)
