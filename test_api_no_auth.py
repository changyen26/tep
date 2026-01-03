"""
API 測試（無需登入）
====================

只測試不需要 auth 的部分：
1. 無 Token 測試（應回 401，不可 500）
2. OPTIONS Preflight 測試

執行方式：
    python test_api_no_auth.py
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"
TEMPLE_ID = 5

print("=" * 80)
print(" Temple Admin API - 無需認證測試")
print(" 執行時間:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
print("=" * 80)

test_results = []

def test_case(name, method, url, headers=None, expected_status=None):
    """執行單一測試"""
    print(f"\n[測試] {name}")
    print(f"  Method: {method}")
    print(f"  URL: {url}")

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
        if expected_status and status != expected_status:
            passed = False
        if status == 500:
            passed = False

        result = "[PASS]" if passed else "[FAIL]"

        print(f"  Status: {status} {result}")
        if cors:
            print(f"  CORS: {cors}")
        print(f"  Body: {json.dumps(body, ensure_ascii=False, indent=2)}")

        test_results.append({
            'name': name,
            'passed': passed,
            'status': status,
            'has_500': status == 500
        })

        return passed

    except requests.exceptions.ConnectionError:
        print("  [ERROR] 無法連線到後端")
        test_results.append({'name': name, 'passed': False, 'error': 'Connection refused'})
        return False

    except Exception as e:
        print(f"  [ERROR] {e}")
        test_results.append({'name': name, 'passed': False, 'error': str(e)})
        return False


print("\n" + "=" * 80)
print(" Test 1: 無 Token 測試（應回 401，不可 500）")
print("=" * 80)

test_case(
    "GET /temple-admin/temples/:id 無 token",
    "GET",
    f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}",
    expected_status=401
)

test_case(
    "GET /temple-admin/temples/:id/stats 無 token",
    "GET",
    f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/stats",
    expected_status=401
)

print("\n" + "=" * 80)
print(" Test 2: OPTIONS Preflight 測試（應回 204 + CORS）")
print("=" * 80)

test_case(
    "OPTIONS /temple-admin/temples/:id",
    "OPTIONS",
    f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}",
    headers={
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization'
    },
    expected_status=204
)

test_case(
    "OPTIONS /temple-admin/temples/:id/stats",
    "OPTIONS",
    f"{BASE_URL}/temple-admin/temples/{TEMPLE_ID}/stats",
    headers={
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization'
    },
    expected_status=204
)

# 總結
print("\n" + "=" * 80)
print(" 測試總結")
print("=" * 80)

total = len(test_results)
passed = sum(1 for r in test_results if r.get('passed', False))
failed = total - passed
has_500 = any(r.get('has_500', False) for r in test_results)

print(f"\n總測試數: {total}")
print(f"通過: {passed}")
print(f"失敗: {failed}")

if has_500:
    print("\n[CRITICAL] 仍然存在 500 錯誤！")
else:
    print("\n[SUCCESS] 沒有 500 錯誤！")

if failed == 0:
    print("[SUCCESS] 所有測試通過！")
else:
    print(f"\n失敗的測試：")
    for r in test_results:
        if not r.get('passed', False):
            print(f"  - {r['name']}")
            if 'status' in r:
                print(f"    Status: {r['status']}")
            if 'error' in r:
                print(f"    Error: {r['error']}")

print("\n" + "=" * 80)
