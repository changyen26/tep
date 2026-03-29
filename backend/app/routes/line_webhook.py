"""
LINE Webhook 處理
接收 LINE 平台事件（訊息、加好友、postback 等）
"""
from flask import Blueprint, request, abort
from app import db
from app.models.line_user import LineUser
from app.models.event_registration import EventRegistration
from app.models.temple_event import TempleEvent
from app.services.line_service import (
    verify_signature, reply_message, get_profile, text_message
)
from app.utils.line_flex import (
    welcome_message, event_list_message,
    registration_list_message, registration_canceled_message
)
from app.utils.response import success_response
from datetime import datetime
from urllib.parse import parse_qs
from sqlalchemy import func

bp = Blueprint('line_webhook', __name__, url_prefix='/api/line')

# 預設 temple_id（單一廟宇模式，之後可改為動態）
DEFAULT_TEMPLE_ID = 1


@bp.route('/webhook', methods=['POST'])
def webhook():
    """
    LINE Webhook 入口
    POST /api/line/webhook
    """
    # 驗證簽章
    signature = request.headers.get('X-Line-Signature', '')
    body = request.get_data(as_text=True)

    if not verify_signature(body, signature):
        abort(403)

    data = request.get_json(silent=True) or {}
    events = data.get('events', [])

    # LINE 驗證請求（events 為空），直接回 200
    if not events:
        return success_response(None, 'OK')

    for event in events:
        event_type = event.get('type')
        try:
            if event_type == 'follow':
                handle_follow(event)
            elif event_type == 'unfollow':
                handle_unfollow(event)
            elif event_type == 'message':
                handle_message(event)
            elif event_type == 'postback':
                handle_postback(event)
        except Exception as e:
            print(f'[LINE Webhook] Error handling {event_type}: {e}')

    return success_response(None, 'OK')


# ===== 事件處理 =====

def handle_follow(event):
    """處理加好友事件"""
    user_id = event['source']['userId']
    reply_token = event['replyToken']

    # 取得用戶資料
    profile = get_profile(user_id)

    # 建立或更新 LINE 用戶紀錄
    line_user = LineUser.query.filter_by(line_user_id=user_id).first()
    if line_user:
        line_user.is_following = True
        line_user.display_name = profile.get('displayName') if profile else line_user.display_name
        line_user.picture_url = profile.get('pictureUrl') if profile else line_user.picture_url
        line_user.unfollowed_at = None
    else:
        line_user = LineUser(
            line_user_id=user_id,
            display_name=profile.get('displayName') if profile else None,
            picture_url=profile.get('pictureUrl') if profile else None,
            is_following=True,
            followed_at=datetime.utcnow(),
        )
        db.session.add(line_user)

    db.session.commit()

    # 回覆歡迎訊息
    reply_message(reply_token, welcome_message())


def handle_unfollow(event):
    """處理取消追蹤（封鎖）事件"""
    user_id = event['source']['userId']

    line_user = LineUser.query.filter_by(line_user_id=user_id).first()
    if line_user:
        line_user.is_following = False
        line_user.unfollowed_at = datetime.utcnow()
        db.session.commit()


def handle_message(event):
    """處理文字訊息"""
    if event['message']['type'] != 'text':
        return

    user_id = event['source']['userId']
    reply_token = event['replyToken']
    text = event['message']['text'].strip()

    # 關鍵字匹配
    if text in ['活動', '活動報名', '報名']:
        send_event_list(reply_token)
    elif text in ['查詢', '查詢報名', '我的報名']:
        send_my_registrations(reply_token, user_id)
    elif text in ['你好', 'hi', 'Hi', 'hello', 'Hello', '嗨']:
        reply_message(reply_token, text_message('您好！歡迎使用三官寶殿服務。\n\n輸入「活動」查看最新活動\n輸入「查詢」查看報名紀錄'))
    else:
        reply_message(reply_token, text_message('感謝您的訊息！\n\n輸入「活動」→ 查看最新活動\n輸入「查詢」→ 查看報名紀錄\n\n或點擊下方選單使用更多功能'))


def handle_postback(event):
    """處理 postback 事件（按鈕動作）"""
    user_id = event['source']['userId']
    reply_token = event['replyToken']
    postback_data = event['postback']['data']

    # 解析 postback data（格式: action=xxx&id=123）
    params = parse_qs(postback_data)
    action = params.get('action', [''])[0]

    if action == 'my_registrations':
        send_my_registrations(reply_token, user_id)

    elif action == 'cancel_registration':
        reg_id = params.get('id', [''])[0]
        if reg_id:
            cancel_user_registration(reply_token, user_id, int(reg_id))

    elif action == 'list_events':
        send_event_list(reply_token)


# ===== 回覆函式 =====

def send_event_list(reply_token):
    """回覆活動列表"""
    now = datetime.utcnow()
    events = TempleEvent.query.filter_by(
        temple_id=DEFAULT_TEMPLE_ID,
        status='published'
    ).filter(
        TempleEvent.signup_end_at > now
    ).order_by(TempleEvent.start_at.asc()).all()

    event_dicts = []
    for e in events:
        data = e.to_dict(include_registered_count=True)
        total_people = db.session.query(
            func.coalesce(func.sum(EventRegistration.people_count), 0)
        ).filter_by(event_id=e.id, status='registered').scalar()
        data['registeredCount'] = int(total_people)
        event_dicts.append(data)

    reply_message(reply_token, event_list_message(event_dicts))


def send_my_registrations(reply_token, line_user_id):
    """回覆個人報名紀錄"""
    registrations = EventRegistration.query.filter_by(
        line_user_id=line_user_id
    ).order_by(EventRegistration.registered_at.desc()).limit(10).all()

    reg_dicts = []
    for reg in registrations:
        reg_data = reg.to_dict()
        event = TempleEvent.query.get(reg.event_id)
        if event:
            reg_data['event'] = event.to_dict()
        reg_dicts.append(reg_data)

    reply_message(reply_token, registration_list_message(reg_dicts))


def cancel_user_registration(reply_token, line_user_id, registration_id):
    """透過 Bot 取消報名"""
    registration = EventRegistration.query.get(registration_id)

    if not registration or registration.line_user_id != line_user_id:
        reply_message(reply_token, text_message('找不到此報名紀錄。'))
        return

    if registration.status == 'canceled':
        reply_message(reply_token, text_message('此報名已取消。'))
        return

    event = TempleEvent.query.get(registration.event_id)
    event_title = event.title if event else '活動'

    registration.status = 'canceled'
    registration.canceled_at = datetime.utcnow()
    db.session.commit()

    reply_message(reply_token, registration_canceled_message(event_title))
