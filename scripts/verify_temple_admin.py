"""
廟方管理後台自動驗收腳本
=============================

測試所有 temple-admin endpoints，確保：
1. OPTIONS preflight 返回 204 並帶 CORS headers
2. 無 token 時返回 401（不是 500）
3. 有效 token 時正常工作（200/403，不是 500）
4. CORS headers 正確設置
5. 錯誤回應格式統一

執行方式：
    python scripts/verify_temple_admin.py

環境變數（可選）：
    TEMPLE_ADMIN_EMAIL=test@temple.com
    TEMPLE_ADMIN_PASSWORD=password123
    TEMPLE_ID=5
"""

import requests
import json
import os
from datetime import datetime

# 配置
BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000/api')
TEMPLE_ADMIN_EMAIL = os.getenv('TEMPLE_ADMIN_EMAIL', '0911222333')
TEMPLE_ADMIN_PASSWORD = os.getenv('TEMPLE_ADMIN_PASSWORD', 'password123')
TEMPLE_ID = int(os.getenv('TEMPLE_ID', '5'))

# CORS 來源
CORS_ORIGIN = 'http://localhost:5173'

# 測試結果
results = []
total_tests = 0
passed_tests = 0
failed_tests = 0


def print_section(title):
    """打印分節標題"""
    print(f"\n{'=' * 80}")
    print(f" {title}")
    print('=' * 80)


def login():
    """登入取得 token"""
    print("\n[登入] 取得 temple_admin token...")
    try:
        response = requests.post(
            f'{BASE_URL}/auth/login',
            json={
                'phone': TEMPLE_ADMIN_EMAIL,
                'password': TEMPLE_ADMIN_PASSWORD,
                'login_type': 'temple_admin'
            },
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data', {}).get('token'):
                token = data['data']['token']
                print(f"  ✓ 登入成功")
                return token
            else:
                print(f"  ✗ 登入失敗：{data.get('message', 'Unknown error')}")
                return None
        else:
            print(f"  ✗ 登入失敗（HTTP {response.status_code}）")
            print(f"     Response: {response.text[:300]}")
            return None

    except Exception as e:
        print(f"  ✗ 登入錯誤：{e}")
        return None


def test_endpoint(name, method, path, headers=None, expected_status=None, check_cors=True):
    """
    測試單一 endpoint

    Args:
        name: 測試名稱
        method: HTTP 方法
        path: API 路徑（相對於 BASE_URL）
        headers: 請求 headers
        expected_status: 預期狀態碼（可為 list）
        check_cors: 是否檢查 CORS headers
    """
    global total_tests, passed_tests, failed_tests

    total_tests += 1
    url = f"{BASE_URL}/{path.lstrip('/')}"

    print(f"\n[{total_tests}] {name}")
    print(f"    {method} {path}")

    try:
        response = requests.request(method, url, headers=headers, timeout=10)
        status = response.status_code

        # 解析回應
        try:
            body = response.json()
            is_json = True
        except:
            body = response.text
            is_json = False

        # 檢查 CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        has_cors = cors_headers['Access-Control-Allow-Origin'] is not None

        # 判斷通過/失敗
        passed = True
        reasons = []

        # 檢查狀態碼
        if expected_status:
            if isinstance(expected_status, list):
                if status not in expected_status:
                    passed = False
                    reasons.append(f"狀態碼 {status} 不在預期範圍 {expected_status}")
            else:
                if status != expected_status:
                    passed = False
                    reasons.append(f"狀態碼 {status} != {expected_status}")

        # 絕對不能 500
        if status == 500:
            passed = False
            reasons.append("500 錯誤（嚴重）")

        # 檢查 CORS（如果需要）
        if check_cors and not has_cors:
            passed = False
            reasons.append("缺少 CORS headers")

        # 檢查 JSON 格式（非 OPTIONS）
        if method != 'OPTIONS' and status >= 400 and not is_json:
            passed = False
            reasons.append("錯誤回應不是 JSON 格式")

        # 更新統計
        if passed:
            passed_tests += 1
            print(f"    [PASS] {status}")
        else:
            failed_tests += 1
            print(f"    [FAIL] {status} - {', '.join(reasons)}")

        # 顯示詳情（失敗時或 500）
        if not passed or status >= 500:
            print(f"    CORS: {cors_headers['Access-Control-Allow-Origin'] or 'None'}")
            if is_json:
                print(f"    Body: {json.dumps(body, ensure_ascii=False, indent=6)[:300]}")
            else:
                print(f"    Body: {body[:300]}")

            # 推測可能的問題位置
            if status == 500:
                print(f"    >> 可能位置: backend/app/routes/temple_admin_api.py")
                if 'mapper' in str(body).lower():
                    print(f"    >> 問題類型: SQLAlchemy model relationship 錯誤")
            elif status == 401 and 'token' in str(body).lower():
                print(f"    >> 問題類型: token 驗證失敗")
            elif not has_cors:
                print(f"    >> 問題類型: CORS 配置問題，檢查 backend/app/__init__.py")

        results.append({
            'name': name,
            'passed': passed,
            'status': status,
            'has_cors': has_cors,
            'is_json': is_json,
            'reasons': reasons
        })

        return passed

    except requests.exceptions.ConnectionError:
        print("    [ERROR] 無法連線到後端（請確認後端是否啟動）")
        failed_tests += 1
        results.append({'name': name, 'passed': False, 'error': 'Connection refused'})
        return False

    except Exception as e:
        print(f"    [ERROR] {e}")
        failed_tests += 1
        results.append({'name': name, 'passed': False, 'error': str(e)})
        return False


def main():
    """主測試流程"""
    print("=" * 80)
    print(" 廟方管理後台自動驗收")
    print(" 執行時間:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 80)

    # ====================================
    # Step 1: 登入取得 token
    # ====================================
    token = login()

    if not token:
        print("\n[CRITICAL] 無法取得 token，部分測試將跳過")
        print("請確認：")
        print("  1. 後端服務是否啟動")
        print("  2. 測試帳號是否存在且正確")
        print("  3. 測試帳號是否為 temple_admin 且 temple_id=5")

    headers_with_token = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    } if token else None

    headers_without_token = {
        'Content-Type': 'application/json'
    }

    # ====================================
    # Test 1: OPTIONS Preflight（必須通過）
    # ====================================
    print_section("Test 1: OPTIONS Preflight（必回 204 + CORS）")

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id",
        "OPTIONS",
        f"temple-admin/temples/{TEMPLE_ID}",
        headers={'Origin': CORS_ORIGIN},
        expected_status=204
    )

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id/products",
        "OPTIONS",
        f"temple-admin/temples/{TEMPLE_ID}/products",
        headers={'Origin': CORS_ORIGIN},
        expected_status=204
    )

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id/devotees",
        "OPTIONS",
        f"temple-admin/temples/{TEMPLE_ID}/devotees",
        headers={'Origin': CORS_ORIGIN},
        expected_status=204
    )

    # ====================================
    # Test 2: 無 Token（必須 401，不可 500）
    # ====================================
    print_section("Test 2: 無 Token 時回傳 401（不可 500）")

    endpoints_to_test = [
        f"temple-admin/temples/{TEMPLE_ID}",
        f"temple-admin/temples/{TEMPLE_ID}/products",
        f"temple-admin/temples/{TEMPLE_ID}/orders",
        f"temple-admin/temples/{TEMPLE_ID}/checkins",
        f"temple-admin/temples/{TEMPLE_ID}/revenue",
        f"temple-admin/temples/{TEMPLE_ID}/devotees",
    ]

    for endpoint in endpoints_to_test:
        test_endpoint(
            f"GET {endpoint} (無 token)",
            "GET",
            endpoint,
            headers=headers_without_token,
            expected_status=401
        )

    # ====================================
    # Test 3: 有 Token（必須 200/403，不可 500）
    # ====================================
    if token:
        print_section("Test 3: 有 Token 時正常工作（200/403，不可 500）")

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}",
            headers=headers_with_token,
            expected_status=[200, 403]
        )

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}/products",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}/products?page=1&per_page=20",
            headers=headers_with_token,
            expected_status=[200, 403]
        )

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}/orders",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}/orders",
            headers=headers_with_token,
            expected_status=[200, 403]
        )

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}/checkins",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}/checkins?period=week",
            headers=headers_with_token,
            expected_status=[200, 403]
        )

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}/revenue",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}/revenue?start_date=2025-12-01&end_date=2026-01-03",
            headers=headers_with_token,
            expected_status=[200, 403]
        )

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}/devotees",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}/devotees",
            headers=headers_with_token,
            expected_status=[200, 403]
        )

    # ====================================
    # 測試總結
    # ====================================
    print_section("測試總結")

    print(f"\n總測試數: {total_tests}")
    print(f"通過: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
    print(f"失敗: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")

    # 500 錯誤（關鍵問題）
    has_500 = any(r.get('status') == 500 for r in results if 'status' in r)
    if has_500:
        print("\n[CRITICAL] 仍存在 500 錯誤！")
        print("500 錯誤的測試：")
        for r in results:
            if r.get('status') == 500:
                print(f"  - {r['name']}")

    # CORS 問題
    missing_cors = [r for r in results if not r.get('has_cors', True) and r.get('passed') == False]
    if missing_cors:
        print(f"\n[WARNING] 缺少 CORS headers 的測試：")
        for r in missing_cors:
            print(f"  - {r['name']}")

    # 失敗測試
    if failed_tests > 0:
        print(f"\n失敗的測試：")
        for r in results:
            if not r.get('passed', False):
                print(f"\n  [{results.index(r)+1}] {r['name']}")
                if 'status' in r:
                    print(f"      狀態: {r['status']}")
                if 'reasons' in r and r['reasons']:
                    print(f"      原因: {', '.join(r['reasons'])}")
                if 'error' in r:
                    print(f"      錯誤: {r['error']}")

    print("\n" + "=" * 80)

    # 退出碼
    if has_500:
        print("\n結論: CRITICAL - 存在 500 錯誤，必須修復")
        return 2
    elif failed_tests > 0:
        print("\n結論: WARNING - 部分測試失敗，建議修復")
        return 1
    else:
        print("\n結論: SUCCESS - 所有測試通過")
        return 0


if __name__ == '__main__':
    exit_code = main()
    exit(exit_code)
