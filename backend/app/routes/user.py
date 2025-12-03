"""
使用者相關 API
"""
from flask import Blueprint, request, jsonify

bp = Blueprint('user', __name__, url_prefix='/api/user')

# API 端點將在後續實作
