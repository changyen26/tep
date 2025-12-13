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
        if 'images' in data:
            temple.images = data['images']
        if 'phone' in data:
            temple.phone = data['phone']
        if 'email' in data:
            temple.email = data['email']
        if 'website' in data:
            temple.website = data['website']
        if 'opening_hours' in data:
            temple.opening_hours = data['opening_hours']
        if 'checkin_radius' in data:
            temple.checkin_radius = data['checkin_radius']
        if 'checkin_merit_points' in data:
            temple.checkin_merit_points = data['checkin_merit_points']
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

# ===== 廟宇簽到功能 =====

@bp.route('/<int:temple_id>/checkin', methods=['POST'])
@token_required
def temple_checkin(current_user, temple_id):
    """
    在廟宇簽到
    POST /api/temples/<temple_id>/checkin
    Header: Authorization: Bearer <token>
    Body: {
        "amulet_id": 1,
        "checkin_method": "nfc",  // nfc, qr_code, manual
        "latitude": 25.0330,  // 可選
        "longitude": 121.5654,  // 可選
        "notes": "參拜備註"  // 可選
    }
    """
    try:
        from app.models.amulet import Amulet
        from app.models.checkin import Checkin
        from app.models.energy import Energy
        from datetime import datetime, timedelta

        data = request.get_json()

        # 驗證必填欄位
        if not data or 'amulet_id' not in data:
            return error_response('缺少必填欄位', 400)

        amulet_id = data['amulet_id']
        checkin_method = data.get('checkin_method', 'manual')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        notes = data.get('notes', '')

        # 驗證廟宇是否存在且啟用
        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        if not temple.is_active:
            return error_response('此廟宇暫不開放簽到', 400)

        # 驗證護身符是否存在且屬於當前用戶
        amulet = Amulet.query.get(amulet_id)
        if not amulet:
            return error_response('護身符不存在', 404)

        if amulet.user_id != current_user.id:
            return error_response('這不是您的護身符', 403)

        if amulet.status != 'active':
            return error_response('護身符狀態異常，無法簽到', 400)

        # 檢查今日是否已在此廟宇簽到
        today = datetime.utcnow().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())

        existing_checkin = Checkin.query.filter(
            Checkin.user_id == current_user.id,
            Checkin.temple_id == temple_id,
            Checkin.timestamp >= today_start,
            Checkin.timestamp <= today_end
        ).first()

        if existing_checkin:
            return error_response('今日已在此廟宇簽到', 400)

        # 位置驗證（如果提供了經緯度且廟宇有座標）
        if latitude and longitude and temple.latitude and temple.longitude:
            distance = calculate_distance(
                latitude, longitude,
                temple.latitude, temple.longitude
            )
            # 必須在廟宇 1 公里範圍內
            if distance > 1.0:
                return error_response(f'您距離廟宇太遠（{distance:.2f}公里），無法簽到', 400)

        # 計算獲得的功德值（在廟宇簽到獲得更多）
        blessing_points = 20  # 廟宇簽到獲得 20 點（比一般簽到的 10 點多）

        # 創建簽到記錄
        checkin = Checkin(
            user_id=current_user.id,
            amulet_id=amulet_id,
            temple_id=temple_id,
            latitude=latitude,
            longitude=longitude,
            notes=notes,
            blessing_points=blessing_points
        )
        db.session.add(checkin)

        # 增加護身符能量
        amulet.energy += blessing_points

        # 增加用戶功德值
        current_user.blessing_points += blessing_points

        # 創建能量記錄
        energy_log = Energy(
            user_id=current_user.id,
            amulet_id=amulet_id,
            energy_added=blessing_points
        )
        db.session.add(energy_log)

        # 更新廟宇簽到統計（如果有 checkin_count 欄位）
        if hasattr(temple, 'checkin_count'):
            temple.checkin_count = (temple.checkin_count or 0) + 1

        db.session.commit()

        return success_response({
            'checkin': checkin.to_dict(),
            'amulet': {
                'id': amulet.id,
                'energy': amulet.energy
            },
            'blessing_points_gained': blessing_points,
            'current_blessing_points': current_user.blessing_points,
            'temple': temple.to_dict()
        }, f'在 {temple.name} 簽到成功！獲得 {blessing_points} 點功德值', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'簽到失敗: {str(e)}', 500)

@bp.route('/<int:temple_id>/my-checkins', methods=['GET'])
@token_required
def get_my_temple_checkins(current_user, temple_id):
    """
    獲取我在此廟宇的簽到記錄
    GET /api/temples/<temple_id>/my-checkins
    Header: Authorization: Bearer <token>
    Query Parameters:
        - limit: 數量限制 (default: 20)
    """
    try:
        from app.models.checkin import Checkin

        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        limit = request.args.get('limit', default=20, type=int)

        checkins = Checkin.query.filter_by(
            user_id=current_user.id,
            temple_id=temple_id
        ).order_by(
            Checkin.timestamp.desc()
        ).limit(limit).all()

        total_visits = Checkin.query.filter_by(
            user_id=current_user.id,
            temple_id=temple_id
        ).count()

        total_points = db.session.query(
            func.sum(Checkin.blessing_points)
        ).filter(
            Checkin.user_id == current_user.id,
            Checkin.temple_id == temple_id
        ).scalar() or 0

        return success_response({
            'temple': temple.to_dict(),
            'checkins': [c.to_dict() for c in checkins],
            'statistics': {
                'total_visits': total_visits,
                'total_points_gained': int(total_points),
                'showing': len(checkins)
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/nearby/available', methods=['GET'])
@token_required
def get_nearby_available_temples(current_user):
    """
    獲取附近可簽到的廟宇（排除今日已簽到的）
    GET /api/temples/nearby/available
    Header: Authorization: Bearer <token>
    Query Parameters:
        - latitude: 當前緯度 (必需)
        - longitude: 當前經度 (必需)
        - radius: 搜索半徑（公里）(default: 10)
        - limit: 返回數量 (default: 20)
    """
    try:
        from app.models.checkin import Checkin
        from datetime import datetime

        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        radius = request.args.get('radius', default=10, type=float)
        limit = request.args.get('limit', default=20, type=int)

        if not latitude or not longitude:
            return error_response('缺少經緯度參數', 400)

        # 獲取今日已簽到的廟宇 ID
        today = datetime.utcnow().date()
        today_start = datetime.combine(today, datetime.min.time())

        checked_in_temple_ids = db.session.query(Checkin.temple_id).filter(
            Checkin.user_id == current_user.id,
            Checkin.timestamp >= today_start,
            Checkin.temple_id.isnot(None)
        ).distinct().all()
        checked_in_temple_ids = [t[0] for t in checked_in_temple_ids]

        # 獲取所有啟用的廟宇（有座標的）
        temples = Temple.query.filter(
            Temple.is_active == True,
            Temple.latitude.isnot(None),
            Temple.longitude.isnot(None)
        ).all()

        # 計算距離並篩選
        nearby_temples = []
        for temple in temples:
            distance = calculate_distance(
                latitude, longitude,
                temple.latitude, temple.longitude
            )

            if distance <= radius:
                temple_dict = temple.to_dict()
                temple_dict['distance'] = round(distance, 2)
                temple_dict['checked_in_today'] = temple.id in checked_in_temple_ids
                temple_dict['available'] = temple.id not in checked_in_temple_ids
                nearby_temples.append(temple_dict)

        # 按距離排序
        nearby_temples.sort(key=lambda x: x['distance'])

        # 限制返回數量
        nearby_temples = nearby_temples[:limit]

        # 統計
        available_count = len([t for t in nearby_temples if t['available']])
        checked_in_count = len([t for t in nearby_temples if not t['available']])

        return success_response({
            'temples': nearby_temples,
            'search_center': {
                'latitude': latitude,
                'longitude': longitude
            },
            'radius': radius,
            'statistics': {
                'total': len(nearby_temples),
                'available': available_count,
                'checked_in_today': checked_in_count
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)
