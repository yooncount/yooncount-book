import type { User } from '../types'

const TOKEN_KEY = 'yooncount.token'
const USER_KEY = 'yooncount.user'

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const setAuth = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
