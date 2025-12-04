"""
檔案上傳 API
"""
import os
from flask import Blueprint, request, send_from_directory, current_app
from app import db
from app.models.product import Product
from app.models.user import User
from app.utils.auth import token_required, admin_required
from app.utils.response import success_response, error_response
from app.utils.file_upload import save_uploaded_image, delete_file

bp = Blueprint('upload', __name__, url_prefix='/api/uploads')

# 上傳目錄路徑
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')

@bp.route('/image', methods=['POST'])
@token_required
def upload_image(current_user):
    """
    通用圖片上傳
    POST /api/uploads/image
    Header: Authorization: Bearer <token>
    Form Data:
        - file: 圖片檔案
        - category: 分類 (products, avatars, temp) 預設: temp
    """
    try:
        # 檢查是否有檔案
        if 'file' not in request.files:
            return error_response('沒有上傳檔案', 400)

        file = request.files['file']
        category = request.form.get('category', 'temp')

        # 驗證分類
        if category not in ['products', 'avatars', 'temp']:
            return error_response('無效的分類', 400)

        # 儲存圖片（傳入用戶ID以便按用戶分類）
        success, message, file_info = save_uploaded_image(
            file,
            UPLOAD_FOLDER,
            category=category,
            resize=True,
            user_id=current_user.id
        )

        if not success:
            return error_response(message, 400)

        return success_response(file_info, '上傳成功', 201)

    except Exception as e:
        return error_response(f'上傳失敗: {str(e)}', 500)

@bp.route('/product/<int:product_id>/image', methods=['POST'])
@admin_required
def upload_product_image(current_user, product_id):
    """
    上傳商品圖片
    POST /api/uploads/product/<product_id>/image
    Header: Authorization: Bearer <token> (需要管理員權限)
    Form Data:
        - file: 圖片檔案
    """
    try:
        # 檢查商品是否存在
        product = Product.query.get(product_id)
        if not product:
            return error_response('商品不存在', 404)

        # 檢查是否有檔案
        if 'file' not in request.files:
            return error_response('沒有上傳檔案', 400)

        file = request.files['file']

        # 刪除舊圖片
        if product.image_url:
            old_path = os.path.join(UPLOAD_FOLDER, product.image_url.replace('/uploads/', ''))
            delete_file(old_path)

        # 儲存新圖片（商品圖片使用上傳者的用戶ID）
        success, message, file_info = save_uploaded_image(
            file,
            UPLOAD_FOLDER,
            category='products',
            resize=True,
            user_id=current_user.id
        )

        if not success:
            return error_response(message, 400)

        # 更新商品圖片 URL
        product.image_url = file_info['url']
        db.session.commit()

        return success_response({
            'product_id': product_id,
            'image_url': file_info['url'],
            'file_info': file_info
        }, '上傳成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'上傳失敗: {str(e)}', 500)

@bp.route('/avatar', methods=['POST'])
@token_required
def upload_avatar(current_user):
    """
    上傳用戶頭像
    POST /api/uploads/avatar
    Header: Authorization: Bearer <token>
    Form Data:
        - file: 圖片檔案
    """
    try:
        # 檢查是否有檔案
        if 'file' not in request.files:
            return error_response('沒有上傳檔案', 400)

        file = request.files['file']

        # 刪除舊頭像
        if hasattr(current_user, 'avatar_url') and current_user.avatar_url:
            old_path = os.path.join(UPLOAD_FOLDER, current_user.avatar_url.replace('/uploads/', ''))
            delete_file(old_path)

        # 儲存新頭像（使用當前用戶ID）
        success, message, file_info = save_uploaded_image(
            file,
            UPLOAD_FOLDER,
            category='avatars',
            resize=True,
            user_id=current_user.id
        )

        if not success:
            return error_response(message, 400)

        # 更新用戶頭像 URL (假設 User 模型有 avatar_url 欄位)
        # current_user.avatar_url = file_info['url']
        # db.session.commit()

        return success_response({
            'image_url': file_info['url'],
            'file_info': file_info
        }, '上傳成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'上傳失敗: {str(e)}', 500)

@bp.route('/<path:filename>')
def serve_file(filename):
    """
    提供檔案訪問
    GET /api/uploads/<filename>
    """
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        return error_response('檔案不存在', 404)

@bp.route('/delete', methods=['POST'])
@token_required
def delete_uploaded_file(current_user):
    """
    刪除上傳的檔案
    POST /api/uploads/delete
    Header: Authorization: Bearer <token>
    Body: {
        "file_path": "products/filename.jpg"
    }
    """
    try:
        data = request.get_json()

        if not data or 'file_path' not in data:
            return error_response('缺少檔案路徑', 400)

        file_path = data['file_path']
        full_path = os.path.join(UPLOAD_FOLDER, file_path.replace('/uploads/', ''))

        # 安全檢查：確保路徑在 uploads 目錄內
        if not full_path.startswith(UPLOAD_FOLDER):
            return error_response('無效的檔案路徑', 400)

        success, message = delete_file(full_path)

        if success:
            return success_response(None, message, 200)
        else:
            return error_response(message, 404)

    except Exception as e:
        return error_response(f'刪除失敗: {str(e)}', 500)
