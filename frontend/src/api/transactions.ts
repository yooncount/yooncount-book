import client from './client'
import type { Transaction, TransactionCreateRequest } from '../types'

export const getTransactions = async (params: {
  year: number
  month: number
  type?: string
  categoryId?: number
}): Promise<Transaction[]> => {
  const { data } = await client.get('/transactions', { params })
  return data.data ?? data
}

export const createTransaction = async (body: TransactionCreateRequest): Promise<Transaction> => {
  const { data } = await client.post('/transactions', body)
  return data.data ?? data
}

export const updateTransaction = async (id: number, body: TransactionCreateRequest): Promise<Transaction> => {
  const { data } = await client.put(`/transactions/${id}`, body)
  return data.data ?? data
}

export const deleteTransaction = async (id: number): Promise<void> => {
  await client.delete(`/transactions/${id}`)
}
