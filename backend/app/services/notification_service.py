"""
廟方通知服務
- 受眾解析
- 發送邏輯（LINE multicast + APP 站內通知）
"""
from datetime import datetime, timedelta
from app import db
from app.models.line_user import LineUser
from app.models.event_registration import EventRegistration
from app.models.lamp_application import LampApplication
from app.models.notification import Notification
from app.models.temple_notification import TempleNotification, NotificationStats
from app.services import line_service
from app.utils.line_flex import temple_notification_message
from app.utils.logger import get_logger

logger = get_logger('services.notification_service')


# LINE multicast 每次上限 500 人
MULTICAST_CHUNK_SIZE = 500


def resolve_line_user_ids(temple_id, target_audience, target_event_id=None, target_filters=None):
    """
    根據受眾條件查出 LINE user ID 字串列表。
    只回傳目前仍在追蹤 (is_following=True) 的用戶。
    """
    filters = target_filters or {}
    now = datetime.utcnow()

    if target_audience == 'all':
        users = LineUser.query.filter_by(is_following=True).all()
        return [u.line_user_id for u in users]

    if target_audience == 'new':
        cutoff = now - timedelta(days=30)
        users = LineUser.query.filter(
            LineUser.is_following == True,
            LineUser.followed_at >= cutoff
        ).all()
        return [u.line_user_id for u in users]

    if target_audience == 'active':
        # 30 天內有 EventRegistration（透過 line_user_id 直接關聯）
        cutoff = now - timedelta(days=30)
        active_ids = db.session.query(EventRegistration.line_user_id).filter(
            EventRegistration.line_user_id.isnot(None),
            EventRegistration.registered_at >= cutoff
        ).distinct().all()
        active_set = {r[0] for r in active_ids}
        users = LineUser.query.filter(
            LineUser.is_following == True,
            LineUser.line_user_id.in_(active_set)
        ).all()
        return [u.line_user_id for u in users]

    if target_audience == 'dormant':
        # 超過 90 天無 EventRegistration 活動
        cutoff = now - timedelta(days=90)
        active_ids = db.session.query(EventRegistration.line_user_id).filter(
            EventRegistration.line_user_id.isnot(None),
            EventRegistration.registered_at >= cutoff
        ).distinct().all()
        active_set = {r[0] for r in active_ids}
        users = LineUser.query.filter(
            LineUser.is_following == True,
            ~LineUser.line_user_id.in_(active_set)
        ).all()
        return [u.line_user_id for u in users]

    if target_audience == 'lamp_expiring':
        # 30 天內點燈到期，透過電話號碼對應 LineUser
        today = now.date()
        expiry_cutoff = today + timedelta(days=30)
        expiring_phones = db.session.query(LampApplication.applicant_phone).filter(
            LampApplication.temple_id == temple_id,
            LampApplication.status.in_(['paid', 'active', 'pending']),
            LampApplication.end_date >= today,
            LampApplication.end_date <= expiry_cutoff
        ).distinct().all()
        phone_set = {r[0] for r in expiring_phones if r[0]}
        if not phone_set:
            return []
        users = LineUser.query.filter(
            LineUser.is_following == True,
            LineUser.phone.in_(phone_set)
        ).all()
        return [u.line_user_id for u in users]

    if target_audience == 'event_registered':
        if not target_event_id:
            return []
        regs = EventRegistration.query.filter(
            EventRegistration.event_id == target_event_id,
            EventRegistration.line_user_id.isnot(None),
            EventRegistration.status.in_(['registered', 'waitlist'])
        ).all()
        line_ids = {r.line_user_id for r in regs}
        users = LineUser.query.filter(
            LineUser.is_following == True,
            LineUser.line_user_id.in_(line_ids)
        ).all()
        return [u.line_user_id for u in users]

    if target_audience == 'custom':
        # 依 EventRegistration 次數篩選
        min_reg = filters.get('minCheckins')
        max_reg = filters.get('maxCheckins')
        # 取得所有追蹤者
        all_users = LineUser.query.filter_by(is_following=True).all()
        if not min_reg and not max_reg:
            return [u.line_user_id for u in all_users]

        # 計算每個 line_user_id 的報名次數
        from sqlalchemy import func
        reg_counts = dict(
            db.session.query(
                EventRegistration.line_user_id,
                func.count(EventRegistration.id)
            ).filter(
                EventRegistration.line_user_id.isnot(None)
            ).group_by(EventRegistration.line_user_id).all()
        )

        result = []
        for u in all_users:
            count = reg_counts.get(u.line_user_id, 0)
            if min_reg and count < int(min_reg):
                continue
            if max_reg and count > int(max_reg):
                continue
            result.append(u.line_user_id)
        return result

    # 預設回傳全部
    users = LineUser.query.filter_by(is_following=True).all()
    return [u.line_user_id for u in users]


def count_audience(temple_id, target_audience, target_event_id=None, target_filters=None):
    """預估受眾人數（不做完整查詢，盡量輕量）"""
    ids = resolve_line_user_ids(temple_id, target_audience, target_event_id, target_filters)
    return len(ids)


def send_notification(notification_id):
    """
    執行通知發送。
    更新 status -> sending -> sent/failed
    """
    notif = TempleNotification.query.get(notification_id)
    if not notif:
        logger.info(f'[Notify] notification {notification_id} not found')
        return False

    if notif.status not in ('draft', 'scheduled'):
        logger.info(f'[Notify] notification {notification_id} status={notif.status}, skip')
        return False

    notif.status = 'sending'
    db.session.commit()

    try:
        channels = notif.channels or ['line']
        line_ids = resolve_line_user_ids(
            notif.temple_id,
            notif.target_audience,
            notif.target_event_id,
            notif.target_filters
        )
        notif.target_count = len(line_ids)
        total_sent = 0

        # ── LINE 推播 ──────────────────────────────────────────
        if 'line' in channels and line_ids:
            flex_msg = temple_notification_message(
                title=notif.title,
                content=notif.content,
                image_url=notif.image_url,
            )

            # 分批發送（每批 500）
            line_sent = 0
            for i in range(0, len(line_ids), MULTICAST_CHUNK_SIZE):
                chunk = line_ids[i:i + MULTICAST_CHUNK_SIZE]
                resp = line_service.multicast_message(chunk, [flex_msg])
                if resp and resp.ok:
                    line_sent += len(chunk)
                else:
                    logger.error(f'[Notify] LINE multicast chunk {i} failed')

            # 寫入統計
            stats = NotificationStats(
                notification_id=notif.id,
                channel='line',
                sent=line_sent,
            )
            db.session.add(stats)
            total_sent += line_sent

        # ── APP 站內通知 ───────────────────────────────────────
        if 'app' in channels:
            # 透過 LineUser.phone 找到對應 User，發站內通知
            app_sent = _send_app_notifications(notif, line_ids)
            stats_app = NotificationStats(
                notification_id=notif.id,
                channel='app',
                sent=app_sent,
            )
            db.session.add(stats_app)
            total_sent += app_sent

        notif.sent_count = total_sent
        notif.status = 'sent'
        notif.sent_at = datetime.utcnow()
        db.session.commit()
        logger.info(f'[Notify] notification {notification_id} sent to {total_sent} users')
        return True

    except Exception as e:
        logger.error(f'[Notify] send error: {e}')
        notif.status = 'failed'
        db.session.commit()
        return False


def _send_app_notifications(notif, line_ids):
    """透過 phone 對應找 User，發站內 Notification"""
    if not line_ids:
        return 0

    # 找出有 phone 的 LineUser
    line_users = LineUser.query.filter(
        LineUser.line_user_id.in_(line_ids),
        LineUser.phone.isnot(None)
    ).all()

    if not line_users:
        return 0

    phones = [u.phone for u in line_users]

    # 透過 phone 找 User
    from app.models.user import User
    users = User.query.filter(User.phone.in_(phones)).all()
    if not users:
        return 0

    count = 0
    for user in users:
        n = Notification(
            user_id=user.id,
            type='temple_announcement',
            title=notif.title,
            content=notif.content,
            related_type='temple_notification',
            related_id=notif.id,
        )
        db.session.add(n)
        count += 1

    return count
