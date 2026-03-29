const PREFIX = 'sgbd_'

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(PREFIX + key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable
  }
}

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}
