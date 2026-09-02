import api from './request'

// ── 标签公开接口 ─────────────────────────────────────────────────
export const getTags = (params?: Record<string, any>) =>
  api.get('tags', { params })

export const createTag = (name: string) =>
  api.post('tags', { name })

export const updateTag = (id: number, name: string) =>
  api.put(`tags/${id}`, { name })

export const deleteTag = (id: number) =>
  api.delete(`tags/${id}`)
