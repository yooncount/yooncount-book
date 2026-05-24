import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import type { LoginRequest, SignupRequest, User } from '../types'
import { clearAuth, getStoredUser, getToken, setAuth, setStoredUser } from './storage'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (req: LoginRequest) => Promise<void>
  signup: (req: SignupRequest) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState<boolean>(() => !!getToken() && !getStoredUser())

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return
    }
    try {
      const me = await authApi.getMe()
      setStoredUser(me)
      setUser(me)
    } catch {
      clearAuth()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (getToken() && !user) {
      setIsLoading(true)
      refresh().finally(() => setIsLoading(false))
    }
  }, [refresh, user])

  const login = useCallback(async (req: LoginRequest) => {
    const res = await authApi.login(req)
    setAuth(res.token, res.user)
    setUser(res.user)
  }, [])

  const signup = useCallback(async (req: SignupRequest) => {
    const res = await authApi.signup(req)
    setAuth(res.token, res.user)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
