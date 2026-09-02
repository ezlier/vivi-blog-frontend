import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { updateUser as updateUserApi } from '@/api/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('access_token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const isLoggedIn = computed(() => !!token.value)

  async function login(usernameVal: string, password: string) {
    const res = await loginApi(usernameVal, password)
    const data = res.data.data
    token.value = data.access_token
    refreshToken.value = data.refresh_token
    username.value = data.user
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('username', data.user)
    ElMessage.success('登录成功')
    router.push('/admin/dashboard')
  }

  async function updateUser(data: { username?: string; old_password?: string; new_password?: string }) {
    await updateUserApi(data)
    if (data.username) {
      username.value = data.username
      localStorage.setItem('username', data.username)
    }
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      token.value = ''
      refreshToken.value = ''
      username.value = ''
      localStorage.clear()
      router.push('/login')
    }
  }

  return { token, refreshToken, username, isLoggedIn, login, updateUser, logout }
})
