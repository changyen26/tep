"""
統一回應格式工具
"""
from flask import jsonify

def success_response(data=None, message='Success', code=200):
    """成功回應"""
    return jsonify({
        'success': True,
        'message': message,
        'data': data
    }), code

def error_response(message='Error', code=400, errors=None):
    """錯誤回應"""
    response = {
        'success': False,
        'message': message
    }
    if errors:
        response['errors'] = errors
    return jsonify(response), code
