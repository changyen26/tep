"""
Revenue Endpoints 測試腳本
==========================

測試新版 /api/temple-admin/temples/:templeId/revenue endpoints
確保它們不會回傳 500，並且舊 endpoints 回傳 410

執行方式：
    python test_revenue_endpoint.py

需求：
    pip install requests
"""

import requests
import json
from datetime import datetime, timedelta

# 配置
BASE_URL = "http://localhost:5000/api"
TEMPLE_ID = 5

# 測試用帳號（需要是 temple_admin）
# 請根據你的測試環境調整
TEST_CREDENTIALS = {
    "phone": "0911222333",  # 廟方管理員電話
    "password": "password123",
    "login_type": "temple_admin"
}

# 測試結果
test_results = []


def print_section(title):
    """打印分隔線"""
    print(f"\n{'=' * 80}")
    print(f" {title}")
    print('=' * 80)


def login():
    """登入並取得 token"""
    print("\n[登入] 取得 temple_admin token...")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=TEST_CREDENTIALS,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data', {}).get('token'):
                token = data['data']['token']
                print(f"  ✓ 登入成功，取得 token")
                return token
            else:
                print(f"  ✗ 登入失敗：{data.get('message', 'Unknown error')}")
                return None
        else:
            print(f"  ✗ 登入失敗（HTTP {response.status_code}）")
            return None

    except Exception as e:
        print(f"  ✗ 登入錯誤：{e}")
        return None


def test_endpoint(name, method, url, headers=None, expected_status=None):
    """
    執行單一測試

    Args:
        name: 測試名稱
        method: HTTP 方法
        url: 完整 URL
        headers: 請求 headers
        expected_status: 預期狀態碼（可為list）
    """
    print(f"\n[測試] {name}")
    print(f"  URL: {url}")
    print(f"  Method: {method}")

    try:
        response = requests.request(method, url, headers=headers, timeout=10)
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
    print(" Revenue Endpoints 測試")
    print(" 執行時間:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 80)

    # ========================================
    # Step 1: 登入取得 token
    # ========================================
    token = login()

    if not token:
        print("\n[ERROR] 無法取得 token，測試中止")
        print("請確認：")
        print("  1. 後端服務是否啟動")
        print("  2. 測試帳號是否存在且正確")
        print("  3. 測試帳號是否為 temple_admin 且 temple_id=5")
        return 1

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    # 準備日期參數
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    date_params = f"start_date={start_date.strftime('%Y-%m-%d')}&end_date={end_date.strftime('%Y-%m-%d')}&group_by=day"

    # ========================================
    # Test 1: 測試舊 Endpoints（應回 410 Gone）
    # ========================================
    print_section("Test 1: 舊 Endpoints（應回 410 Gone）")

    test_endpoint(
        "GET /api/temple-revenue/:id/revenue (舊版)",
        "GET",
        f"{BASE_URL}/temple-revenue/{TEMPLE_ID}/revenue?{date_params}",
        expected_status=410
    )

    test_endpoint(
        "GET /api/temple-revenue/:id/revenue/summary (舊版)",
        "GET",
        f"{BASE_URL}/temple-revenue/{TEMPLE_ID}/revenue/summary",
        expected_status=410
    )

    # ========================================
    # Test 2: 新版 Endpoints - 有 Token（應回 200 或 403，不可 500）
    # ========================================
    print_section("Test 2: 新版 Endpoints - 有 Token（應回 200/403，不可 500）")

    test_endpoint(
        "GET /temple-admin/temples/:id/revenue 有 token",
        "GET",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/revenue?{date_params}",
        headers=headers,
        expected_status=[200, 403]
    )

    test_endpoint(
        "GET /temple-admin/temples/:id/revenue/summary 有 token",
        "GET",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/revenue/summary",
        headers=headers,
        expected_status=[200, 403]
    )

    # ========================================
    # Test 3: 新版 Endpoints - 無 Token（應回 401）
    # ========================================
    print_section("Test 3: 新版 Endpoints - 無 Token（應回 401，不可 500）")

    test_endpoint(
        "GET /temple-admin/temples/:id/revenue 無 token",
        "GET",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/revenue?{date_params}",
        expected_status=401
    )

    test_endpoint(
        "GET /temple-admin/temples/:id/revenue/summary 無 token",
        "GET",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/revenue/summary",
        expected_status=401
    )

    # ========================================
    # Test 4: OPTIONS Preflight
    # ========================================
    print_section("Test 4: OPTIONS Preflight（應回 204）")

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id/revenue",
        "OPTIONS",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/revenue",
        headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization'
        },
        expected_status=204
    )

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id/revenue/summary",
        "OPTIONS",
        f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/revenue/summary",
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
