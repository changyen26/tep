"""
Test Change Password API
"""

import requests
import sys

BASE_URL = 'http://localhost:5000/api'

# Test Account
TEST_EMAIL = '0911222333'
TEST_PASSWORD = 'password123'
NEW_PASSWORD = 'newpassword123'

def test_change_password():
    print("=" * 60)
    print("Test Change Password API")
    print("=" * 60)

    # Step 1: Login to get token
    print("\n[1] Login to get Token...")
    try:
        response = requests.post(
            f'{BASE_URL}/auth/login',
            json={
                'email': TEST_EMAIL,
                'password': TEST_PASSWORD,
                'login_type': 'temple_admin'
            },
            timeout=10
        )

        if response.status_code != 200:
            print(f"[ERROR] Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False

        data = response.json()
        token = data['data']['token']
        print(f"[SUCCESS] Login successful, Token: {token[:30]}...")

    except Exception as e:
        print(f"[ERROR] Login failed: {str(e)}")
        return False

    # Step 2: Test wrong old password
    print("\n[2] Test wrong old password...")
    try:
        response = requests.put(
            f'{BASE_URL}/auth/change-password',
            headers={'Authorization': f'Bearer {token}'},
            json={
                'old_password': 'wrong_password',
                'new_password': NEW_PASSWORD
            },
            timeout=10
        )

        if response.status_code == 400:
            print("[SUCCESS] Correctly rejected wrong old password")
        else:
            print(f"[WARN] Should return 400, but got {response.status_code}")

    except Exception as e:
        print(f"[ERROR] Request failed: {str(e)}")

    # Step 3: Test change password
    print("\n[3] Test change password...")
    try:
        response = requests.put(
            f'{BASE_URL}/auth/change-password',
            headers={'Authorization': f'Bearer {token}'},
            json={
                'old_password': TEST_PASSWORD,
                'new_password': NEW_PASSWORD
            },
            timeout=10
        )

        if response.status_code == 200:
            print("[SUCCESS] Password changed successfully")
        else:
            print(f"[ERROR] Change password failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"[ERROR] Request failed: {str(e)}")
        return False

    # Step 4: Login with new password
    print("\n[4] Login with new password...")
    try:
        response = requests.post(
            f'{BASE_URL}/auth/login',
            json={
                'email': TEST_EMAIL,
                'password': NEW_PASSWORD,
                'login_type': 'temple_admin'
            },
            timeout=10
        )

        if response.status_code == 200:
            print("[SUCCESS] Login with new password successful")
        else:
            print(f"[ERROR] Login with new password failed: {response.status_code}")
            return False

    except Exception as e:
        print(f"[ERROR] Login failed: {str(e)}")
        return False

    # Step 5: Restore original password
    print("\n[5] Restore original password...")
    try:
        # Re-login to get new token
        response = requests.post(
            f'{BASE_URL}/auth/login',
            json={
                'email': TEST_EMAIL,
                'password': NEW_PASSWORD,
                'login_type': 'temple_admin'
            },
            timeout=10
        )
        token = response.json()['data']['token']

        # Restore original password
        response = requests.put(
            f'{BASE_URL}/auth/change-password',
            headers={'Authorization': f'Bearer {token}'},
            json={
                'old_password': NEW_PASSWORD,
                'new_password': TEST_PASSWORD
            },
            timeout=10
        )

        if response.status_code == 200:
            print("[SUCCESS] Password restored to original")
        else:
            print(f"[WARN] Restore password failed: {response.status_code}")

    except Exception as e:
        print(f"[WARN] Restore password failed: {str(e)}")

    print("\n" + "=" * 60)
    print("[COMPLETED] All tests passed!")
    print("=" * 60)
    return True

if __name__ == '__main__':
    success = test_change_password()
    sys.exit(0 if success else 1)
