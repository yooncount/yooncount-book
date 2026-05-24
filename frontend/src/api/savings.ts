import client from './client'
import type { SavingsGoal } from '../types'

export const getSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const { data } = await client.get('/savings-goals')
  return data.data ?? data
}

export const createSavingsGoal = async (body: {
  name: string
  targetAmount: number
  targetDate: string
  memo?: string
}): Promise<SavingsGoal> => {
  const { data } = await client.post('/savings-goals', body)
  return data.data ?? data
}

export const updateSavingsGoal = async (
  id: number,
  body: {
    name: string
    targetAmount: number
    targetDate: string
    memo?: string
  }
): Promise<SavingsGoal> => {
  const { data } = await client.put(`/savings-goals/${id}`, body)
  return data.data ?? data
}

export const deleteSavingsGoal = async (id: number): Promise<void> => {
  await client.delete(`/savings-goals/${id}`)
}

export const depositSavingsGoal = async (id: number, amount: number): Promise<SavingsGoal> => {
  const { data } = await client.post(`/savings-goals/${id}/deposit`, { amount })
  return data.data ?? data
}

export const toggleSavingsGoalComplete = async (id: number): Promise<SavingsGoal> => {
  const { data } = await client.patch(`/savings-goals/${id}/toggle-complete`)
  return data.data ?? data
}
