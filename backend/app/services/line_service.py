"""
LINE Messaging API 服務
"""
import os
import hmac
import hashlib
import base64
import requests
from flask import current_app
from app.utils.logger import get_logger

logger = get_logger('services.line_service')


LINE_API_BASE = 'https://api.line.me/v2'
LINE_API_DATA = 'https://api-data.line.me/v2'
LINE_API_MESSAGING = 'https://api.line.me/v2/bot'


def get_channel_token():
    return os.getenv('LINE_CHANNEL_ACCESS_TOKEN', '')


def get_channel_secret():
    return os.getenv('LINE_CHANNEL_SECRET', '')


def get_liff_id():
    return os.getenv('LINE_LIFF_ID', '')


def get_public_base_url():
    return os.getenv('PUBLIC_BASE_URL', 'http://localhost:5173')


def verify_signature(body, signature):
    """驗證 LINE webhook 簽章"""
    secret = get_channel_secret().encode('utf-8')
    hash_value = hmac.new(secret, body.encode('utf-8'), hashlib.sha256).digest()
    expected = base64.b64encode(hash_value).decode('utf-8')
    return hmac.compare_digest(expected, signature)


def _headers():
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {get_channel_token()}'
    }


# ===== 回覆訊息 =====

def reply_message(reply_token, messages):
    """回覆訊息（回覆用戶觸發的事件）"""
    if not isinstance(messages, list):
        messages = [messages]
    resp = requests.post(
        f'{LINE_API_MESSAGING}/message/reply',
        headers=_headers(),
        json={'replyToken': reply_token, 'messages': messages}
    )
    if not resp.ok:
        logger.error(f'[LINE] reply_message error: {resp.status_code} {resp.text}')
    return resp


def push_message(to, messages):
    """主動推播訊息給單一用戶"""
    if not isinstance(messages, list):
        messages = [messages]
    resp = requests.post(
        f'{LINE_API_MESSAGING}/message/push',
        headers=_headers(),
        json={'to': to, 'messages': messages}
    )
    if not resp.ok:
        logger.error(f'[LINE] push_message error: {resp.status_code} {resp.text}')
    return resp


def broadcast_message(messages):
    """群發訊息給所有好友"""
    if not isinstance(messages, list):
        messages = [messages]
    resp = requests.post(
        f'{LINE_API_MESSAGING}/message/broadcast',
        headers=_headers(),
        json={'messages': messages}
    )
    if not resp.ok:
        logger.error(f'[LINE] broadcast_message error: {resp.status_code} {resp.text}')
    return resp


def multicast_message(to_list, messages):
    """推播訊息給多個用戶"""
    if not isinstance(messages, list):
        messages = [messages]
    resp = requests.post(
        f'{LINE_API_MESSAGING}/message/multicast',
        headers=_headers(),
        json={'to': to_list, 'messages': messages}
    )
    if not resp.ok:
        logger.error(f'[LINE] multicast_message error: {resp.status_code} {resp.text}')
    return resp


# ===== 取得用戶資料 =====

def get_profile(user_id):
    """取得 LINE 用戶基本資料"""
    resp = requests.get(
        f'{LINE_API_MESSAGING}/profile/{user_id}',
        headers=_headers()
    )
    if resp.ok:
        return resp.json()
    logger.error(f'[LINE] get_profile error: {resp.status_code} {resp.text}')
    return None


# ===== 簡易訊息建構 =====

def text_message(text):
    """純文字訊息"""
    return {'type': 'text', 'text': text}
