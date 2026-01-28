"""
Temple Admin API Validation Script
===================================
Tests all temple-admin endpoints for:
1. OPTIONS preflight (204 + CORS)
2. Without token (401 JSON)
3. With token (200/403 JSON, never 500)
"""

import requests
import json
import os
import sys
from datetime import datetime

# Configuration
BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000/api')
TEMPLE_ADMIN_EMAIL = os.getenv('TEMPLE_ADMIN_EMAIL', '0911222333')
TEMPLE_ADMIN_PASSWORD = os.getenv('TEMPLE_ADMIN_PASSWORD', 'password123')
TEMPLE_ID = int(os.getenv('TEMPLE_ID', '5'))
CORS_ORIGIN = 'http://localhost:5173'

# Test results
results = []
total_tests = 0
passed_tests = 0
failed_tests = 0


def print_section(title):
    """Print section header"""
    print(f"\n{'=' * 80}")
    print(f" {title}")
    print('=' * 80)


def login():
    """Login to get temple_admin token"""
    print("\n[LOGIN] Getting temple_admin token...")
    try:
        response = requests.post(
            f'{BASE_URL}/auth/login',
            json={
                'email': TEMPLE_ADMIN_EMAIL,
                'password': TEMPLE_ADMIN_PASSWORD,
                'login_type': 'temple_admin'
            },
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data', {}).get('token'):
                token = data['data']['token']
                print(f"  [OK] Login successful")
                return token
            else:
                print(f"  [FAIL] Login failed: {data.get('message', 'Unknown error')}")
                return None
        else:
            print(f"  [FAIL] Login failed (HTTP {response.status_code})")
            print(f"     Response: {response.text[:300]}")
            return None

    except Exception as e:
        print(f"  [ERROR] Login error: {e}")
        return None


def test_endpoint(name, method, path, headers=None, expected_status=None, check_cors=True):
    """
    Test single endpoint

    Args:
        name: Test name
        method: HTTP method
        path: API path (relative to BASE_URL)
        headers: Request headers
        expected_status: Expected status code (can be list)
        check_cors: Whether to check CORS headers
    """
    global total_tests, passed_tests, failed_tests

    total_tests += 1
    url = f"{BASE_URL}/{path.lstrip('/')}"

    print(f"\n[{total_tests}] {name}")
    print(f"    {method} {path}")

    try:
        response = requests.request(method, url, headers=headers, timeout=10)
        status = response.status_code

        # Parse response
        try:
            body = response.json()
            is_json = True
        except:
            body = response.text
            is_json = False

        # Check CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        has_cors = cors_headers['Access-Control-Allow-Origin'] is not None

        # Determine pass/fail
        passed = True
        reasons = []

        # Check status code
        if expected_status:
            if isinstance(expected_status, list):
                if status not in expected_status:
                    passed = False
                    reasons.append(f"Status {status} not in expected {expected_status}")
            else:
                if status != expected_status:
                    passed = False
                    reasons.append(f"Status {status} != {expected_status}")

        # Must not be 500
        if status == 500:
            passed = False
            reasons.append("500 error (critical)")

        # Check CORS (if needed)
        if check_cors and not has_cors:
            passed = False
            reasons.append("Missing CORS headers")

        # Check JSON format (non-OPTIONS)
        if method != 'OPTIONS' and status >= 400 and not is_json:
            passed = False
            reasons.append("Error response is not JSON")

        # Update statistics
        if passed:
            passed_tests += 1
            print(f"    [PASS] {status}")
        else:
            failed_tests += 1
            print(f"    [FAIL] {status} - {', '.join(reasons)}")

        # Show details (if failed or 500)
        if not passed or status >= 500:
            print(f"    CORS: {cors_headers['Access-Control-Allow-Origin'] or 'None'}")
            if is_json:
                print(f"    Body: {json.dumps(body, ensure_ascii=False, indent=6)[:300]}")
            else:
                print(f"    Body: {body[:300]}")

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
        print("    [ERROR] Cannot connect to backend (is it running?)")
        failed_tests += 1
        results.append({'name': name, 'passed': False, 'error': 'Connection refused'})
        return False

    except Exception as e:
        print(f"    [ERROR] {e}")
        failed_tests += 1
        results.append({'name': name, 'passed': False, 'error': str(e)})
        return False


def main():
    """Main test flow"""
    print("=" * 80)
    print(" Temple Admin API Validation")
    print(" Execution time:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 80)

    # ====================================
    # Step 1: Login to get token
    # ====================================
    token = login()

    if not token:
        print("\n[CRITICAL] Cannot get token, some tests will be skipped")
        print("Please verify:")
        print("  1. Backend service is running")
        print("  2. Test account exists and is correct")
        print("  3. Test account is temple_admin with temple_id=5")

    headers_with_token = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    } if token else None

    headers_without_token = {
        'Content-Type': 'application/json'
    }

    # ====================================
    # Test 1: OPTIONS Preflight (must pass)
    # ====================================
    print_section("Test 1: OPTIONS Preflight (must return 204 + CORS)")

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id",
        "OPTIONS",
        f"temple-admin/temples/{TEMPLE_ID}",
        headers={'Origin': CORS_ORIGIN},
        expected_status=204
    )

    test_endpoint(
        "OPTIONS /temple-admin/temples/:id/stats",
        "OPTIONS",
        f"temple-admin/temples/{TEMPLE_ID}/stats",
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
        "OPTIONS /temple-admin/temples/:id/pilgrimage-visits",
        "OPTIONS",
        f"temple-admin/temples/{TEMPLE_ID}/pilgrimage-visits",
        headers={'Origin': CORS_ORIGIN},
        expected_status=204
    )

    # ====================================
    # Test 2: Without Token (must return 401, not 500)
    # ====================================
    print_section("Test 2: Without Token (must return 401, not 500)")

    endpoints_to_test = [
        f"temple-admin/temples/{TEMPLE_ID}",
        f"temple-admin/temples/{TEMPLE_ID}/stats",
        f"temple-admin/temples/{TEMPLE_ID}/products",
        f"temple-admin/temples/{TEMPLE_ID}/orders",
        f"temple-admin/temples/{TEMPLE_ID}/checkins",
        f"temple-admin/temples/{TEMPLE_ID}/revenue",
        f"temple-admin/temples/{TEMPLE_ID}/devotees",
        f"temple-admin/temples/{TEMPLE_ID}/pilgrimage-visits",
    ]

    for endpoint in endpoints_to_test:
        test_endpoint(
            f"GET {endpoint} (without token)",
            "GET",
            endpoint,
            headers=headers_without_token,
            expected_status=401
        )

    # ====================================
    # Test 3: With Token (must return 200/403, not 500)
    # ====================================
    if token:
        print_section("Test 3: With Token (200/403, not 500)")

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}",
            headers=headers_with_token,
            expected_status=[200, 403]
        )

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}/stats",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}/stats",
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

        test_endpoint(
            f"GET /temple-admin/temples/{TEMPLE_ID}/pilgrimage-visits",
            "GET",
            f"temple-admin/temples/{TEMPLE_ID}/pilgrimage-visits",
            headers=headers_with_token,
            expected_status=[200, 403]
        )

    # ====================================
    # Test Summary
    # ====================================
    print_section("Test Summary")

    print(f"\nTotal tests: {total_tests}")
    print(f"Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
    print(f"Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")

    # 500 errors (critical issue)
    has_500 = any(r.get('status') == 500 for r in results if 'status' in r)
    if has_500:
        print("\n[CRITICAL] 500 errors still exist!")
        print("Tests with 500 errors:")
        for r in results:
            if r.get('status') == 500:
                print(f"  - {r['name']}")

    # CORS issues
    missing_cors = [r for r in results if not r.get('has_cors', True) and r.get('passed') == False]
    if missing_cors:
        print(f"\n[WARNING] Tests with missing CORS headers:")
        for r in missing_cors:
            print(f"  - {r['name']}")

    # Failed tests
    if failed_tests > 0:
        print(f"\nFailed tests:")
        for r in results:
            if not r.get('passed', False):
                print(f"\n  [{results.index(r)+1}] {r['name']}")
                if 'status' in r:
                    print(f"      Status: {r['status']}")
                if 'reasons' in r and r['reasons']:
                    print(f"      Reasons: {', '.join(r['reasons'])}")
                if 'error' in r:
                    print(f"      Error: {r['error']}")

    print("\n" + "=" * 80)

    # Exit code
    if has_500:
        print("\nConclusion: CRITICAL - 500 errors exist, must fix")
        return 2
    elif failed_tests > 0:
        print("\nConclusion: WARNING - Some tests failed, recommend fixing")
        return 1
    else:
        print("\nConclusion: SUCCESS - All tests passed")
        return 0


if __name__ == '__main__':
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(130)
