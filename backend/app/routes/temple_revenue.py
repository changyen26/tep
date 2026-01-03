"""
廟方收入報表 API

[DEPRECATED] 此模組已棄用，請改用 temple_admin_api.py
"""
from flask import Blueprint, request, jsonify

bp = Blueprint('temple_revenue', __name__, url_prefix='/api/temple-revenue')

@bp.route('/<int:temple_id>/revenue', methods=['GET'])
def get_temple_revenue(temple_id):
    """
    [DEPRECATED] 廟方收入統計
    此 API 已廢棄，請改用: GET /api/temple-admin/temples/:templeId/revenue
    """
    return jsonify({
        'status': 'error',
        'message': 'Deprecated endpoint. Please use /api/temple-admin/temples/:templeId/revenue',
        'data': None
    }), 410

@bp.route('/<int:temple_id>/revenue/summary', methods=['GET'])
def get_temple_revenue_summary(temple_id):
    """
    [DEPRECATED] 廟方收入總覽
    此 API 已廢棄，請改用: GET /api/temple-admin/temples/:templeId/revenue/summary
    """
    return jsonify({
        'status': 'error',
        'message': 'Deprecated endpoint. Please use /api/temple-admin/temples/:templeId/revenue/summary',
        'data': None
    }), 410
