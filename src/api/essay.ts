import api from './request'

// ── 笔记公开接口 ─────────────────────────────────────────────────
export const getEssays = (params?: Record<string, any>) =>
  api.get('essay/', { params })

// ── 笔记管理接口 ─────────────────────────────────────────────────
export const createEssay = (formData: FormData) =>
  api.post('essay/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const batchDeleteEssays = (slugs: string[]) =>
  api.delete('essay/slug', { data: { slugs } })
