"""
商品 API
"""
from flask import Blueprint, request
from app import db
from app.models.product import Product
from app.models.redemption import Redemption
from app.utils.auth import token_required, admin_required
from app.utils.response import success_response, error_response
from sqlalchemy import func, or_

bp = Blueprint('product', __name__, url_prefix='/api/products')

@bp.route('/', methods=['GET'])
def get_products():
    """
    獲取商品列表
    GET /api/products/
    Query Parameters:
        - page: 頁碼 (default: 1)
        - per_page: 每頁數量 (default: 20)
        - category: 商品分類篩選
        - sort: 排序方式 (newest/price_asc/price_desc/popular)
        - is_active: 是否啟用 (true/false)
    """
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=20, type=int)
        category = request.args.get('category')
        sort = request.args.get('sort', default='newest')
        is_active = request.args.get('is_active', default='true')

        query = Product.query

        # 篩選啟用狀態
        if is_active.lower() == 'true':
            query = query.filter_by(is_active=True)

        # 篩選分類
        if category:
            query = query.filter_by(category=category)

        # 排序
        if sort == 'price_asc':
            query = query.order_by(Product.merit_points.asc())
        elif sort == 'price_desc':
            query = query.order_by(Product.merit_points.desc())
        elif sort == 'popular':
            # TODO: 按兌換數量排序
            query = query.order_by(Product.created_at.desc())
        else:  # newest
            query = query.order_by(Product.created_at.desc())

        # 獲取總數
        total = query.count()

        # 分頁
        products = query.limit(per_page).offset((page - 1) * per_page).all()

        return success_response({
            'products': [product.to_dict() for product in products],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """
    獲取商品詳情
    GET /api/products/<product_id>
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return error_response('商品不存在', 404)

        # 獲取兌換統計
        redemption_count = Redemption.query.filter_by(
            product_id=product_id
        ).filter(
            Redemption.status != 'cancelled'
        ).count()

        product_data = product.to_dict()
        product_data['redemption_count'] = redemption_count

        return success_response(product_data, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/categories', methods=['GET'])
def get_categories():
    """
    獲取商品分類列表及數量
    GET /api/products/categories
    """
    try:
        categories = db.session.query(
            Product.category,
            func.count(Product.id).label('count')
        ).filter_by(
            is_active=True
        ).group_by(
            Product.category
        ).all()

        category_map = {
            'charm': '吊飾',
            'tshirt': 'T恤',
            'sticker': '貼紙',
            'bag': '提袋',
            'postcard': '明信片',
            'bookmark': '書籤',
            'badge': '徽章',
            'keychain': '鑰匙圈'
        }

        result = [{
            'category': cat,
            'name': category_map.get(cat, cat),
            'count': count
        } for cat, count in categories]

        return success_response(result, '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

# ===== 管理員 API =====

@bp.route('/admin/products', methods=['POST'])
@admin_required
def create_product(current_user):
    """
    管理員：創建商品
    POST /api/products/admin/products
    Header: Authorization: Bearer <token> (需要管理員權限)
    Body: {
        "name": "商品名稱",
        "description": "商品描述",
        "category": "charm",
        "merit_points": 100,
        "stock_quantity": 50,
        "image_url": "圖片URL",
        "images": ["圖片1", "圖片2"],
        "is_featured": false
    }
    """
    try:
        data = request.get_json()

        if not data or 'name' not in data or 'category' not in data or 'merit_points' not in data:
            return error_response('缺少必要欄位', 400)

        # 創建商品
        product = Product(
            name=data['name'],
            description=data.get('description'),
            category=data['category'],
            merit_points=data['merit_points'],
            stock_quantity=data.get('stock_quantity', 0),
            image_url=data.get('image_url'),
            images=data.get('images'),
            is_featured=data.get('is_featured', False),
            sort_order=data.get('sort_order', 0)
        )

        db.session.add(product)
        db.session.commit()

        return success_response(product.to_dict(), '商品創建成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'創建失敗: {str(e)}', 500)

@bp.route('/admin/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(current_user, product_id):
    """
    管理員：更新商品
    PUT /api/products/admin/products/<product_id>
    Header: Authorization: Bearer <token> (需要管理員權限)
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return error_response('商品不存在', 404)

        data = request.get_json()

        # 更新欄位
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'category' in data:
            product.category = data['category']
        if 'merit_points' in data:
            product.merit_points = data['merit_points']
        if 'stock_quantity' in data:
            product.stock_quantity = data['stock_quantity']
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'images' in data:
            product.images = data['images']
        if 'is_featured' in data:
            product.is_featured = data['is_featured']
        if 'is_active' in data:
            product.is_active = data['is_active']
        if 'sort_order' in data:
            product.sort_order = data['sort_order']

        db.session.commit()

        return success_response(product.to_dict(), '更新成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

@bp.route('/admin/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(current_user, product_id):
    """
    管理員：刪除商品（軟刪除，設為不啟用）
    DELETE /api/products/admin/products/<product_id>
    Header: Authorization: Bearer <token> (需要管理員權限)
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return error_response('商品不存在', 404)

        product.is_active = False
        db.session.commit()

        return success_response(None, '刪除成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'刪除失敗: {str(e)}', 500)
