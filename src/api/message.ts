import api from './request'

interface MessageData {
  nickname?: string
  content?: string
  name?: string
  text?: string
  QQ?: string
  email?: string
}

// ── 公开接口 ─────────────────────────────────────────────────────
export const getMessages = (params?: Record<string, any>) =>
  api.get('message/', { params })

export const createMessage = (data: MessageData) =>
  api.post('message/', {
    nickname: data.nickname ?? data.name,
    email: data.email,
    QQ: data.QQ,
    content: data.content ?? data.text,
  })

// ── 管理接口 ─────────────────────────────────────────────────────
export const getAdminMessages = (params?: Record<string, any>) =>
  api.get('message/admin', { params })

export const deleteMessage = (id: number) =>
  api.delete('message/admin/', { data: { ids: [id] } })

export const batchDeleteMessages = (ids: number[]) =>
  api.delete('message/admin/', { data: { ids } })
