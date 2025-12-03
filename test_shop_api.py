"""
測試商城系統 API
"""
import requests
import json

BASE_URL = 'http://localhost:5000'

# 先登入獲取 token
def login():
    response = requests.post(f'{BASE_URL}/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    data = response.json()
    if data['success']:
        return data['data']['token']
    return None

# 測試創建商品（需要管理員權限）
def test_create_product(token):
    print('\n===== 測試創建商品 =====')
    products = [
        {
            'name': '平安符吊飾',
            'description': '精緻手工平安符吊飾，隨身攜帶保平安',
            'category': 'charm',
            'merit_points': 100,
            'stock_quantity': 50,
            'image_url': 'https://example.com/charm1.jpg',
            'is_featured': True
        },
        {
            'name': '祈福T恤',
            'description': '100%純棉祈福T恤，舒適又有型',
            'category': 'tshirt',
            'merit_points': 300,
            'stock_quantity': 30,
            'image_url': 'https://example.com/tshirt1.jpg',
            'is_featured': False
        },
        {
            'name': '廟宇貼紙組',
            'description': '精美廟宇貼紙組合包(5入)',
            'category': 'sticker',
            'merit_points': 50,
            'stock_quantity': 100,
            'image_url': 'https://example.com/sticker1.jpg',
            'is_featured': True
        }
    ]

    for product_data in products:
        response = requests.post(
            f'{BASE_URL}/api/products/admin/products',
            json=product_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        data = response.json()
        print(f"創建商品 '{product_data['name']}': {data['message'] if data['success'] else data['error']}")

# 測試獲取商品列表
def test_get_products():
    print('\n===== 測試獲取商品列表 =====')
    response = requests.get(f'{BASE_URL}/api/products/')
    data = response.json()
    if data['success']:
        print(f"成功獲取 {len(data['data']['products'])} 個商品")
        for product in data['data']['products']:
            print(f"  - {product['name']}: {product['merit_points']} 功德值, 庫存: {product['stock_quantity']}")
    else:
        print(f"失敗: {data['error']}")

# 測試獲取商品詳情
def test_get_product_detail(product_id=1):
    print(f'\n===== 測試獲取商品詳情 (ID: {product_id}) =====')
    response = requests.get(f'{BASE_URL}/api/products/{product_id}')
    data = response.json()
    if data['success']:
        product = data['data']
        print(f"商品名稱: {product['name']}")
        print(f"描述: {product['description']}")
        print(f"功德值: {product['merit_points']}")
        print(f"庫存: {product['stock_quantity']}")
    else:
        print(f"失敗: {data['error']}")

# 測試創建地址
def test_create_address(token):
    print('\n===== 測試創建收件地址 =====')
    address_data = {
        'recipient_name': '測試使用者',
        'phone': '0912345678',
        'postal_code': '100',
        'city': '台北市',
        'district': '中正區',
        'address': '重慶南路一段122號',
        'is_default': True
    }
    response = requests.post(
        f'{BASE_URL}/api/addresses/',
        json=address_data,
        headers={'Authorization': f'Bearer {token}'}
    )
    data = response.json()
    print(f"創建地址: {data['message'] if data['success'] else data['error']}")
    if data['success']:
        return data['data']['id']
    return None

# 測試獲取地址列表
def test_get_addresses(token):
    print('\n===== 測試獲取地址列表 =====')
    response = requests.get(
        f'{BASE_URL}/api/addresses/',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = response.json()
    if data['success']:
        print(f"成功獲取 {len(data['data'])} 個地址")
        for addr in data['data']:
            print(f"  - {addr['recipient_name']}: {addr['full_address']}")
    else:
        print(f"失敗: {data['error']}")

# 測試兌換商品
def test_redeem_product(token, product_id=1, address_id=1):
    print(f'\n===== 測試兌換商品 (商品ID: {product_id}) =====')
    redemption_data = {
        'product_id': product_id,
        'quantity': 1,
        'address_id': address_id,
        'notes': '請小心包裝'
    }
    response = requests.post(
        f'{BASE_URL}/api/redemptions/',
        json=redemption_data,
        headers={'Authorization': f'Bearer {token}'}
    )
    data = response.json()
    print(f"兌換結果: {data['message'] if data['success'] else data['error']}")
    if data['success']:
        print(f"  剩餘功德值: {data['data']['remaining_points']}")
        return data['data']['redemption']['id']
    return None

# 測試獲取兌換記錄
def test_get_redemptions(token):
    print('\n===== 測試獲取兌換記錄 =====')
    response = requests.get(
        f'{BASE_URL}/api/redemptions/',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = response.json()
    if data['success']:
        print(f"成功獲取 {len(data['data']['redemptions'])} 筆兌換記錄")
        for redemption in data['data']['redemptions']:
            print(f"  - {redemption['product']['name']}: {redemption['status']}, 使用 {redemption['merit_points_used']} 功德值")
    else:
        print(f"失敗: {data['error']}")

# 測試取消兌換
def test_cancel_redemption(token, redemption_id):
    print(f'\n===== 測試取消兌換 (ID: {redemption_id}) =====')
    response = requests.post(
        f'{BASE_URL}/api/redemptions/{redemption_id}/cancel',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = response.json()
    print(f"取消結果: {data['message'] if data['success'] else data['error']}")
    if data['success']:
        print(f"  退還功德值: {data['data']['refunded_points']}")
        print(f"  當前功德值: {data['data']['current_points']}")

# 測試獲取兌換統計
def test_get_redemption_stats(token):
    print('\n===== 測試獲取兌換統計 =====')
    response = requests.get(
        f'{BASE_URL}/api/redemptions/stats',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = response.json()
    if data['success']:
        stats = data['data']
        print(f"總兌換次數: {stats['total_redemptions']}")
        print(f"總使用功德值: {stats['total_points_used']}")
        print(f"狀態統計: {stats['status_count']}")
    else:
        print(f"失敗: {data['error']}")

if __name__ == '__main__':
    print('開始測試商城系統 API...\n')

    # 登入
    print('===== 登入系統 =====')
    token = login()
    if not token:
        print('登入失敗！')
        exit(1)
    print(f'登入成功，Token: {token[:50]}...')

    # 測試商品相關 API
    test_create_product(token)
    test_get_products()
    test_get_product_detail(1)

    # 測試地址相關 API
    address_id = test_create_address(token)
    test_get_addresses(token)

    # 測試兌換相關 API
    if address_id:
        redemption_id = test_redeem_product(token, 1, address_id)
        test_get_redemptions(token)
        test_get_redemption_stats(token)

        # 測試取消兌換
        if redemption_id:
            test_cancel_redemption(token, redemption_id)
            test_get_redemption_stats(token)

    print('\n===== 測試完成 =====')
