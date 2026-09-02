import api from './request'
import type { AxiosProgressEvent } from 'axios'

// ── 文章公开接口 ─────────────────────────────────────────────────
export const getArticles = (params?: Record<string, any>) =>
  api.get('articles/', { params })

export const getArticle = (slug: string) =>
  api.get(`articles/${slug}`)

// ── 文章管理接口 ─────────────────────────────────────────────────
export const createArticle = (formData: FormData) =>
  api.post('articles/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const uploadArticle = (formData: FormData, onProgress?: (e: AxiosProgressEvent) => void) =>
  api.post('articles/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  })

export const updateArticle = (slug: string, formData: FormData) => {
  if (!formData.has('slug')) {
    formData.append('slug', slug)
  }

  return api.put('articles/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const updateArticleStatus = (slug: string, isDraft: boolean) => {
  const formData = new FormData()
  formData.append('slug', slug)
  formData.append('is_draft', String(isDraft))

  return api.put('articles/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteArticle = (slug: string) =>
  api.delete('articles/', { data: { slugs: [slug] } })

export const batchDeleteArticles = (ids: Array<number | string>) =>
  api.delete('articles/', { data: { slugs: ids.map((id) => String(id)) } })
