const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const TEMPLE_ID = import.meta.env.VITE_TEMPLE_ID || '1'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '1',
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || '請求失敗')
  }
  return data
}

// 活動列表（公開、報名中）
export function fetchEvents() {
  return request(`/public/temples/${TEMPLE_ID}/events`)
}

// 單一活動詳情
export function fetchEvent(eventId) {
  return request(`/public/events/${eventId}`)
}

// 提交報名
export function submitRegistration(eventId, body) {
  return request(`/public/events/${eventId}/register`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// 查詢個人報名紀錄
export function fetchMyRegistrations(lineUid) {
  return request(`/public/registrations?line_uid=${encodeURIComponent(lineUid)}`)
}

// 取消報名
export function cancelRegistration(registrationId, lineUserId) {
  return request(`/public/registrations/${registrationId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ lineUserId }),
  })
}
