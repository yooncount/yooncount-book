import client from './client'
import type { BudgetResponse } from '../types'

export const getBudgets = async (year: number, month: number): Promise<BudgetResponse[]> => {
  const { data } = await client.get('/budgets', { params: { year, month } })
  return data.data ?? data
}

export const createBudget = async (body: {
  categoryId: number
  year: number
  month: number
  budgetAmount: number
}): Promise<BudgetResponse> => {
  const { data } = await client.post('/budgets', body)
  return data.data ?? data
}

export const deleteBudget = async (id: number): Promise<void> => {
  await client.delete(`/budgets/${id}`)
}
