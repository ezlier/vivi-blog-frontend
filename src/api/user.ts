import api from './request'

// ── 用户 ─────────────────────────────────────────────────────────
export const updateUser = (data: { username?: string; old_password?: string; new_password?: string }) => {
  const formData = new FormData()

  if (data.username) {
    formData.append('newName', data.username)
  }
  if (data.old_password) {
    formData.append('pwd', data.old_password)
  }
  if (data.new_password) {
    formData.append('newPwd', data.new_password)
  }

  return api.post('user/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
