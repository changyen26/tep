"""
Flask App 初始化
"""
from flask import Flask
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
    CORS(app)

    # 導入模型（讓 Flask-Migrate 能夠偵測）
    from app.models import User, Amulet, Checkin, Energy, Temple, Product, Address, Redemption

    # 註冊路由
    from app.routes import auth, user, amulet, checkin, energy, temple, product, address, redemption, upload
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

    return app
