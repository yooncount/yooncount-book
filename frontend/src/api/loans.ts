import client from './client'
import type { LoanResponse } from '../types'

export const getLoans = async (): Promise<LoanResponse[]> => {
  const { data } = await client.get('/loans')
  return data.data ?? data
}

export const createLoan = async (body: {
  name: string
  lender?: string
  principal: number
  remainingBalance: number
  interestRate?: number
  startDate: string
  endDate?: string
  includeInAssets: boolean
  memo?: string
}): Promise<LoanResponse> => {
  const { data } = await client.post('/loans', body)
  return data.data ?? data
}

export const updateLoan = async (
  id: number,
  body: {
    name: string
    lender?: string
    principal: number
    remainingBalance: number
    interestRate?: number
    startDate: string
    endDate?: string
    includeInAssets: boolean
    memo?: string
  }
): Promise<LoanResponse> => {
  const { data } = await client.put(`/loans/${id}`, body)
  return data.data ?? data
}

export const deleteLoan = async (id: number): Promise<void> => {
  await client.delete(`/loans/${id}`)
}

export const toggleLoanInclude = async (id: number): Promise<LoanResponse> => {
  const { data } = await client.patch(`/loans/${id}/toggle-include`)
  return data.data ?? data
}
