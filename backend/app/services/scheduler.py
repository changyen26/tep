"""
排程服務 - 處理排程通知的自動發送
使用 APScheduler BackgroundScheduler
"""
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.utils.logger import get_logger

logger = get_logger('services.scheduler')

_scheduler = None


def check_scheduled_notifications():
    """每分鐘執行：掃描到期的排程通知並發送"""
    from app import create_app
    app = create_app()
    with app.app_context():
        try:
            from app.models.temple_notification import TempleNotification
            from app.services.notification_service import send_notification

            now = datetime.utcnow()
            due = TempleNotification.query.filter(
                TempleNotification.status == 'scheduled',
                TempleNotification.scheduled_at <= now
            ).all()

            for notif in due:
                logger.info(f'[Scheduler] firing notification {notif.id}: {notif.title}')
                send_notification(notif.id)
        except Exception as e:
            logger.error(f'[Scheduler] error: {e}')


def init_scheduler(app):
    """在 app factory 中呼叫以啟動排程器"""
    global _scheduler
    if _scheduler is not None:
        return  # 避免重複初始化（werkzeug reloader 會啟動兩次）

    _scheduler = BackgroundScheduler(daemon=True)
    _scheduler.add_job(
        func=check_scheduled_notifications,
        trigger=IntervalTrigger(minutes=1),
        id='check_scheduled_notifications',
        replace_existing=True,
    )
    _scheduler.start()
    logger.info('[Scheduler] started — checking scheduled notifications every minute')
