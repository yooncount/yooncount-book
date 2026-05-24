import client from './client'
import type { PaymentMethod, PaymentMethodStats, PaymentMethodType } from '../types'

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const { data } = await client.get('/payment-methods')
  return data.data ?? data
}

export const createPaymentMethod = async (body: {
  name: string
  type: PaymentMethodType
}): Promise<PaymentMethod> => {
  const { data } = await client.post('/payment-methods', body)
  return data.data ?? data
}

export const updatePaymentMethod = async (
  id: number,
  body: { name: string; type: PaymentMethodType }
): Promise<PaymentMethod> => {
  const { data } = await client.put(`/payment-methods/${id}`, body)
  return data.data ?? data
}

export const deletePaymentMethod = async (id: number): Promise<void> => {
  await client.delete(`/payment-methods/${id}`)
}

export const getPaymentMethodStats = async (year: number, month: number): Promise<PaymentMethodStats[]> => {
  const { data } = await client.get('/payment-methods/stats', { params: { year, month } })
  return data.data ?? data
}
