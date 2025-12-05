"""
廟宇公告 API
"""
from flask import Blueprint, request
from app import db
from app.models.temple_announcement import TempleAnnouncement
from app.models.temple import Temple
from app.utils.auth import token_required
from app.utils.temple_auth import temple_admin_required
from app.utils.response import success_response, error_response
from datetime import datetime

bp = Blueprint('temple_announcement', __name__, url_prefix='/api/temple-announcements')

@bp.route('/', methods=['POST'])
@token_required
def create_announcement(current_user):
    """
    創建廟宇公告（需廟方管理員權限）
    POST /api/temple-announcements/
    Header: Authorization: Bearer <token>
    Body: {
        "temple_id": 1,
        "title": "公告標題",
        "content": "公告內容",
        "type": "event",
        "priority": "normal",
        "image_url": "https://...",
        "start_date": "2025-01-01T00:00:00",
        "end_date": "2025-12-31T23:59:59",
        "is_published": true
    }
    """
    try:
        data = request.get_json()

        # 驗證必要欄位
        required_fields = ['temple_id', 'title', 'content', 'type']
        for field in required_fields:
            if field not in data:
                return error_response(f'缺少必要欄位: {field}', 400)

        temple_id = data['temple_id']

        # 驗證廟宇是否存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        # 檢查使用者是否為該廟宇的管理員
        from app.models.temple_admin import TempleAdmin
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('manage_announcements'):
            return error_response('您沒有權限在此廟宇發布公告', 403)

        # 驗證公告類型
        valid_types = ['event', 'festival', 'maintenance', 'news', 'important']
        if data['type'] not in valid_types:
            return error_response(f'無效的公告類型，必須是: {", ".join(valid_types)}', 400)

        # 驗證優先級
        priority = data.get('priority', 'normal')
        valid_priorities = ['low', 'normal', 'high', 'urgent']
        if priority not in valid_priorities:
            return error_response(f'無效的優先級，必須是: {", ".join(valid_priorities)}', 400)

        # 處理日期
        start_date = None
        end_date = None
        if 'start_date' in data and data['start_date']:
            try:
                start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
            except ValueError:
                return error_response('start_date 格式錯誤', 400)

        if 'end_date' in data and data['end_date']:
            try:
                end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
            except ValueError:
                return error_response('end_date 格式錯誤', 400)

        # 創建公告
        announcement = TempleAnnouncement(
            temple_id=temple_id,
            title=data['title'],
            content=data['content'],
            type=data['type'],
            priority=priority,
            image_url=data.get('image_url'),
            start_date=start_date,
            end_date=end_date,
            is_published=data.get('is_published', False),
            created_by=current_user.id
        )

        db.session.add(announcement)
        db.session.commit()

        return success_response(
            announcement.to_dict(),
            '公告創建成功',
            201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f'創建失敗: {str(e)}', 500)

@bp.route('/', methods=['GET'])
def get_announcements():
    """
    獲取公告列表（公開）
    GET /api/temple-announcements/
    Query Parameters:
        - temple_id: 廟宇 ID (可選)
        - type: 公告類型 (可選)
        - is_published: 是否已發布 (default: true)
        - page: 頁碼 (default: 1)
        - per_page: 每頁數量 (default: 20, max: 100)
    """
    try:
        temple_id = request.args.get('temple_id', type=int)
        announcement_type = request.args.get('type')
        is_published = request.args.get('is_published', default='true').lower() == 'true'
        page = request.args.get('page', default=1, type=int)
        per_page = min(request.args.get('per_page', default=20, type=int), 100)

        # 構建查詢
        query = TempleAnnouncement.query

        # 篩選條件
        if temple_id:
            query = query.filter_by(temple_id=temple_id)

        if announcement_type:
            query = query.filter_by(type=announcement_type)

        query = query.filter_by(is_published=is_published)

        # 只顯示有效期內的公告
        now = datetime.utcnow()
        query = query.filter(
            db.or_(
                TempleAnnouncement.start_date.is_(None),
                TempleAnnouncement.start_date <= now
            )
        ).filter(
            db.or_(
                TempleAnnouncement.end_date.is_(None),
                TempleAnnouncement.end_date >= now
            )
        )

        # 分頁查詢（按優先級和創建時間排序）
        priority_order = db.case(
            (TempleAnnouncement.priority == 'urgent', 1),
            (TempleAnnouncement.priority == 'high', 2),
            (TempleAnnouncement.priority == 'normal', 3),
            (TempleAnnouncement.priority == 'low', 4),
            else_=5
        )

        pagination = query.order_by(
            priority_order,
            TempleAnnouncement.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return success_response({
            'announcements': [ann.to_simple_dict() for ann in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:announcement_id>', methods=['GET'])
def get_announcement_detail(announcement_id):
    """
    獲取公告詳情（公開，增加瀏覽次數）
    GET /api/temple-announcements/<announcement_id>
    """
    try:
        announcement = TempleAnnouncement.query.filter_by(
            id=announcement_id,
            is_published=True
        ).first()

        if not announcement:
            return error_response('公告不存在', 404)

        # 增加瀏覽次數
        announcement.increment_view_count()

        return success_response(
            announcement.to_dict(),
            '獲取成功',
            200
        )

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:announcement_id>', methods=['PUT'])
@token_required
def update_announcement(current_user, announcement_id):
    """
    更新公告（需廟方管理員權限）
    PUT /api/temple-announcements/<announcement_id>
    Header: Authorization: Bearer <token>
    """
    try:
        announcement = TempleAnnouncement.query.get(announcement_id)
        if not announcement:
            return error_response('公告不存在', 404)

        # 檢查權限
        from app.models.temple_admin import TempleAdmin
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=announcement.temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('manage_announcements'):
            return error_response('您沒有權限修改此公告', 403)

        data = request.get_json()

        # 更新欄位
        if 'title' in data:
            announcement.title = data['title']
        if 'content' in data:
            announcement.content = data['content']
        if 'type' in data:
            valid_types = ['event', 'festival', 'maintenance', 'news', 'important']
            if data['type'] not in valid_types:
                return error_response(f'無效的公告類型', 400)
            announcement.type = data['type']
        if 'priority' in data:
            valid_priorities = ['low', 'normal', 'high', 'urgent']
            if data['priority'] not in valid_priorities:
                return error_response(f'無效的優先級', 400)
            announcement.priority = data['priority']
        if 'image_url' in data:
            announcement.image_url = data['image_url']
        if 'is_published' in data:
            announcement.is_published = data['is_published']

        # 更新日期
        if 'start_date' in data:
            if data['start_date']:
                try:
                    announcement.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
                except ValueError:
                    return error_response('start_date 格式錯誤', 400)
            else:
                announcement.start_date = None

        if 'end_date' in data:
            if data['end_date']:
                try:
                    announcement.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
                except ValueError:
                    return error_response('end_date 格式錯誤', 400)
            else:
                announcement.end_date = None

        db.session.commit()

        return success_response(
            announcement.to_dict(),
            '公告更新成功',
            200
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

@bp.route('/<int:announcement_id>', methods=['DELETE'])
@token_required
def delete_announcement(current_user, announcement_id):
    """
    刪除公告（需廟方管理員權限）
    DELETE /api/temple-announcements/<announcement_id>
    Header: Authorization: Bearer <token>
    """
    try:
        announcement = TempleAnnouncement.query.get(announcement_id)
        if not announcement:
            return error_response('公告不存在', 404)

        # 檢查權限
        from app.models.temple_admin import TempleAdmin
        temple_admin = TempleAdmin.query.filter_by(
            temple_id=announcement.temple_id,
            user_id=current_user.id,
            is_active=True
        ).first()

        if not temple_admin or not temple_admin.has_permission('manage_announcements'):
            return error_response('您沒有權限刪除此公告', 403)

        db.session.delete(announcement)
        db.session.commit()

        return success_response(None, '公告刪除成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'刪除失敗: {str(e)}', 500)

@bp.route('/temple/<int:temple_id>', methods=['GET'])
def get_temple_announcements(temple_id):
    """
    獲取特定廟宇的所有公告（公開）
    GET /api/temple-announcements/temple/<temple_id>
    Query Parameters:
        - limit: 返回數量 (default: 10, max: 50)
        - type: 公告類型 (可選)
    """
    try:
        # 驗證廟宇存在
        temple = Temple.query.filter_by(id=temple_id, is_active=True).first()
        if not temple:
            return error_response('廟宇不存在或已停用', 404)

        limit = min(request.args.get('limit', default=10, type=int), 50)
        announcement_type = request.args.get('type')

        # 構建查詢
        query = TempleAnnouncement.query.filter_by(
            temple_id=temple_id,
            is_published=True
        )

        if announcement_type:
            query = query.filter_by(type=announcement_type)

        # 只顯示有效期內的公告
        now = datetime.utcnow()
        query = query.filter(
            db.or_(
                TempleAnnouncement.start_date.is_(None),
                TempleAnnouncement.start_date <= now
            )
        ).filter(
            db.or_(
                TempleAnnouncement.end_date.is_(None),
                TempleAnnouncement.end_date >= now
            )
        )

        # 排序並限制數量
        priority_order = db.case(
            (TempleAnnouncement.priority == 'urgent', 1),
            (TempleAnnouncement.priority == 'high', 2),
            (TempleAnnouncement.priority == 'normal', 3),
            (TempleAnnouncement.priority == 'low', 4),
            else_=5
        )

        announcements = query.order_by(
            priority_order,
            TempleAnnouncement.created_at.desc()
        ).limit(limit).all()

        return success_response({
            'temple': temple.to_simple_dict(),
            'announcements': [ann.to_simple_dict() for ann in announcements],
            'count': len(announcements)
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)
