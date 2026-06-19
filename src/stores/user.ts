import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../../shared/types'
import { login as apiLogin, logout as apiLogout, getProfile } from '@/api/auth'
import type { LoginParams, RegisterParams } from '../../shared/types'
import { register as apiRegister } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isExpert = computed(() => userInfo.value?.isExpert ?? false)
  const isTrusted = computed(() => userInfo.value?.isTrusted ?? false)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const isModerator = computed(() => userInfo.value?.role === 'moderator')
  const canManageEssence = computed(() => isAdmin.value || isModerator.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(user: User) {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  function clearAuth() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  function initFromStorage() {
    const stored = localStorage.getItem('userInfo')
    if (stored) {
      try {
        userInfo.value = JSON.parse(stored)
      } catch {
        userInfo.value = null
      }
    }
  }

  async function login(params: LoginParams) {
    const res = await apiLogin(params)
    setToken(res.token)
    setUserInfo(res.user)
    return res
  }

  async function register(params: RegisterParams) {
    const res = await apiRegister(params)
    setToken(res.token)
    setUserInfo(res.user)
    return res
  }

  async function logout() {
    try {
      await apiLogout()
    } finally {
      clearAuth()
    }
  }

  async function fetchProfile() {
    const user = await getProfile()
    setUserInfo(user)
    return user
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isExpert,
    isTrusted,
    isAdmin,
    isModerator,
    canManageEssence,
    login,
    register,
    logout,
    fetchProfile,
    initFromStorage,
    setToken,
    setUserInfo,
    clearAuth,
  }
})
