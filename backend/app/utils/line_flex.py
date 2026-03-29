"""
LINE Flex Message 模板
"""
import os


def get_liff_url(path=''):
    liff_id = os.getenv('LINE_LIFF_ID', '')
    return f'https://liff.line.me/{liff_id}{path}'


def welcome_message(temple_name='白河三官寶殿'):
    """加好友歡迎訊息"""
    return {
        'type': 'flex',
        'altText': f'歡迎加入{temple_name}！',
        'contents': {
            'type': 'bubble',
            'hero': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'text',
                        'text': '☯',
                        'size': '3xl',
                        'align': 'center',
                        'margin': 'lg',
                    },
                    {
                        'type': 'text',
                        'text': temple_name,
                        'weight': 'bold',
                        'size': 'xl',
                        'align': 'center',
                        'margin': 'md',
                        'color': '#D4A574',
                    },
                ],
                'paddingAll': '20px',
                'backgroundColor': '#1a1a2e',
            },
            'body': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'text',
                        'text': '感謝您加入我們！',
                        'weight': 'bold',
                        'size': 'md',
                        'color': '#FFFFFF',
                    },
                    {
                        'type': 'text',
                        'text': '您可以透過下方選單進行活動報名、查詢報名紀錄等服務。',
                        'size': 'sm',
                        'color': '#AAAAAA',
                        'margin': 'md',
                        'wrap': True,
                    },
                    {
                        'type': 'separator',
                        'margin': 'lg',
                        'color': '#333333',
                    },
                    {
                        'type': 'text',
                        'text': '天官賜福 · 地官赦罪 · 水官解厄',
                        'size': 'xs',
                        'color': '#D4A574',
                        'align': 'center',
                        'margin': 'lg',
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '20px',
            },
            'footer': {
                'type': 'box',
                'layout': 'horizontal',
                'spacing': 'sm',
                'contents': [
                    {
                        'type': 'button',
                        'style': 'primary',
                        'color': '#D4A574',
                        'action': {
                            'type': 'uri',
                            'label': '活動報名',
                            'uri': get_liff_url('/events'),
                        },
                    },
                    {
                        'type': 'button',
                        'style': 'secondary',
                        'color': '#333333',
                        'action': {
                            'type': 'postback',
                            'label': '查詢報名',
                            'data': 'action=my_registrations',
                        },
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '10px',
            },
        },
    }


def event_list_message(events):
    """活動列表 Flex Message（Carousel）"""
    if not events:
        return {
            'type': 'text',
            'text': '目前沒有開放報名的活動，請稍後再查詢。',
        }

    bubbles = []
    for event in events[:10]:  # LINE carousel 最多 10 個
        start_at = event.get('startAt', '')[:10] if event.get('startAt') else '未定'
        location = event.get('location', '未定')
        capacity = event.get('capacity', 0)
        registered = event.get('registeredCount', 0)
        remaining = capacity - registered if capacity > 0 else '不限'

        bubble = {
            'type': 'bubble',
            'size': 'kilo',
            'body': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'text',
                        'text': event['title'],
                        'weight': 'bold',
                        'size': 'md',
                        'color': '#D4A574',
                        'wrap': True,
                        'maxLines': 2,
                    },
                    {
                        'type': 'box',
                        'layout': 'vertical',
                        'margin': 'lg',
                        'spacing': 'sm',
                        'contents': [
                            _info_row('日期', start_at),
                            _info_row('地點', location),
                            _info_row('剩餘', f'{remaining} 名' if isinstance(remaining, int) else remaining),
                        ],
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '16px',
            },
            'footer': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'button',
                        'style': 'primary',
                        'color': '#D4A574',
                        'action': {
                            'type': 'uri',
                            'label': '我要報名',
                            'uri': get_liff_url(f'/events/{event["id"]}/register'),
                        },
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '10px',
            },
        }
        bubbles.append(bubble)

    return {
        'type': 'flex',
        'altText': f'共 {len(bubbles)} 個活動開放報名',
        'contents': {
            'type': 'carousel',
            'contents': bubbles,
        },
    }


def registration_confirm_message(registration, event):
    """報名成功確認 Flex Message"""
    start_at = event.get('startAt', '')[:16].replace('T', ' ') if event.get('startAt') else '未定'

    return {
        'type': 'flex',
        'altText': f'報名成功！{event.get("title", "活動")}',
        'contents': {
            'type': 'bubble',
            'body': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'box',
                        'layout': 'horizontal',
                        'contents': [
                            {
                                'type': 'text',
                                'text': '✅',
                                'size': 'xl',
                                'flex': 0,
                            },
                            {
                                'type': 'text',
                                'text': '報名成功！',
                                'weight': 'bold',
                                'size': 'lg',
                                'color': '#FFFFFF',
                                'margin': 'sm',
                            },
                        ],
                    },
                    {
                        'type': 'separator',
                        'margin': 'lg',
                        'color': '#333333',
                    },
                    {
                        'type': 'box',
                        'layout': 'vertical',
                        'margin': 'lg',
                        'spacing': 'md',
                        'contents': [
                            _info_row('活動', event.get('title', '')),
                            _info_row('時間', start_at),
                            _info_row('地點', event.get('location', '')),
                            _info_row('姓名', registration.get('name', '')),
                            _info_row('人數', f'{registration.get("peopleCount", 1)} 人'),
                            _info_row('狀態', '待確認'),
                        ],
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '20px',
            },
            'footer': {
                'type': 'box',
                'layout': 'horizontal',
                'spacing': 'sm',
                'contents': [
                    {
                        'type': 'button',
                        'style': 'primary',
                        'color': '#D4A574',
                        'action': {
                            'type': 'postback',
                            'label': '查看報名',
                            'data': 'action=my_registrations',
                        },
                    },
                    {
                        'type': 'button',
                        'style': 'secondary',
                        'color': '#333333',
                        'action': {
                            'type': 'postback',
                            'label': '取消報名',
                            'data': f'action=cancel_registration&id={registration.get("id", "")}',
                        },
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '10px',
            },
        },
    }


def registration_list_message(registrations):
    """個人報名紀錄列表"""
    if not registrations:
        return {
            'type': 'text',
            'text': '您目前沒有報名紀錄。',
        }

    status_map = {
        'registered': '✅ 已報名',
        'confirmed': '🎉 已確認',
        'canceled': '❌ 已取消',
        'waitlist': '⏳ 候補中',
    }

    bubbles = []
    for reg in registrations[:10]:
        event = reg.get('event', {})
        start_at = event.get('startAt', '')[:10] if event.get('startAt') else '未定'
        status_text = status_map.get(reg.get('status', ''), reg.get('status', ''))

        bubble = {
            'type': 'bubble',
            'size': 'kilo',
            'body': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'text',
                        'text': event.get('title', '活動'),
                        'weight': 'bold',
                        'size': 'md',
                        'color': '#D4A574',
                        'wrap': True,
                        'maxLines': 2,
                    },
                    {
                        'type': 'box',
                        'layout': 'vertical',
                        'margin': 'lg',
                        'spacing': 'sm',
                        'contents': [
                            _info_row('日期', start_at),
                            _info_row('人數', f'{reg.get("peopleCount", 1)} 人'),
                            _info_row('狀態', status_text),
                        ],
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '16px',
            },
        }

        # 只有未取消的才顯示取消按鈕
        if reg.get('status') not in ['canceled']:
            bubble['footer'] = {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'button',
                        'style': 'secondary',
                        'color': '#333333',
                        'action': {
                            'type': 'postback',
                            'label': '取消報名',
                            'data': f'action=cancel_registration&id={reg.get("id", "")}',
                        },
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '10px',
            }

        bubbles.append(bubble)

    return {
        'type': 'flex',
        'altText': f'您有 {len(bubbles)} 筆報名紀錄',
        'contents': {
            'type': 'carousel',
            'contents': bubbles,
        },
    }


def registration_canceled_message(event_title):
    """取消報名確認訊息"""
    return {
        'type': 'text',
        'text': f'已取消「{event_title}」的報名。\n如需重新報名，請點選下方選單的「活動報名」。',
    }


def status_changed_message(registration, event, new_status):
    """後台狀態變更通知"""
    status_map = {
        'registered': '已報名',
        'confirmed': '已確認',
        'canceled': '已取消',
        'waitlist': '候補中',
    }
    status_text = status_map.get(new_status, new_status)
    start_at = event.get('startAt', '')[:16].replace('T', ' ') if event.get('startAt') else '未定'

    icon = '🎉' if new_status == 'confirmed' else '📋'

    return {
        'type': 'flex',
        'altText': f'{icon} 報名狀態更新：{status_text}',
        'contents': {
            'type': 'bubble',
            'body': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'text',
                        'text': f'{icon} 報名狀態更新',
                        'weight': 'bold',
                        'size': 'lg',
                        'color': '#FFFFFF',
                    },
                    {
                        'type': 'separator',
                        'margin': 'lg',
                        'color': '#333333',
                    },
                    {
                        'type': 'box',
                        'layout': 'vertical',
                        'margin': 'lg',
                        'spacing': 'md',
                        'contents': [
                            _info_row('活動', event.get('title', '')),
                            _info_row('時間', start_at),
                            _info_row('新狀態', status_text),
                        ],
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '20px',
            },
        },
    }


def event_reminder_message(event, registration):
    """活動提醒訊息（活動前 1 天）"""
    start_at = event.get('startAt', '')[:16].replace('T', ' ') if event.get('startAt') else '未定'

    return {
        'type': 'flex',
        'altText': f'🔔 活動提醒：{event.get("title", "")}',
        'contents': {
            'type': 'bubble',
            'body': {
                'type': 'box',
                'layout': 'vertical',
                'contents': [
                    {
                        'type': 'text',
                        'text': '🔔 活動提醒',
                        'weight': 'bold',
                        'size': 'lg',
                        'color': '#D4A574',
                    },
                    {
                        'type': 'text',
                        'text': f'您報名的「{event.get("title", "")}」將於明天舉行！',
                        'size': 'sm',
                        'color': '#FFFFFF',
                        'margin': 'md',
                        'wrap': True,
                    },
                    {
                        'type': 'separator',
                        'margin': 'lg',
                        'color': '#333333',
                    },
                    {
                        'type': 'box',
                        'layout': 'vertical',
                        'margin': 'lg',
                        'spacing': 'md',
                        'contents': [
                            _info_row('時間', start_at),
                            _info_row('地點', event.get('location', '')),
                            _info_row('人數', f'{registration.get("peopleCount", 1)} 人'),
                        ],
                    },
                ],
                'backgroundColor': '#16213e',
                'paddingAll': '20px',
            },
        },
    }


def temple_notification_message(title, content, image_url=None, action_url=None):
    """廟方自訂推播通知 Flex Message"""
    body_contents = [
        {
            'type': 'text',
            'text': title,
            'weight': 'bold',
            'size': 'lg',
            'color': '#D4A574',
            'wrap': True,
        },
        {
            'type': 'separator',
            'margin': 'lg',
            'color': '#333333',
        },
        {
            'type': 'text',
            'text': content,
            'size': 'sm',
            'color': '#EEEEEE',
            'margin': 'lg',
            'wrap': True,
        },
    ]

    bubble = {
        'type': 'bubble',
        'body': {
            'type': 'box',
            'layout': 'vertical',
            'contents': body_contents,
            'backgroundColor': '#16213e',
            'paddingAll': '20px',
        },
    }

    if image_url:
        bubble['hero'] = {
            'type': 'image',
            'url': image_url,
            'size': 'full',
            'aspectRatio': '20:13',
            'aspectMode': 'cover',
        }

    if action_url:
        bubble['footer'] = {
            'type': 'box',
            'layout': 'vertical',
            'contents': [
                {
                    'type': 'button',
                    'style': 'primary',
                    'color': '#D4A574',
                    'action': {
                        'type': 'uri',
                        'label': '查看詳情',
                        'uri': action_url,
                    },
                },
            ],
            'backgroundColor': '#16213e',
            'paddingAll': '10px',
        }

    return {
        'type': 'flex',
        'altText': title,
        'contents': bubble,
    }


def _info_row(label, value):
    """Flex Message 資訊列（label: value）"""
    return {
        'type': 'box',
        'layout': 'horizontal',
        'contents': [
            {
                'type': 'text',
                'text': label,
                'size': 'sm',
                'color': '#999999',
                'flex': 2,
            },
            {
                'type': 'text',
                'text': str(value),
                'size': 'sm',
                'color': '#EEEEEE',
                'flex': 5,
                'wrap': True,
            },
        ],
    }
