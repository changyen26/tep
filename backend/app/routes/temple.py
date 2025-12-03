"""
廟宇 API
"""
from flask import Blueprint, request
from app import db
from app.models.temple import Temple
from app.utils.auth import token_required, admin_required
from app.utils.response import success_response, error_response
from sqlalchemy import func, or_
import math

bp = Blueprint('temple', __name__, url_prefix='/api/temples')

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    計算兩個地理坐標之間的距離（使用 Haversine 公式）
    返回值單位：公里
    """
    R = 6371  # 地球半徑（公里）

    lat1, lon1, lat2, lon2 = map(math.radians, [float(lat1), float(lon1), float(lat2), float(lon2)])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    return R * c

@bp.route('/', methods=['GET'])
def get_temples():
    """
    獲取廟宇列表
    GET /api/temples/
    Query Parameters:
        - is_active: 是否啟用 (true/false)
        - search: 搜索關鍵字（廟宇名稱或主祀神明）
        - limit: 每頁數量 (default: 50)
        - offset: 偏移量 (default: 0)
    """
    try:
        is_active = request.args.get('is_active')
        search = request.args.get('search')
        limit = request.args.get('limit', default=50, type=int)
        offset = request.args.get('offset', default=0, type=int)

        query = Temple.query

        # 篩選啟用狀態
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            query = query.filter_by(is_active=is_active_bool)

        # 搜索
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                or_(
                    Temple.name.like(search_pattern),
                    Temple.main_deity.like(search_pattern),
                    Temple.address.like(search_pattern)
                )
            )

        # 獲取總數
        total = query.count()

        # 分頁
        temples = query.order_by(Temple.created_at.desc()).limit(limit).offset(offset).all()

        return success_response({
            'temples': [temple.to_simple_dict() for temple in temples],
            'total': total,
            'limit': limit,
            'offset': offset
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>', methods=['GET'])
def get_temple(temple_id):
    """
    獲取廟宇詳情
    GET /api/temples/<temple_id>
    """
    try:
        temple = Temple.query.get(temple_id)

        if not temple:
            return error_response('廟宇不存在', 404)

        # 獲取簽到統計
        checkin_count = temple.checkins.count() if temple.checkins else 0

        temple_data = temple.to_dict()
        temple_data['checkin_count'] = checkin_count

        return success_response(temple_data, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/nearby', methods=['GET'])
def get_nearby_temples():
    """
    獲取附近廟宇
    GET /api/temples/nearby
    Query Parameters:
        - latitude: 當前緯度 (required)
        - longitude: 當前經度 (required)
        - radius: 搜索半徑（公里）(default: 10)
        - limit: 返回數量 (default: 20)
    """
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        radius = request.args.get('radius', default=10, type=float)
        limit = request.args.get('limit', default=20, type=int)

        if latitude is None or longitude is None:
            return error_response('缺少經緯度參數', 400)

        # 獲取所有有地理位置的廟宇
        temples = Temple.query.filter(
            Temple.latitude.isnot(None),
            Temple.longitude.isnot(None),
            Temple.is_active == True
        ).all()

        # 計算距離並篩選
        nearby_temples = []
        for temple in temples:
            distance = calculate_distance(latitude, longitude, temple.latitude, temple.longitude)
            if distance <= radius:
                temple_dict = temple.to_dict()
                temple_dict['distance'] = round(distance, 2)  # 距離（公里）
                nearby_temples.append(temple_dict)

        # 按距離排序
        nearby_temples.sort(key=lambda x: x['distance'])

        # 限制返回數量
        nearby_temples = nearby_temples[:limit]

        return success_response({
            'temples': nearby_temples,
            'count': len(nearby_temples),
            'search_center': {
                'latitude': latitude,
                'longitude': longitude
            },
            'radius': radius
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

# ===== 管理員 API =====

@bp.route('/admin/temples', methods=['POST'])
@admin_required
def create_temple(current_user):
    """
    管理員：創建廟宇
    POST /api/temples/admin/temples
    Header: Authorization: Bearer <token> (需要管理員權限)
    Body: {
        "name": "廟宇名稱",
        "address": "廟宇地址",
        "latitude": 25.0330,
        "longitude": 121.5654,
        "main_deity": "主祀神明",
        "description": "廟宇描述",
        "nfc_uid": "NFC UID (可選)"
    }
    """
    try:
        data = request.get_json()

        if not data or 'name' not in data:
            return error_response('缺少廟宇名稱', 400)

        # 檢查 NFC UID 是否重複
        if 'nfc_uid' in data and data['nfc_uid']:
            existing_temple = Temple.query.filter_by(nfc_uid=data['nfc_uid']).first()
            if existing_temple:
                return error_response('此 NFC UID 已被使用', 400)

        # 創建廟宇
        temple = Temple(
            name=data['name'],
            address=data.get('address'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            main_deity=data.get('main_deity'),
            description=data.get('description'),
            nfc_uid=data.get('nfc_uid'),
            is_active=data.get('is_active', True)
        )

        db.session.add(temple)
        db.session.commit()

        return success_response(temple.to_dict(), '廟宇創建成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'創建失敗: {str(e)}', 500)

@bp.route('/admin/temples/<int:temple_id>', methods=['PUT'])
@admin_required
def update_temple(current_user, temple_id):
    """
    管理員：更新廟宇
    PUT /api/temples/admin/temples/<temple_id>
    Header: Authorization: Bearer <token> (需要管理員權限)
    """
    try:
        temple = Temple.query.get(temple_id)

        if not temple:
            return error_response('廟宇不存在', 404)

        data = request.get_json()

        # 檢查 NFC UID 是否重複
        if 'nfc_uid' in data and data['nfc_uid']:
            existing_temple = Temple.query.filter(
                Temple.nfc_uid == data['nfc_uid'],
                Temple.id != temple_id
            ).first()
            if existing_temple:
                return error_response('此 NFC UID 已被使用', 400)

        # 更新欄位
        if 'name' in data:
            temple.name = data['name']
        if 'address' in data:
            temple.address = data['address']
        if 'latitude' in data:
            temple.latitude = data['latitude']
        if 'longitude' in data:
            temple.longitude = data['longitude']
        if 'main_deity' in data:
            temple.main_deity = data['main_deity']
        if 'description' in data:
            temple.description = data['description']
        if 'nfc_uid' in data:
            temple.nfc_uid = data['nfc_uid']
        if 'is_active' in data:
            temple.is_active = data['is_active']

        db.session.commit()

        return success_response(temple.to_dict(), '更新成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

@bp.route('/admin/temples/<int:temple_id>', methods=['DELETE'])
@admin_required
def delete_temple(current_user, temple_id):
    """
    管理員：刪除廟宇
    DELETE /api/temples/admin/temples/<temple_id>
    Header: Authorization: Bearer <token> (需要管理員權限)
    """
    try:
        temple = Temple.query.get(temple_id)

        if not temple:
            return error_response('廟宇不存在', 404)

        db.session.delete(temple)
        db.session.commit()

        return success_response(None, '刪除成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'刪除失敗: {str(e)}', 500)
