"""
資料驗證工具
"""
import re

def validate_email(email):
    """
    驗證 Email 格式
    """
    if not email:
        return False, "Email 不能為空"

    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Email 格式不正確"

    return True, None

def validate_password(password):
    """
    驗證密碼強度
    至少 6 個字元
    """
    if not password:
        return False, "密碼不能為空"

    if len(password) < 6:
        return False, "密碼至少需要 6 個字元"

    return True, None

def validate_name(name):
    """
    驗證姓名
    """
    if not name:
        return False, "姓名不能為空"

    if len(name.strip()) < 2:
        return False, "姓名至少需要 2 個字元"

    if len(name) > 100:
        return False, "姓名不能超過 100 個字元"

    return True, None

def validate_register_data(data):
    """
    驗證註冊資料
    """
    errors = {}

    # 驗證姓名
    name = data.get('name', '').strip()
    is_valid, error_msg = validate_name(name)
    if not is_valid:
        errors['name'] = error_msg

    # 驗證 Email
    email = data.get('email', '').strip()
    is_valid, error_msg = validate_email(email)
    if not is_valid:
        errors['email'] = error_msg

    # 驗證密碼
    password = data.get('password', '')
    is_valid, error_msg = validate_password(password)
    if not is_valid:
        errors['password'] = error_msg

    return len(errors) == 0, errors

def validate_login_data(data):
    """
    驗證登入資料
    """
    errors = {}

    # 驗證 Email
    email = data.get('email', '').strip()
    if not email:
        errors['email'] = "Email 不能為空"

    # 驗證密碼
    password = data.get('password', '')
    if not password:
        errors['password'] = "密碼不能為空"

    return len(errors) == 0, errors
