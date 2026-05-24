import client from './client'
import type { RecurringTransaction, TransactionType } from '../types'

export const getRecurringTransactions = async (): Promise<RecurringTransaction[]> => {
  const { data } = await client.get('/recurring')
  return data.data ?? data
}

export const createRecurringTransaction = async (body: {
  name: string
  type: TransactionType
  categoryId: number
  paymentMethodId?: number
  amount: number
  description?: string
  dayOfMonth: number
  startDate: string
  endDate?: string
}): Promise<RecurringTransaction> => {
  const { data } = await client.post('/recurring', body)
  return data.data ?? data
}

export const updateRecurringTransaction = async (
  id: number,
  body: {
    name: string
    type: TransactionType
    categoryId: number
    paymentMethodId?: number
    amount: number
    description?: string
    dayOfMonth: number
    startDate: string
    endDate?: string
  }
): Promise<RecurringTransaction> => {
  const { data } = await client.put(`/recurring/${id}`, body)
  return data.data ?? data
}

export const deleteRecurringTransaction = async (id: number): Promise<void> => {
  await client.delete(`/recurring/${id}`)
}

export const toggleRecurringActive = async (id: number): Promise<RecurringTransaction> => {
  const { data } = await client.patch(`/recurring/${id}/toggle`)
  return data.data ?? data
}

export const applyRecurringThisMonth = async (id: number): Promise<void> => {
  await client.post(`/recurring/${id}/apply`)
}
