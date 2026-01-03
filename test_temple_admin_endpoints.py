"""
Temple Admin Endpoints 測試腳本
==================================

測試所有新版 /api/temple-admin/temples/:templeId/* endpoints
確保它們不會回傳 500，並且舊 endpoints 回傳 410

執行方式：
    python test_temple_admin_endpoints.py

需求：
    pip install requests
"""

import requests
import json
from datetime import datetime

# 配置
BASE_URL = "http://localhost:5000/api"
TEMPLE_ID = 5

# 測試結果
test_results = []


def print_section(title):
    """打印分隔線"""
    print(f"\n{'=' * 80}")
    print(f" {title}")
    print('=' * 80)


def test_endpoint(name, method, url, headers=None, json_data=None, expected_status=None):
    """
    執行單一測試

    Args:
        name: 測試名稱
        method: HTTP 方法
        url: 完整 URL
        headers: 請求 headers
        json_data: JSON body
        expected_status: 預期狀態碼（可為list）
    """
    print(f"\n[測試] {name}")
    print(f"  URL: {url}")
    print(f"  Method: {method}")

    try:
        response = requests.request(method, url, headers=headers, json=json_data, timeout=10)
        status = response.status_code

        # 解析 JSON
        try:
            body = response.json()
        except:
            body = response.text

        # 檢查 CORS
        cors = response.headers.get('Access-Control-Allow-Origin')

        # 判斷通過/失敗
        passed = True

        # 檢查狀態碼
        if expected_status:
            if isinstance(expected_status, list):
                if status not in expected_status:
                    passed = False
            else:
                if status != expected_status:
                    passed = False

        # 絕對不能 500
        if status == 500:
            passed = False

        result = "[PASS]" if passed else "[FAIL]"

        print(f"  Status: {status} {result}")
        if cors:
            print(f"  CORS: {cors}")

        # 只在失敗或非 2xx 時打印 body
        if not passed or status >= 400:
            print(f"  Body: {json.dumps(body, ensure_ascii=False, indent=2) if isinstance(body, dict) else body}")

        test_results.append({
            'name': name,
            'passed': passed,
            'status': status,
            'has_500': status == 500,
            'expected': expected_status
        })

        return passed

    except requests.exceptions.ConnectionError:
        print("  [ERROR] 無法連線到後端（請確認後端是否啟動）")
        test_results.append({'name': name, 'passed': False, 'error': 'Connection refused'})
        return False

    except Exception as e:
        print(f"  [ERROR] {e}")
        test_results.append({'name': name, 'passed': False, 'error': str(e)})
        return False


def main():
    """主測試流程"""

    print("=" * 80)
    print(" Temple Admin Endpoints 測試")
    print(" 執行時間:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 80)

    # ========================================
    # Test 1: 測試舊 Endpoints（應回 410 Gone）
    # ========================================
    print_section("Test 1: 舊 Endpoints（應回 410 Gone）")

    test_endpoint(
        "GET /api/products/temple/:id (舊版)",
        "GET",
        f"{BASE_URL}/products/temple/{TEMPLE_ID}",
        expected_status=410
    )

    test_endpoint(
        "GET /api/temple-stats/:id/checkins (舊版)",
        "GET",
        f"{BASE_URL}/temple-stats/{TEMPLE_ID}/checkins",
        expected_status=410
    )

    # ========================================
    # Test 2: 新版 Endpoints - 無 Token（應回 401）
    # ========================================
    print_section("Test 2: 新版 Endpoints - 無 Token（應回 401，不可 500）")

    test_endpoint(
        "GET /temple-admin/temples/:id/products 無 token",
        "GET",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/products?page=1&per_page=20",
        expected_status=401
    )

    test_endpoint(
        "GET /temple-admin/temples/:id/orders 無 token",
        "GET",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/orders",
        expected_status=401
    )

    test_endpoint(
        "GET /temple-admin/temples/:id/checkins 無 token",
        "GET",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/checkins?period=week",
        expected_status=401
    )

    # ========================================
    # Test 3: OPTIONS Preflight
    # ========================================
    print_section("Test 3: OPTIONS Preflight（應回 204）")

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id/products",
        "OPTIONS",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/products",
        headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization'
        },
        expected_status=204
    )

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id/orders",
        "OPTIONS",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/orders",
        headers={
            'Origin': 'http://localhost:5173'
        },
        expected_status=204
    )

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id/checkins",
        "OPTIONS",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/checkins",
        headers={
            'Origin': 'http://localhost:5173'
        },
        expected_status=204
    )

    # ========================================
    # 測試總結
    # ========================================
    print_section("測試總結")

    total = len(test_results)
    passed = sum(1 for r in test_results if r.get('passed', False))
    failed = total - passed
    has_500 = any(r.get('has_500', False) for r in test_results)

    print(f"\n總測試數: {total}")
    print(f"通過: {passed}")
    print(f"失敗: {failed}")

    if has_500:
        print("\n[CRITICAL] 仍然存在 500 錯誤！")
        print("500 錯誤的測試：")
        for r in test_results:
            if r.get('has_500'):
                print(f"  - {r['name']}")
    else:
        print("\n[SUCCESS] 沒有 500 錯誤！")

    if failed > 0:
        print(f"\n失敗的測試：")
        for r in test_results:
            if not r.get('passed', False):
                print(f"  - {r['name']}")
                if 'status' in r:
                    print(f"    實際: {r['status']}, 預期: {r.get('expected', 'N/A')}")
                if 'error' in r:
                    print(f"    錯誤: {r['error']}")

    print("\n" + "=" * 80)

    # 退出碼
    if failed > 0 or has_500:
        return 1
    return 0


if __name__ == '__main__':
    exit_code = main()
    exit(exit_code)
