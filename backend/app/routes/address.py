"""
收件地址 API
"""
from flask import Blueprint, request
from app import db
from app.models.address import Address
from app.utils.auth import token_required
from app.utils.response import success_response, error_response

bp = Blueprint('address', __name__, url_prefix='/api/addresses')

@bp.route('/', methods=['GET'])
@token_required
def get_addresses(current_user):
    """
    獲取我的地址列表
    GET /api/addresses/
    Header: Authorization: Bearer <token>
    """
    try:
        addresses = Address.query.filter_by(
            user_id=current_user.id
        ).order_by(
            Address.is_default.desc(),
            Address.created_at.desc()
        ).all()

        return success_response([addr.to_dict() for addr in addresses], '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/<int:address_id>', methods=['GET'])
@token_required
def get_address(current_user, address_id):
    """
    獲取地址詳情
    GET /api/addresses/<address_id>
    Header: Authorization: Bearer <token>
    """
    try:
        address = Address.query.get(address_id)

        if not address:
            return error_response('地址不存在', 404)

        if address.user_id != current_user.id:
            return error_response('無權限訪問', 403)

        return success_response(address.to_dict(), '獲取成功', 200)

    except Exception as e:
        return error_response(f'獲取失敗: {str(e)}', 500)

@bp.route('/', methods=['POST'])
@token_required
def create_address(current_user):
    """
    新增地址
    POST /api/addresses/
    Header: Authorization: Bearer <token>
    Body: {
        "recipient_name": "王小明",
        "phone": "0912345678",
        "postal_code": "100",
        "city": "台北市",
        "district": "中正區",
        "address": "重慶南路一段122號",
        "is_default": false
    }
    """
    try:
        data = request.get_json()

        required_fields = ['recipient_name', 'phone', 'city', 'district', 'address']
        for field in required_fields:
            if field not in data:
                return error_response(f'缺少必要欄位: {field}', 400)

        # 如果設為預設地址，取消其他預設地址
        if data.get('is_default', False):
            Address.query.filter_by(
                user_id=current_user.id,
                is_default=True
            ).update({'is_default': False})

        # 創建地址
        address = Address(
            user_id=current_user.id,
            recipient_name=data['recipient_name'],
            phone=data['phone'],
            postal_code=data.get('postal_code'),
            city=data['city'],
            district=data['district'],
            address=data['address'],
            is_default=data.get('is_default', False)
        )

        db.session.add(address)
        db.session.commit()

        return success_response(address.to_dict(), '地址新增成功', 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'新增失敗: {str(e)}', 500)

@bp.route('/<int:address_id>', methods=['PUT'])
@token_required
def update_address(current_user, address_id):
    """
    更新地址
    PUT /api/addresses/<address_id>
    Header: Authorization: Bearer <token>
    """
    try:
        address = Address.query.get(address_id)

        if not address:
            return error_response('地址不存在', 404)

        if address.user_id != current_user.id:
            return error_response('無權限修改', 403)

        data = request.get_json()

        # 如果設為預設地址，取消其他預設地址
        if data.get('is_default', False) and not address.is_default:
            Address.query.filter_by(
                user_id=current_user.id,
                is_default=True
            ).update({'is_default': False})

        # 更新欄位
        if 'recipient_name' in data:
            address.recipient_name = data['recipient_name']
        if 'phone' in data:
            address.phone = data['phone']
        if 'postal_code' in data:
            address.postal_code = data['postal_code']
        if 'city' in data:
            address.city = data['city']
        if 'district' in data:
            address.district = data['district']
        if 'address' in data:
            address.address = data['address']
        if 'is_default' in data:
            address.is_default = data['is_default']

        db.session.commit()

        return success_response(address.to_dict(), '更新成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'更新失敗: {str(e)}', 500)

@bp.route('/<int:address_id>', methods=['DELETE'])
@token_required
def delete_address(current_user, address_id):
    """
    刪除地址
    DELETE /api/addresses/<address_id>
    Header: Authorization: Bearer <token>
    """
    try:
        address = Address.query.get(address_id)

        if not address:
            return error_response('地址不存在', 404)

        if address.user_id != current_user.id:
            return error_response('無權限刪除', 403)

        db.session.delete(address)
        db.session.commit()

        return success_response(None, '刪除成功', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'刪除失敗: {str(e)}', 500)

@bp.route('/<int:address_id>/set-default', methods=['PUT'])
@token_required
def set_default_address(current_user, address_id):
    """
    設定預設地址
    PUT /api/addresses/<address_id>/set-default
    Header: Authorization: Bearer <token>
    """
    try:
        address = Address.query.get(address_id)

        if not address:
            return error_response('地址不存在', 404)

        if address.user_id != current_user.id:
            return error_response('無權限修改', 403)

        # 取消其他預設地址
        Address.query.filter_by(
            user_id=current_user.id,
            is_default=True
        ).update({'is_default': False})

        # 設定為預設
        address.is_default = True
        db.session.commit()

        return success_response(address.to_dict(), '已設定為預設地址', 200)

    except Exception as e:
        db.session.rollback()
        return error_response(f'設定失敗: {str(e)}', 500)
