import api from './request'

interface CommentData {
  nickname?: string
  content?: string
  name?: string
  text?: string
  QQ?: string
  email?: string
}

// ── 公开接口 ─────────────────────────────────────────────────────
export const getComments = (slug: string, params?: Record<string, any>) =>
  api.get(`comment/${slug}/`, { params })

export const createComment = (slug: string, data: CommentData) =>
  api.post(`comment/${slug}/`, {
    nickname: data.nickname ?? data.name,
    email: data.email,
    QQ: data.QQ,
    content: data.content ?? data.text,
  })

// ── 管理接口 ─────────────────────────────────────────────────────
export const getAdminComments = (params?: Record<string, any>) =>
  api.get('comment/admin', { params })

export const deleteComment = (id: number) =>
  api.delete('comment/', { data: { ids: [id] } })

export const batchDeleteComments = (ids: number[]) =>
  api.delete('comment/', { data: { ids } })
