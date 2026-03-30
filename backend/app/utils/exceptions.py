"""
自定義異常類別 - 統一錯誤處理
"""


class AppError(Exception):
    """應用程式基礎異常"""
    status_code = 500
    message = '伺服器內部錯誤'

    def __init__(self, message=None, status_code=None, data=None):
        super().__init__(message or self.message)
        if message:
            self.message = message
        if status_code:
            self.status_code = status_code
        self.data = data

    def to_dict(self):
        return {
            'status': 'error',
            'message': self.message,
            'data': self.data
        }


class ValidationError(AppError):
    """驗證錯誤 (400)"""
    status_code = 400
    message = '請求資料驗證失敗'


class AuthenticationError(AppError):
    """認證錯誤 (401)"""
    status_code = 401
    message = '認證失敗，請重新登入'


class PermissionDeniedError(AppError):
    """權限不足 (403)"""
    status_code = 403
    message = '權限不足'


class NotFoundError(AppError):
    """資源不存在 (404)"""
    status_code = 404
    message = '資源不存在'


class ConflictError(AppError):
    """資源衝突 (409)"""
    status_code = 409
    message = '資源衝突'


class RateLimitError(AppError):
    """請求過於頻繁 (429)"""
    status_code = 429
    message = '請求過於頻繁，請稍後再試'
