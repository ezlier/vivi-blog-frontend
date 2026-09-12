import api from './request'

// ── 笔记公开接口 ─────────────────────────────────────────────────
export const getEssays = (params?: Record<string, any>) =>
  api.get('essay/', { params })

export const getEssay = (slug: string) =>
  api.get('essay/slug', { params: { slug } })

// ── 笔记管理接口 ─────────────────────────────────────────────────
export const createEssay = (formData: FormData) =>
  api.post('essay/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateEssay = (slug: string, formData: FormData) => {
  if (!formData.has('slug')) {
    formData.append('slug', slug)
  }

  return api.put('essay/slug', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const batchDeleteEssays = (slugs: string[]) =>
  api.delete('essay/slug', { data: { slugs } })
