import api from './request'

// ── 登录 ─────────────────────────────────────────────────────────
export const login = (username: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  return api.post('auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

// ── Token 刷新 ───────────────────────────────────────────────────
export const refreshToken = (refresh: string) =>
  api.post('auth/refresh', { refresh_token: refresh })

// ── 退出登录 ─────────────────────────────────────────────────────
export const logout = () =>
  api.post('auth/logout')
