"""
Flask App 初始化
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os

# 載入環境變數
load_dotenv()

# 初始化擴充套件
db = SQLAlchemy()
migrate = Migrate()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute"],
    storage_uri="memory://",
)

def create_app():
    import pathlib
    liff_dist = str(pathlib.Path(__file__).resolve().parent.parent.parent / 'liff' / 'dist')
    app = Flask(__name__)

    # 設定
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 初始化擴充
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    # API 文檔 (Swagger UI at /api/docs)
    from flasgger import Swagger
    app.config['SWAGGER'] = {
        'title': '廟宇管理系統 API',
        'version': '1.0.0',
        'description': '廟宇管理系統後端 RESTful API 文檔',
        'uiversion': 3,
        'specs_route': '/api/docs/',
        'securityDefinitions': {
            'Bearer': {
                'type': 'apiKey',
                'name': 'Authorization',
                'in': 'header',
                'description': 'JWT Token，格式：Bearer {token}'
            }
        }
    }
    Swagger(app)

    # 初始化日誌系統
    from app.utils.logger import setup_logging
    setup_logging(app)

    # ========================================
    # 配置 CORS - 從環境變數讀取允許的來源
    # ========================================
    cors_origins = [o.strip() for o in os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:5175').split(',') if o.strip()]
    CORS(app,
         resources={r"/api/*": {
             "origins": cors_origins,
             "allow_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"],
             "max_age": 3600
         }},
         supports_credentials=True,
         intercept_exceptions=False
    )

    # ========================================
    # 全局錯誤處理器 - 統一 JSON 回應格式
    # ========================================
    from app.utils.exceptions import AppError

    @app.errorhandler(AppError)
    def handle_app_error(error):
        return jsonify(error.to_dict()), error.status_code

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'status': 'error',
            'message': '資源不存在',
            'data': None
        }), 404

    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return jsonify({
            'status': 'error',
            'message': '請求過於頻繁，請稍後再試',
            'data': None
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': '伺服器內部錯誤，請稍後再試',
            'data': None
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        app.logger.exception('Unhandled exception: %s', error)
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': '發生未預期的錯誤',
            'data': str(error) if app.debug else None
        }), 500

    # 導入模型（讓 Flask-Migrate 能夠偵測）- 三表帳號系統
    from app.models import User, PublicUser, TempleAdminUser, SuperAdminUser, Amulet, Checkin, Energy, Temple, Product, Address, Redemption, TempleAnnouncement, CheckinReward, RewardClaim, TempleApplication, SystemSettings, SystemLog, UserReport, Notification, NotificationSettings, TempleEvent, EventRegistration, LineUser, TempleNotification, NotificationStats, NotificationTemplate, RefreshToken

    # 註冊路由（新增 temple_admin_api 為主要廟方後台 API）
    from app.routes import auth, user, amulet, checkin, energy, temple, product, address, redemption, upload, stats, leaderboard, temple_announcement, temple_admin, temple_stats, temple_revenue, temple_export, reward, admin, notification, temple_event_admin, temple_admin_api, public_event, line_webhook, temple_notification_admin

    # 新版三表系統 - 優先註冊
    app.register_blueprint(temple_admin_api.bp)  # 廟方後台 API（新版，三表系統）

    # 舊版路由（向後兼容）
    app.register_blueprint(auth.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(amulet.bp)
    app.register_blueprint(checkin.bp)
    app.register_blueprint(energy.bp)
    app.register_blueprint(temple.bp)
    app.register_blueprint(product.bp)
    app.register_blueprint(address.bp)
    app.register_blueprint(redemption.bp)
    app.register_blueprint(upload.bp)
    app.register_blueprint(stats.bp)
    app.register_blueprint(leaderboard.bp)
    app.register_blueprint(temple_announcement.bp)
    app.register_blueprint(temple_admin.bp)  # 舊版廟方 API
    app.register_blueprint(temple_stats.bp)  # 舊版統計 API
    app.register_blueprint(temple_revenue.bp)  # 舊版營收 API
    app.register_blueprint(temple_export.bp)  # 舊版匯出 API
    app.register_blueprint(reward.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(notification.bp)
    app.register_blueprint(temple_event_admin.bp)
    app.register_blueprint(temple_notification_admin.bp)  # 廟方通知管理

    # 公開 API & LINE
    app.register_blueprint(public_event.bp)    # 公開活動/報名 API
    app.register_blueprint(line_webhook.bp)    # LINE webhook

    # 排程服務（非 debug reloader 子程序才啟動）
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        from app.services.scheduler import init_scheduler
        init_scheduler(app)

    # LIFF SPA fallback — 所有 /liff/ 子路徑都回傳 index.html
    from flask import send_from_directory
    @app.route('/liff')
    @app.route('/liff/')
    @app.route('/liff/<path:path>')
    def serve_liff(path=''):
        # 如果是靜態資源（有副檔名），直接回傳檔案
        if '.' in path:
            return send_from_directory(liff_dist, path)
        # 否則回傳 index.html（SPA routing）
        return send_from_directory(liff_dist, 'index.html')

    return app
