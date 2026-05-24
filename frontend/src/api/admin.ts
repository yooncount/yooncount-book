import client from './client'
import type { UserRole } from '../types'

export interface AdminUserSummary {
  id: number
  email: string
  name: string
  role: UserRole
  createdAt: string
  lastLoginAt?: string
}

export interface AdminStats {
  totalUsers: number
  newUsers7d: number
  newUsers30d: number
  activeUsers30d: number
  totalTransactions: number
  totalErrors7d: number
}

export interface ErrorLogEntry {
  id: number
  occurredAt: string
  method?: string
  path?: string
  userId?: number
  message?: string
  stackTrace?: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const getAdminUsers = async (): Promise<AdminUserSummary[]> => {
  const { data } = await client.get('/admin/users')
  return data.data ?? data
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const { data } = await client.get('/admin/stats')
  return data.data ?? data
}

export const getErrorLogs = async (page = 0, size = 20): Promise<PagedResponse<ErrorLogEntry>> => {
  const { data } = await client.get('/admin/error-logs', { params: { page, size } })
  return data.data ?? data
}
