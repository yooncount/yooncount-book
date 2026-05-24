import client from './client'
import type { Category, TransactionType } from '../types'

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await client.get('/categories')
  return data.data ?? data
}

export const createCategory = async (body: { name: string; type: TransactionType }): Promise<Category> => {
  const { data } = await client.post('/categories', body)
  return data.data ?? data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await client.delete(`/categories/${id}`)
}
