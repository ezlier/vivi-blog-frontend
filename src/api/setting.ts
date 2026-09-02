import api from './request'

// ── 站点设置 ─────────────────────────────────────────────────────
export const getWebSetting = () =>
  api.get('setting/')

export const updateWebSetting = (formData: FormData) =>
  api.put('setting/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
