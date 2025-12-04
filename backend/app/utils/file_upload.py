"""
檔案上傳工具
"""
import os
import uuid
from datetime import datetime
from PIL import Image
from werkzeug.utils import secure_filename

# 允許的圖片格式
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# 圖片大小限制 (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

# 壓縮後的圖片尺寸
IMAGE_SIZES = {
    'thumbnail': (150, 150),  # 縮圖
    'medium': (800, 800),     # 中等尺寸
    'large': (1920, 1920)     # 大尺寸
}

def allowed_file(filename):
    """
    檢查檔案格式是否允許
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename, include_uuid=True):
    """
    生成唯一的檔案名稱
    格式: YYYYMMDDHHmmss_uuid.extension (如果 include_uuid=True)
    格式: YYYYMMDDHHmmss_microsecond.extension (如果 include_uuid=False)
    """
    ext = original_filename.rsplit('.', 1)[1].lower()
    now = datetime.now()
    timestamp = now.strftime('%Y%m%d_%H%M%S')

    if include_uuid:
        unique_id = str(uuid.uuid4())[:8]
        return f"{timestamp}_{unique_id}.{ext}"
    else:
        # 使用微秒確保唯一性
        microsecond = now.strftime('%f')[:3]  # 取前3位毫秒
        return f"{timestamp}_{microsecond}.{ext}"

def validate_image(file_path, max_size=MAX_FILE_SIZE):
    """
    驗證圖片檔案
    - 檢查是否為有效圖片
    - 檢查檔案大小
    """
    try:
        # 檢查檔案大小
        file_size = os.path.getsize(file_path)
        if file_size > max_size:
            return False, f'檔案大小超過限制 ({max_size / 1024 / 1024}MB)'

        # 嘗試開啟圖片
        with Image.open(file_path) as img:
            img.verify()

        return True, '驗證成功'

    except Exception as e:
        return False, f'無效的圖片檔案: {str(e)}'

def compress_and_resize_image(input_path, output_path, size_name='medium', quality=85):
    """
    壓縮和調整圖片大小

    Args:
        input_path: 輸入檔案路徑
        output_path: 輸出檔案路徑
        size_name: 尺寸名稱 (thumbnail, medium, large)
        quality: JPEG 品質 (1-100)
    """
    try:
        with Image.open(input_path) as img:
            # 轉換為 RGB (處理 PNG 透明度)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # 獲取目標尺寸
            target_size = IMAGE_SIZES.get(size_name, IMAGE_SIZES['medium'])

            # 保持寬高比例的縮放
            img.thumbnail(target_size, Image.Resampling.LANCZOS)

            # 儲存壓縮後的圖片
            img.save(output_path, 'JPEG', quality=quality, optimize=True)

        return True, output_path

    except Exception as e:
        return False, f'圖片處理失敗: {str(e)}'

def save_uploaded_image(file, upload_folder, category='products', resize=True, user_id=None):
    """
    儲存上傳的圖片

    Args:
        file: 上傳的檔案物件
        upload_folder: 上傳根目錄
        category: 類別 (products, avatars, temp)
        resize: 是否壓縮調整大小
        user_id: 用戶ID（用於建立用戶專屬資料夾）

    Returns:
        success: 是否成功
        message: 訊息
        file_info: 檔案資訊字典
    """
    try:
        # 檢查檔案
        if not file or file.filename == '':
            return False, '沒有選擇檔案', None

        # 檢查格式
        if not allowed_file(file.filename):
            return False, f'不支援的檔案格式，只允許: {", ".join(ALLOWED_EXTENSIONS)}', None

        # 生成檔案名稱（使用時間戳，不使用UUID以便追溯）
        original_filename = secure_filename(file.filename)
        new_filename = generate_unique_filename(original_filename, include_uuid=False)

        # 建立分類目錄（如果有 user_id，則在分類下建立用戶資料夾）
        if user_id:
            category_folder = os.path.join(upload_folder, category, f'user_{user_id}')
        else:
            category_folder = os.path.join(upload_folder, category)
        os.makedirs(category_folder, exist_ok=True)

        # 暫存原始檔案
        temp_path = os.path.join(upload_folder, 'temp', new_filename)
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        file.save(temp_path)

        # 驗證圖片
        is_valid, message = validate_image(temp_path)
        if not is_valid:
            os.remove(temp_path)
            return False, message, None

        # 最終路徑
        final_path = os.path.join(category_folder, new_filename)

        if resize:
            # 壓縮並調整大小
            success, result = compress_and_resize_image(temp_path, final_path)
            if not success:
                os.remove(temp_path)
                return False, result, None

            # 刪除暫存檔
            os.remove(temp_path)
        else:
            # 直接移動檔案
            os.rename(temp_path, final_path)

        # 計算相對路徑 (用於資料庫儲存和 URL)
        if user_id:
            relative_path = os.path.join(category, f'user_{user_id}', new_filename).replace('\\', '/')
        else:
            relative_path = os.path.join(category, new_filename).replace('\\', '/')

        # 取得檔案資訊
        file_info = {
            'filename': new_filename,
            'original_filename': original_filename,
            'path': relative_path,
            'full_path': final_path,
            'size': os.path.getsize(final_path),
            'url': f'/uploads/{relative_path}',
            'user_id': user_id  # 記錄用戶ID以便追溯
        }

        return True, '上傳成功', file_info

    except Exception as e:
        return False, f'上傳失敗: {str(e)}', None

def delete_file(file_path):
    """
    刪除檔案
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True, '刪除成功'
        return False, '檔案不存在'
    except Exception as e:
        return False, f'刪除失敗: {str(e)}'
