"""
500 錯誤修正測試腳本
===================

自動測試 temple-admin API 的 500 錯誤修正

執行方式：
    python test_500_fix.py

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


def test_case(name, method, url, headers=None, expected_status=None):
    """
    執行單一測試案例

    Args:
        name: 測試名稱
        method: HTTP 方法 (GET, POST, etc.)
        url: 完整 URL
        headers: 請求 headers
        expected_status: 預期狀態碼
    """
    print(f"\n[測試] {name}")
    print(f"  URL: {url}")
    print(f"  Method: {method}")

    if headers:
        print(f"  Headers: {json.dumps(headers, indent=4)}")

    try:
        response = requests.request(method, url, headers=headers, timeout=10)

        status_code = response.status_code

        # 檢查 CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }

        # 嘗試解析 JSON
        try:
            response_body = response.json()
        except:
            response_body = response.text

        # 判斷結果
        passed = True
        if expected_status and status_code != expected_status:
            passed = False

        # 檢查是否為 500 錯誤
        if status_code == 500:
            passed = False

        # 檢查 CORS (只在非 OPTIONS 時)
        if method != 'OPTIONS' and not cors_headers.get('Access-Control-Allow-Origin'):
            print("  ⚠️  WARNING: Missing CORS header")

        # 輸出結果
        print(f"  Status: {status_code} {'✅ PASS' if passed else '❌ FAIL'}")
        print(f"  CORS Headers:")
        for key, value in cors_headers.items():
            if value:
                print(f"    {key}: {value}")

        print(f"  Response Body:")
        print(f"    {json.dumps(response_body, indent=4, ensure_ascii=False)}")

        # 記錄結果
        test_results.append({
            'name': name,
            'passed': passed,
            'status_code': status_code,
            'expected_status': expected_status,
            'has_cors': bool(cors_headers.get('Access-Control-Allow-Origin')),
            'response': response_body
        })

        return response

    except requests.exceptions.ConnectionError:
        print("  ❌ FAIL: 無法連線到後端 (請確認後端是否啟動)")
        test_results.append({
            'name': name,
            'passed': False,
            'error': 'Connection refused'
        })
        return None

    except Exception as e:
        print(f"  ❌ FAIL: {str(e)}")
        test_results.append({
            'name': name,
            'passed': False,
            'error': str(e)
        })
        return None


def get_login_token(email, password, login_type='temple_admin'):
    """
    獲取登入 token

    Returns:
        token string or None
    """
    print_section("Step 1: 獲取測試 Token")

    login_url = f"{BASE_URL}/auth/login"
    payload = {
        'email': email,
        'password': password,
        'login_type': login_type
    }

    print(f"登入 URL: {login_url}")
    print(f"登入資料: {json.dumps(payload, indent=4, ensure_ascii=False)}")

    try:
        response = requests.post(login_url, json=payload, timeout=10)

        if response.status_code == 200:
            data = response.json()
            token = data.get('data', {}).get('token')

            if token:
                print(f"✅ 登入成功")
                print(f"Token: {token[:50]}...")
                return token
            else:
                print(f"❌ 登入失敗: 沒有 token")
                print(f"Response: {json.dumps(data, indent=4, ensure_ascii=False)}")
                return None
        else:
            print(f"❌ 登入失敗: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return None

    except Exception as e:
        print(f"❌ 登入失敗: {str(e)}")
        return None


def main():
    """主測試流程"""

    print("=" * 80)
    print(" Temple Admin API - 500 錯誤修正測試")
    print(" 執行時間:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 80)

    # ========================================
    # Test A: 無 Token 測試（應回 401，不可 500）
    # ========================================
    print_section("Test A: 無 Token 請求 (應回 401)")

    test_case(
        name="GET /temple-admin/temples/:id 無 token",
        method="GET",
        url=f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}",
        expected_status=401
    )

    test_case(
        name="GET /temple-admin/temples/:id/stats 無 token",
        method="GET",
        url=f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/stats",
        expected_status=401
    )

    # ========================================
    # Test B: OPTIONS Preflight 測試
    # ========================================
    print_section("Test B: OPTIONS Preflight (應回 204)")

    test_case(
        name="OPTIONS /temple-admin/temples/:id",
        method="OPTIONS",
        url=f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}",
        headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization'
        },
        expected_status=204
    )

    # ========================================
    # Test C: 帶 Token 測試（需要真實登入）
    # ========================================
    print_section("Test C: 帶 Token 請求")

    print("\n請輸入測試帳號資訊：")
    email = input("Email (廟方管理員): ").strip()
    password = input("Password: ").strip()

    if not email or not password:
        print("\n⚠️  跳過 Token 測試（未輸入帳號密碼）")
    else:
        token = get_login_token(email, password, 'temple_admin')

        if token:
            print_section("Test C-1: 帶有效 Token 的請求")

            headers = {
                'Authorization': f'Bearer {token}'
            }

            test_case(
                name="GET /temple-admin/temples/:id 帶 token",
                method="GET",
                url=f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}",
                headers=headers,
                expected_status=200  # 或 403 如果 temple_id 不匹配
            )

            test_case(
                name="GET /temple-admin/temples/:id/stats 帶 token",
                method="GET",
                url=f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/stats",
                headers=headers,
                expected_status=200  # 或 403 如果 temple_id 不匹配
            )

    # ========================================
    # 測試總結
    # ========================================
    print_section("測試總結")

    total = len(test_results)
    passed = sum(1 for r in test_results if r.get('passed', False))
    failed = total - passed

    print(f"\n總測試數: {total}")
    print(f"✅ 通過: {passed}")
    print(f"❌ 失敗: {failed}")

    if failed > 0:
        print("\n失敗的測試：")
        for r in test_results:
            if not r.get('passed', False):
                print(f"  - {r['name']}")
                if 'status_code' in r:
                    print(f"    實際狀態碼: {r['status_code']}, 預期: {r.get('expected_status', 'N/A')}")
                if 'error' in r:
                    print(f"    錯誤: {r['error']}")

    # 檢查是否有 500 錯誤
    has_500 = any(r.get('status_code') == 500 for r in test_results)

    if has_500:
        print("\n❌❌❌ 仍然存在 500 錯誤！請檢查後端日誌 ❌❌❌")
    else:
        print("\n✅✅✅ 沒有 500 錯誤！ ✅✅✅")

    # 檢查 CORS
    missing_cors = [r for r in test_results if not r.get('has_cors', True) and r.get('status_code') not in [204]]
    if missing_cors:
        print(f"\n⚠️  {len(missing_cors)} 個回應缺少 CORS headers")

    print("\n" + "=" * 80)


if __name__ == '__main__':
    main()
