"""
Flask App 初始化
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
import os

# 載入環境變數
load_dotenv()

# 初始化擴充套件
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # 設定
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 初始化擴充
    db.init_app(app)
    migrate.init_app(app, db)

    # ========================================
    # 配置 CORS - 重要：必須對所有響應生效（包括錯誤）
    # ========================================
    CORS(app,
         resources={r"/api/*": {
             "origins": ["http://localhost:5173", "http://localhost:5174"],
             "allow_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"],
             "max_age": 3600
         }},
         supports_credentials=True,
         intercept_exceptions=False  # 關鍵：確保異常響應也有 CORS headers
    )

    # ========================================
    # 全局錯誤處理器 - 確保所有錯誤都返回 JSON 格式並帶 CORS headers
    # ========================================
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'status': 'error',
            'message': '資源不存在',
            'data': None
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()  # 回滾任何失敗的資料庫操作
        return jsonify({
            'status': 'error',
            'message': '伺服器內部錯誤，請稍後再試',
            'data': str(error) if app.debug else None
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        # 記錄錯誤（production 環境應該使用 logging）
        if app.debug:
            print(f"Unhandled Exception: {error}")
            import traceback
            traceback.print_exc()

        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': '發生未預期的錯誤',
            'data': str(error) if app.debug else None
        }), 500

    # 導入模型（讓 Flask-Migrate 能夠偵測）- 包含三表帳號系統
    from app.models import User, PublicUser, TempleAdminUser, SuperAdminUser, Amulet, Checkin, Energy, Temple, Product, Address, Redemption, TempleAnnouncement, TempleAdmin, CheckinReward, RewardClaim, SystemAdmin, TempleApplication, SystemSettings, SystemLog, UserReport, Notification, NotificationSettings, TempleEvent, EventRegistration

    # 註冊路由（新增 temple_admin_api 為主要廟方後台 API）
    from app.routes import auth, user, amulet, checkin, energy, temple, product, address, redemption, upload, stats, leaderboard, temple_announcement, temple_admin, temple_stats, temple_revenue, temple_export, reward, admin, notification, temple_event_admin, temple_admin_api

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

    return app
